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

  useEffect(() => {
    // Load comments from database
    const ticketComments = DatabaseService.getCommentsByTicket(ticket.id)
    setComments(ticketComments)
  }, [ticket.id])

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

  const handleStatusChange = (newStatus: string) => {
    const updatedTicket = {
      ...ticket,
      status: newStatus as Ticket["status"],
      updated_at: new Date().toISOString(),
    }
    onTicketUpdated(updatedTicket)

    toast({
      title: "Status updated",
      description: `Ticket status changed to ${newStatus.replace("_", " ")}`,
    })
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const comment = DatabaseService.addComment({
        ticket_id: ticket.id,
        content: newComment,
        author_id: user?.id || "",
        author_name: user?.name || "Anonymous",
        author_role: user?.role || "end_user",
      })

      setComments((prev) => [...prev, comment])
      setNewComment("")

      // Update ticket comment count
      const updatedTicket = {
        ...ticket,
        comments_count: ticket.comments_count + 1,
        updated_at: new Date().toISOString(),
      }
      onTicketUpdated(updatedTicket)

      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error adding comment",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = (voteType: "up" | "down") => {
    const updatedTicket = {
      ...ticket,
      votes: voteType === "up" ? ticket.votes + 1 : ticket.votes - 1,
    }
    onTicketUpdated(updatedTicket)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{ticket.subject}</DialogTitle>
              <DialogDescription className="mt-2">
                Ticket #{ticket.id} • Created {new Date(ticket.created_at).toLocaleDateString()}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("up")}
                  disabled={ticket.created_by === user?.id}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <span className="font-medium">{ticket.votes}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("down")}
                  disabled={ticket.created_by === user?.id}
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
            <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
            <Badge variant="outline">{ticket.category}</Badge>
            {ticket.assigned_to && (
              <Badge variant="outline">Assigned to {ticket.assigned_to === user?.id ? "me" : ticket.assigned_to}</Badge>
            )}
          </div>

          {/* Status Update (for agents) */}
          {isAgent && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
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
                    <span className="text-sm text-gray-500">{new Date(ticket.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{ticket.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-semibold">Comments ({comments.length})</h3>
            </div>

            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comment.author}</span>
                        <Badge className={getRoleColor(comment.author_role)} variant="outline">
                          {comment.author_role.replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
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
                  <Button onClick={handleAddComment} disabled={!newComment.trim() || isSubmitting}>
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
