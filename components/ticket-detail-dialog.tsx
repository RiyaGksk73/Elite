"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, ThumbsUp, ThumbsDown, Send, User } from "lucide-react"
import { DatabaseService } from "@/lib/database"

interface Comment {
  id: string
  content: string
  author: string
  author_role: string
  created_at: string
}

interface Ticket {
  id: string
  subject: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  category: string
  created_by: string
  assigned_to?: string
  created_at: string
  updated_at: string
  votes: number
  comments_count: number
}

interface TicketDetailDialogProps {
  ticket: Ticket
  open: boolean
  onOpenChange: (open: boolean) => void
  onTicketUpdated: (ticket: Ticket) => void
  isAgent?: boolean
}

const mockComments: Comment[] = [
  {
    id: "1",
    content:
      "I'm experiencing this issue on both Chrome and Firefox browsers. The error appears immediately after clicking the login button.",
    author: "John Doe",
    author_role: "end_user",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    content:
      "Thank you for the additional details. I'm looking into this issue now. Can you please try clearing your browser cache and cookies?",
    author: "Support Agent",
    author_role: "support_agent",
    created_at: "2024-01-15T11:15:00Z",
  },
]

export function TicketDetailDialog({
  ticket,
  open,
  onOpenChange,
  onTicketUpdated,
  isAgent = false,
}: TicketDetailDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)

  useEffect(() => {
    const loadComments = async () => {
      if (!ticket?.id) return

      setIsLoadingComments(true)
      setCommentsError(null)

      try {
        console.log("🔍 Loading comments for ticket:", ticket.id)
        const ticketComments = await DatabaseService.getCommentsByTicket(ticket.id)

        console.log("📝 Raw comments data:", ticketComments)

        // Ensure we have an array
        if (Array.isArray(ticketComments)) {
          setComments(ticketComments)
          console.log("✅ Comments loaded successfully:", ticketComments.length)
        } else {
          console.warn("⚠️ Comments data is not an array:", typeof ticketComments)
          setComments([])
        }
      } catch (error) {
        console.error("❌ Failed to load comments:", error)
        setCommentsError("Failed to load comments")
        setComments([])
      } finally {
        setIsLoadingComments(false)
      }
    }

    if (open && ticket?.id) {
      loadComments()
    }
  }, [ticket?.id, open])

  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "support_agent":
        return "bg-blue-100 text-blue-800"
      case "end_user":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updatedTicket = {
        ...ticket,
        status: newStatus as Ticket["status"],
        updated_at: new Date().toISOString(),
      }

      // Update in database
      await DatabaseService.updateTicket(ticket.id, { status: newStatus as Ticket["status"] })

      onTicketUpdated(updatedTicket)

      toast({
        title: "Status updated",
        description: `Ticket status changed to ${newStatus.replace("_", " ")}`,
      })
    } catch (error) {
      console.error("Failed to update ticket status:", error)
      toast({
        title: "Error updating status",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)

    try {
      console.log("💬 Adding comment to ticket:", ticket.id)

      const comment = await DatabaseService.addComment({
        ticket_id: ticket.id,
        content: newComment,
        author_id: user.id,
        author_name: user.name || user.email || "Anonymous",
        author_role: user.role || "end_user",
      })

      console.log("✅ Comment added:", comment)

      // Update local comments state
      setComments((prev) => {
        const updatedComments = Array.isArray(prev) ? [...prev, comment] : [comment]
        console.log("📝 Updated comments list:", updatedComments.length)
        return updatedComments
      })

      setNewComment("")

      // Update ticket comment count
      const updatedTicket = {
        ...ticket,
        comments_count: (ticket.comments_count || 0) + 1,
        updated_at: new Date().toISOString(),
      }
      onTicketUpdated(updatedTicket)

      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      })
    } catch (error) {
      console.error("❌ Failed to add comment:", error)
      toast({
        title: "Error adding comment",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (voteType: "up" | "down") => {
    try {
      const newVotes = voteType === "up" ? (ticket.votes || 0) + 1 : (ticket.votes || 0) - 1
      const updatedTicket = {
        ...ticket,
        votes: Math.max(0, newVotes), // Prevent negative votes
      }

      // Update in database
      await DatabaseService.updateTicket(ticket.id, { votes: updatedTicket.votes })

      onTicketUpdated(updatedTicket)
    } catch (error) {
      console.error("Failed to update vote:", error)
      toast({
        title: "Error updating vote",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Ensure comments is always an array
  const safeComments = Array.isArray(comments) ? comments : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{ticket?.subject || "Untitled Ticket"}</DialogTitle>
              <DialogDescription className="mt-2">
                Ticket #{ticket?.id || "Unknown"} • Created{" "}
                {ticket?.created_at ? new Date(ticket.created_at).toLocaleDateString() : "Unknown date"}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("up")}
                  disabled={ticket?.created_by === user?.id}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <span className="font-medium">{ticket?.votes || 0}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("down")}
                  disabled={ticket?.created_by === user?.id}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(ticket?.status || "open")}>
              {ticket?.status?.replace("_", " ") || "Open"}
            </Badge>
            <Badge variant="outline">{ticket?.category || "General"}</Badge>
            {ticket?.assigned_to && (
              <Badge variant="outline">Assigned to {ticket.assigned_to === user?.id ? "me" : ticket.assigned_to}</Badge>
            )}
          </div>

          {/* Status Update (for agents) */}
          {isAgent && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <Select value={ticket?.status || "open"} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">Update ticket status</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Original Description */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Original Reporter</span>
                    <Badge className={getRoleColor("end_user")} variant="outline">
                      End User
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {ticket?.created_at ? new Date(ticket.created_at).toLocaleString() : "Unknown date"}
                    </span>
                  </div>
                  <p className="text-gray-700">{ticket?.description || "No description provided."}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-semibold">Comments ({safeComments.length})</h3>
            </div>

            {/* Loading State */}
            {isLoadingComments && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center py-4">
                    <div className="text-sm text-gray-500">Loading comments...</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {commentsError && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center py-4">
                    <div className="text-sm text-red-500">{commentsError}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            {!isLoadingComments && !commentsError && safeComments.length === 0 && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center py-4">
                    <div className="text-sm text-gray-500">No comments yet. Be the first to comment!</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoadingComments &&
              !commentsError &&
              safeComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{(comment.author || "U").charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{comment.author || "Anonymous"}</span>
                          <Badge className={getRoleColor(comment.author_role || "end_user")} variant="outline">
                            {(comment.author_role || "end_user").replace("_", " ")}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {comment.created_at ? new Date(comment.created_at).toLocaleString() : "Unknown date"}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content || "No content"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Add Comment */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">Add a comment</span>
                </div>
                <Textarea
                  placeholder="Type your comment here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddComment} disabled={!newComment.trim() || isSubmitting || !user}>
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
