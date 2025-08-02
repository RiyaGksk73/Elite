"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Send, ThumbsUp, ThumbsDown, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { DatabaseService, type Ticket, type Comment } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface TicketDetailDialogProps {
  ticket: Ticket
  open: boolean
  onOpenChange: (open: boolean) => void
  onTicketUpdated: (ticket: Ticket) => void
  isAgent?: boolean
}

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
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [currentTicket, setCurrentTicket] = useState<Ticket>(ticket)

  useEffect(() => {
    if (open && ticket?.id) {
      loadComments()
      setCurrentTicket(ticket)
    }
  }, [open, ticket]) // Updated to use ticket instead of ticket?.id

  const loadComments = async () => {
    if (!ticket?.id) return

    try {
      setIsLoadingComments(true)
      setCommentsError(null)
      console.log("🔄 Loading comments for ticket:", ticket.id)

      const ticketComments = await DatabaseService.getCommentsByTicket(ticket.id)
      console.log("📝 Loaded comments:", ticketComments)

      // Ensure we have an array
      const safeComments = Array.isArray(ticketComments) ? ticketComments : []
      setComments(safeComments)
    } catch (error) {
      console.error("❌ Failed to load comments:", error)
      setCommentsError("Failed to load comments. Please try again.")
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !ticket?.id) return

    try {
      setIsSubmitting(true)
      console.log("💬 Adding comment to ticket:", ticket.id)

      const comment = await DatabaseService.addComment({
        ticket_id: ticket.id,
        content: newComment.trim(),
        author_id: user.id,
        author_name: user.name,
        author_role: user.role,
      })

      console.log("✅ Comment added:", comment)

      // Update local comments
      setComments((prev) => [...prev, comment])

      // Update ticket comment count
      const updatedTicket = {
        ...currentTicket,
        comments_count: (currentTicket.comments_count || 0) + 1,
        updated_at: new Date().toISOString(),
      }

      setCurrentTicket(updatedTicket)
      onTicketUpdated(updatedTicket)

      setNewComment("")

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

  const handleStatusChange = async (newStatus: Ticket["status"]) => {
    if (!ticket?.id || !isAgent) return

    try {
      console.log("🔄 Updating ticket status:", newStatus)

      const updatedTicket = await DatabaseService.updateTicket(ticket.id, {
        status: newStatus,
        assigned_to: user?.id,
      })

      if (updatedTicket) {
        console.log("✅ Ticket status updated:", updatedTicket)
        setCurrentTicket(updatedTicket)
        onTicketUpdated(updatedTicket)

        toast({
          title: "Status updated",
          description: `Ticket status changed to ${newStatus.replace("_", " ")}.`,
        })
      }
    } catch (error) {
      console.error("❌ Failed to update ticket status:", error)
      toast({
        title: "Error updating status",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleVote = async (voteType: "up" | "down") => {
    if (!ticket?.id) return

    try {
      const newVotes = voteType === "up" ? (currentTicket.votes || 0) + 1 : (currentTicket.votes || 0) - 1
      const updatedTicket = await DatabaseService.updateTicket(ticket.id, {
        votes: Math.max(0, newVotes), // Prevent negative votes
      })

      if (updatedTicket) {
        setCurrentTicket(updatedTicket)
        onTicketUpdated(updatedTicket)
      }
    } catch (error) {
      console.error("❌ Failed to update vote:", error)
      toast({
        title: "Error updating vote",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUserInitials = (name: string): string => {
    if (!name || typeof name !== "string") return "U"
    const trimmedName = name.trim()
    if (trimmedName.length === 0) return "U"
    return trimmedName.charAt(0).toUpperCase()
  }

  if (!ticket) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold pr-4">{currentTicket.subject || "No Subject"}</DialogTitle>
              <DialogDescription className="mt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getStatusColor(currentTicket.status || "open")}>
                    {(currentTicket.status || "open").replace("_", " ")}
                  </Badge>
                  <Badge variant="outline">{currentTicket.category || "Uncategorized"}</Badge>
                  <Badge className={getPriorityColor(currentTicket.priority || "medium")}>
                    {currentTicket.priority || "medium"} priority
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created{" "}
                    {currentTicket.created_at ? new Date(currentTicket.created_at).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleVote("up")}>
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <span className="font-medium">{currentTicket.votes || 0}</span>
                <Button variant="ghost" size="sm" onClick={() => handleVote("down")}>
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Ticket Description */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Original Request</span>
                    <span className="text-sm text-gray-500">
                      {currentTicket.created_at ? new Date(currentTicket.created_at).toLocaleString() : "Unknown time"}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {currentTicket.description || "No description provided."}
                  </p>
                  {currentTicket.attachments && currentTicket.attachments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-600 mb-2">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentTicket.attachments.map((attachment, index) => (
                          <Badge key={index} variant="outline">
                            {attachment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Controls */}
          {isAgent && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Select
                      value={currentTicket.status || "open"}
                      onValueChange={(value) => handleStatusChange(value as Ticket["status"])}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {currentTicket.assigned_to && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>
                        Assigned to {currentTicket.assigned_to === user?.id ? "you" : currentTicket.assigned_to}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold">Comments</h3>
                <Badge variant="outline">{comments.length}</Badge>
              </div>

              {/* Comments Loading State */}
              {isLoadingComments && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading comments...</span>
                </div>
              )}

              {/* Comments Error State */}
              {commentsError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-red-800">{commentsError}</p>
                    <Button variant="outline" size="sm" onClick={loadComments} className="mt-2 bg-transparent">
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Comments List */}
              {!isLoadingComments && !commentsError && (
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No comments yet. Be the first to comment!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/placeholder.svg" alt={comment.author_name || "User"} />
                          <AvatarFallback>{getUserInitials(comment.author_name || "User")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.author_name || "Unknown User"}</span>
                            <Badge variant="outline" className="text-xs">
                              {(comment.author_role || "user").replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {comment.created_at ? new Date(comment.created_at).toLocaleString() : "Unknown time"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <Separator className="my-4" />

              {/* Add Comment Form */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{newComment.length}/1000 characters</span>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting || newComment.length > 1000}
                    size="sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Comment
                      </>
                    )}
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
