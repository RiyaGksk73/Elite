"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Users,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  Eye,
} from "lucide-react"
import { Header } from "@/components/header"
import { DatabaseService, type User, type Category, type Ticket } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { TicketDetailDialog } from "@/components/ticket-detail-dialog"

export function AdminPanel() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "user" | "category" | "ticket"; id: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all")
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "end_user" as User["role"],
    phone: "",
    department: "",
  })

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Loading admin data...")

      const [usersData, categoriesData, ticketsData] = await Promise.all([
        DatabaseService.getUsers(),
        DatabaseService.getCategories(),
        DatabaseService.getTickets(),
      ])

      console.log("📊 Loaded data:", {
        users: usersData.length,
        categories: categoriesData.length,
        tickets: ticketsData.length,
      })

      setUsers(Array.isArray(usersData) ? usersData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setTickets(Array.isArray(ticketsData) ? ticketsData : [])
    } catch (error) {
      console.error("❌ Failed to load admin data:", error)
      setError("Failed to load admin data. Please try refreshing the page.")
      setUsers([])
      setCategories([])
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  // Safe filtering with comprehensive null checks
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        if (!user || typeof user !== "object") return false

        const userName = user.name || ""
        const userEmail = user.email || ""
        const userRole = user.role || "end_user"
        const userStatus = user.status || "active"

        const searchTermLower = (searchTerm || "").toLowerCase()
        const matchesSearch =
          userName.toLowerCase().includes(searchTermLower) || userEmail.toLowerCase().includes(searchTermLower)
        const matchesRole = roleFilter === "all" || userRole === roleFilter
        const matchesStatus = statusFilter === "all" || userStatus === statusFilter

        return matchesSearch && matchesRole && matchesStatus
      })
    : []

  const filteredTickets = Array.isArray(tickets)
    ? tickets.filter((ticket) => {
        if (!ticket || typeof ticket !== "object") return false

        const ticketSubject = ticket.subject || ""
        const ticketStatus = ticket.status || "open"
        const ticketCategory = ticket.category || ""

        const searchTermLower = (searchTerm || "").toLowerCase()
        const matchesSearch = ticketSubject.toLowerCase().includes(searchTermLower)
        const matchesStatus = ticketStatusFilter === "all" || ticketStatus === ticketStatusFilter
        const matchesCategory = ticketCategoryFilter === "all" || ticketCategory === ticketCategoryFilter

        return matchesSearch && matchesStatus && matchesCategory
      })
    : []

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Admin Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const stats = {
    totalUsers: Array.isArray(users) ? users.length : 0,
    activeUsers: Array.isArray(users) ? users.filter((u) => u && u.status === "active").length : 0,
    supportAgents: Array.isArray(users) ? users.filter((u) => u && u.role === "support_agent").length : 0,
    admins: Array.isArray(users) ? users.filter((u) => u && u.role === "admin").length : 0,
    totalCategories: Array.isArray(categories) ? categories.length : 0,
    totalTickets: Array.isArray(tickets) ? tickets.length : 0,
    openTickets: Array.isArray(tickets) ? tickets.filter((t) => t && t.status === "open").length : 0,
    inProgressTickets: Array.isArray(tickets) ? tickets.filter((t) => t && t.status === "in_progress").length : 0,
    resolvedTickets: Array.isArray(tickets) ? tickets.filter((t) => t && t.status === "resolved").length : 0,
    closedTickets: Array.isArray(tickets) ? tickets.filter((t) => t && t.status === "closed").length : 0,
    avgResponseTime: "2.4 hours",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTicketStatusColor = (status: string) => {
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

  const handleCreateUser = async () => {
    try {
      const newUser = await DatabaseService.createUser({
        id: `user-${Date.now()}`,
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        created_at: new Date().toISOString(),
        status: "active",
        profile: {
          phone: userForm.phone,
          department: userForm.department,
          avatar: `/placeholder.svg?height=40&width=40&query=${userForm.name}`,
        },
      })

      setUsers((prev) => [...prev, newUser])
      setUserDialogOpen(false)
      resetUserForm()

      toast({
        title: "User created successfully",
        description: `${newUser.name} has been added to the system.`,
      })
    } catch (error) {
      toast({
        title: "Error creating user",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const updatedUser = await DatabaseService.updateUser(selectedUser.id, {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        profile: {
          ...selectedUser.profile,
          phone: userForm.phone,
          department: userForm.department,
        },
      })

      if (updatedUser) {
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
        setUserDialogOpen(false)
        setSelectedUser(null)
        resetUserForm()

        toast({
          title: "User updated successfully",
          description: `${updatedUser.name}'s information has been updated.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error updating user",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = (userId: string) => {
    setDeleteTarget({ type: "user", id: userId })
    setDeleteDialogOpen(true)
  }

  const handleDeleteTicket = (ticketId: string) => {
    setDeleteTarget({ type: "ticket", id: ticketId })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      if (deleteTarget.type === "user") {
        const success = await DatabaseService.deleteUser(deleteTarget.id)
        if (success) {
          setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
          toast({
            title: "User deleted successfully",
            description: "The user has been removed from the system.",
          })
        }
      } else if (deleteTarget.type === "category") {
        const success = await DatabaseService.deleteCategory(deleteTarget.id)
        if (success) {
          setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id))
          toast({
            title: "Category deleted successfully",
            description: "The category has been removed from the system.",
          })
        }
      } else if (deleteTarget.type === "ticket") {
        // For now, we'll just remove from local state since we don't have a delete ticket method
        setTickets((prev) => prev.filter((t) => t.id !== deleteTarget.id))
        toast({
          title: "Ticket deleted successfully",
          description: "The ticket has been removed from the system.",
        })
      }
    } catch (error) {
      toast({
        title: "Error deleting item",
        description: "Please try again.",
        variant: "destructive",
      })
    }

    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const handleCreateCategory = async () => {
    try {
      const newCategory = await DatabaseService.createCategory({
        name: categoryForm.name,
        description: categoryForm.description,
        ticket_count: 0,
        color: categoryForm.color,
      })

      setCategories((prev) => [...prev, newCategory])
      setCategoryDialogOpen(false)
      resetCategoryForm()

      toast({
        title: "Category created successfully",
        description: `${newCategory.name} category has been added.`,
      })
    } catch (error) {
      toast({
        title: "Error creating category",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return

    try {
      const updatedCategory = await DatabaseService.updateCategory(selectedCategory.id, {
        name: categoryForm.name,
        description: categoryForm.description,
        color: categoryForm.color,
      })

      if (updatedCategory) {
        setCategories((prev) => prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)))
        setCategoryDialogOpen(false)
        setSelectedCategory(null)
        resetCategoryForm()

        toast({
          title: "Category updated successfully",
          description: `${updatedCategory.name} has been updated.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error updating category",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetUserForm = () => {
    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "end_user",
      phone: "",
      department: "",
    })
  }

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      color: "#3b82f6",
    })
  }

  const openEditUser = (user: User) => {
    setSelectedUser(user)
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "end_user",
      phone: user.profile?.phone || "",
      department: user.profile?.department || "",
    })
    setUserDialogOpen(true)
  }

  const openEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setCategoryForm({
      name: category.name || "",
      description: category.description || "",
      color: category.color || "#3b82f6",
    })
    setCategoryDialogOpen(true)
  }

  const getUserInitials = (name: string | undefined): string => {
    if (!name || typeof name !== "string") return "U"
    const trimmedName = name.trim()
    if (trimmedName.length === 0) return "U"
    return trimmedName.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Comprehensive system management and analytics</p>
              </div>
            </div>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  <p className="text-blue-100 text-xs">{stats.activeUsers} active</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Support Agents</p>
                  <p className="text-3xl font-bold">{stats.supportAgents}</p>
                  <p className="text-green-100 text-xs">{stats.admins} admins</p>
                </div>
                <Shield className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Tickets</p>
                  <p className="text-3xl font-bold">{stats.totalTickets}</p>
                  <p className="text-purple-100 text-xs">{stats.openTickets} open</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg Response</p>
                  <p className="text-3xl font-bold">{stats.avgResponseTime}</p>
                  <p className="text-orange-100 text-xs">Last 30 days</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="tickets">Ticket Management</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      resetUserForm()
                      setUserDialogOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support_agent">Support Agent</SelectItem>
                      <SelectItem value="end_user">End User</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} alt={user.name || "User"} />
                          <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-lg">{user.name || "Unknown User"}</h4>
                          <p className="text-sm text-gray-600">{user.email || "No email"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">
                              {user.profile?.department && `${user.profile.department} • `}
                              Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <Badge className={getRoleColor(user.role || "end_user")}>
                            {(user.role || "end_user").replace("_", " ")}
                          </Badge>
                          <div className="mt-1">
                            <Badge className={getStatusColor(user.status || "active")}>{user.status || "active"}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditUser(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No users found matching your criteria.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Ticket Management</CardTitle>
                    <CardDescription>View and manage all support tickets in the system</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Ticket Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                  <Select value={ticketStatusFilter} onValueChange={setTicketStatusFilter}>
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
                  <Select value={ticketCategoryFilter} onValueChange={setTicketCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{ticket.subject || "No Subject"}</h4>
                          <Badge className={getTicketStatusColor(ticket.status || "open")}>
                            {(ticket.status || "open").replace("_", " ")}
                          </Badge>
                          <Badge variant="outline">{ticket.category || "Uncategorized"}</Badge>
                          <Badge variant="secondary">{ticket.priority || "medium"}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {ticket.description || "No description"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Created {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "Unknown"}
                          </span>
                          <span>{ticket.votes || 0} votes</span>
                          <span>{ticket.comments_count || 0} comments</span>
                          {ticket.assigned_to && <span>Assigned to {ticket.assigned_to}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredTickets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No tickets found matching your criteria.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Category Management</CardTitle>
                    <CardDescription>Manage ticket categories and their properties</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      resetCategoryForm()
                      setCategoryDialogOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color || "#3b82f6" }}
                            />
                            <h4 className="font-semibold text-lg">{category.name || "Unnamed Category"}</h4>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditCategory(category)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteTarget({ type: "category", id: category.id })
                                setDeleteDialogOpen(true)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{category.description || "No description"}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{category.ticket_count || 0} tickets</span>
                          <span>
                            Created{" "}
                            {category.created_at ? new Date(category.created_at).toLocaleDateString() : "Unknown"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No categories found. Create your first category to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ticket Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="font-medium">Open</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width:
                                stats.totalTickets > 0 ? `${(stats.openTickets / stats.totalTickets) * 100}%` : "0%",
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{stats.openTickets}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="font-medium">In Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width:
                                stats.totalTickets > 0
                                  ? `${(stats.inProgressTickets / stats.totalTickets) * 100}%`
                                  : "0%",
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{stats.inProgressTickets}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="font-medium">Resolved</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width:
                                stats.totalTickets > 0
                                  ? `${(stats.resolvedTickets / stats.totalTickets) * 100}%`
                                  : "0%",
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{stats.resolvedTickets}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        <span className="font-medium">Closed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-500 h-2 rounded-full"
                            style={{
                              width:
                                stats.totalTickets > 0 ? `${(stats.closedTickets / stats.totalTickets) * 100}%` : "0%",
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{stats.closedTickets}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Distribution by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Distribution by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color || "#3b82f6" }}
                            />
                            <span className="font-medium">{category.name || "Unnamed"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width:
                                    stats.totalTickets > 0
                                      ? `${((category.ticket_count || 0) / stats.totalTickets) * 100}%`
                                      : "0%",
                                  backgroundColor: category.color || "#3b82f6",
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8 text-right">{category.ticket_count || 0}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">No categories available for analysis.</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>User Role Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">End Users</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width:
                                stats.totalUsers > 0
                                  ? `${(users.filter((u) => u && u.role === "end_user").length / stats.totalUsers) * 100}%`
                                  : "0%",
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">
                          {users.filter((u) => u && u.role === "end_user").length}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Support Agents</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: stats.totalUsers > 0 ? `${(stats.supportAgents / stats.totalUsers) * 100}%` : "0%",
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{stats.supportAgents}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Admins</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: stats.totalUsers > 0 ? `${(stats.admins / stats.totalUsers) * 100}%` : "0%",
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{stats.admins}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>System Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">
                        {stats.totalTickets > 0 ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100) : 0}%
                      </p>
                      <p className="text-sm text-blue-700">Resolution Rate</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-900">4.8</p>
                      <p className="text-sm text-green-700">Avg Rating</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-900">2.4h</p>
                      <p className="text-sm text-yellow-700">Avg Response</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">87%</p>
                      <p className="text-sm text-purple-700">First Contact Resolution</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {selectedUser ? "Update user information and permissions" : "Create a new user account"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            {!selectedUser && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => setUserForm((prev) => ({ ...prev, role: value as User["role"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="end_user">End User</SelectItem>
                    <SelectItem value="support_agent">Support Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={userForm.department}
                onChange={(e) => setUserForm((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="Enter department"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedUser ? handleUpdateUser : handleCreateUser}>
              {selectedUser ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {selectedCategory ? "Update category information" : "Create a new ticket category"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="categoryColor">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="categoryColor"
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, color: e.target.value }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedCategory ? handleUpdateCategory : handleCreateCategory}>
              {selectedCategory ? "Update Category" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteTarget?.type} and remove all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ticket Detail Dialog */}
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
