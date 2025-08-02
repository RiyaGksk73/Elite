"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, User, Clock, MessageSquare, ThumbsUp } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
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
  priority?: "low" | "medium" | "high"
}

export function SupportAgentDashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const allTickets = await DatabaseService.getTickets()
        setTickets(Array.isArray(allTickets) ? allTickets : [])
      } catch (error) {
        console.error("Failed to load tickets:", error)
        setTickets([])
      }
    }

    loadTickets()
  }, [])

  useEffect(() => {
    // Ensure tickets is an array before filtering
    const ticketsArray = Array.isArray(tickets) ? tickets : []
    let filtered = [...ticketsArray]

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.category === categoryFilter)
    }

    // Sort tickets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case "votes":
          return b.votes - a.votes
        case "comments":
          return b.comments_count - a.comments_count
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority || "low"] || 1) - (priorityOrder[a.priority || "low"] || 1)
        default:
          return 0
      }
    })

    setFilteredTickets(filtered)
  }, [tickets, searchTerm, statusFilter, categoryFilter, sortBy])

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

  const getPriorityColor = (priority?: string) => {
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

  const handleAssignToSelf = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            assigned_to: user?.id,
            status: "in_progress" as const,
          }
        }
        return ticket
      }),
    )
  }

  const stats = {
    total: Array.isArray(tickets) ? tickets.length : 0,
    open: Array.isArray(tickets) ? tickets.filter((t) => t.status === "open").length : 0,
    inProgress: Array.isArray(tickets) ? tickets.filter((t) => t.status === "in_progress").length : 0,
    myTickets: Array.isArray(tickets) ? tickets.filter((t) => t.assigned_to === user?.id).length : 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and resolve customer support tickets</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <User className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ThumbsUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.myTickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
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
                <SelectTrigger className="w-full lg:w-48">
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
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="Bug Report">Bug Report</SelectItem>
                  <SelectItem value="Account">Account</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="comments">Most Commented</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
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
                <p className="text-gray-500">No tickets found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                        <Badge variant="outline">{ticket.category}</Badge>
                        {ticket.priority && (
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{ticket.comments_count} comments</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{ticket.votes} votes</span>
                        </div>
                        {ticket.assigned_to && (
                          <span className="text-blue-600">
                            Assigned to {ticket.assigned_to === user?.id ? "me" : ticket.assigned_to}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {!ticket.assigned_to && ticket.status === "open" && (
                        <Button variant="outline" size="sm" onClick={() => handleAssignToSelf(ticket.id)}>
                          Assign to Me
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {selectedTicket && (
        <TicketDetailDialog
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onTicketUpdated={(updatedTicket) => {
            setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)))
            setSelectedTicket(updatedTicket)
          }}
          isAgent={true}
        />
      )}
    </div>
  )
}
