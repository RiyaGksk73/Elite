"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { CreateTicketDialog } from "@/components/create-ticket-dialog"
import { TicketDetailDialog } from "@/components/ticket-detail-dialog"
import { Header } from "@/components/header"
import { DatabaseService } from "@/lib/database"

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

const mockTickets: Ticket[] = []

export function EndUserDashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    const loadTickets = async () => {
      try {
        if (user?.id) {
          const userTickets = await DatabaseService.getTicketsByUser(user.id)
          setTickets(Array.isArray(userTickets) ? userTickets : [])
        }
      } catch (error) {
        console.error("Failed to load tickets:", error)
        setTickets([])
      }
    }

    loadTickets()
  }, [user?.id])

  useEffect(() => {
    // Ensure tickets is an array before filtering
    const ticketsArray = Array.isArray(tickets) ? tickets : []
    let filtered = ticketsArray.filter((ticket) => ticket.created_by === user?.id)

    if (searchTerm) {
      filtered = filtered.filter((ticket) => ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.category === categoryFilter)
    }

    setFilteredTickets(filtered)
  }, [tickets, searchTerm, statusFilter, categoryFilter, user?.id])

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

  const handleVote = (ticketId: string, voteType: "up" | "down") => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            votes: voteType === "up" ? ticket.votes + 1 : ticket.votes - 1,
          }
        }
        return ticket
      }),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
            <p className="text-gray-600 mt-1">Manage and track your support requests</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="Bug Report">Bug Report</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No tickets found. Create your first ticket to get started!</p>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => setSelectedTicket(ticket)}>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{ticket.comments_count} comments</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleVote(ticket.id, "up")
                          }}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <span className="font-medium">{ticket.votes}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleVote(ticket.id, "down")
                          }}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <CreateTicketDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onTicketCreated={(newTicket) => {
          setTickets((prev) => [newTicket, ...prev])
        }}
      />

      {selectedTicket && (
        <TicketDetailDialog
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onTicketUpdated={(updatedTicket) => {
            setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)))
            setSelectedTicket(updatedTicket)
          }}
        />
      )}
    </div>
  )
}
