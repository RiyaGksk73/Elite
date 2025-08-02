import { JSONBlobService } from "./jsonblob-service"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "support_agent" | "end_user"
  createdAt: string
  avatar?: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  userId: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  votes: number
}

export interface Comment {
  id: string
  ticketId: string
  userId: string
  content: string
  createdAt: string
  isInternal: boolean
}

export interface Category {
  id: string
  name: string
  description: string
  color: string
  createdAt: string
}

export interface DatabaseData {
  users: User[]
  tickets: Ticket[]
  comments: Comment[]
  categories: Category[]
}

export class DatabaseService {
  private static instance: DatabaseService
  private jsonBlobService: JSONBlobService

  constructor() {
    this.jsonBlobService = new JSONBlobService()
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private async getData(): Promise<DatabaseData> {
    try {
      const data = await this.jsonBlobService.getData()
      return {
        users: Array.isArray(data?.users) ? data.users : [],
        tickets: Array.isArray(data?.tickets) ? data.tickets : [],
        comments: Array.isArray(data?.comments) ? data.comments : [],
        categories: Array.isArray(data?.categories) ? data.categories : this.getDefaultCategories(),
      }
    } catch (error) {
      console.error("Error getting data:", error)
      return {
        users: [],
        tickets: [],
        comments: [],
        categories: this.getDefaultCategories(),
      }
    }
  }

  private async saveData(data: DatabaseData): Promise<void> {
    try {
      await this.jsonBlobService.saveData(data)
    } catch (error) {
      console.error("Error saving data:", error)
      throw error
    }
  }

  private getDefaultCategories(): Category[] {
    return [
      {
        id: "1",
        name: "Technical Support",
        description: "Technical issues and troubleshooting",
        color: "#3b82f6",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Billing",
        description: "Billing and payment related issues",
        color: "#10b981",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Feature Request",
        description: "New feature requests and suggestions",
        color: "#8b5cf6",
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Bug Report",
        description: "Bug reports and issues",
        color: "#ef4444",
        createdAt: new Date().toISOString(),
      },
    ]
  }

  // User methods
  async getUsers(): Promise<User[]> {
    const data = await this.getData()
    return data.users
  }

  async getUserById(id: string): Promise<User | null> {
    const data = await this.getData()
    return data.users.find((user) => user.id === id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const data = await this.getData()
    return data.users.find((user) => user.email === email) || null
  }

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const data = await this.getData()
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    data.users.push(newUser)
    await this.saveData(data)
    return newUser
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const data = await this.getData()
    const userIndex = data.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return null

    data.users[userIndex] = { ...data.users[userIndex], ...updates }
    await this.saveData(data)
    return data.users[userIndex]
  }

  async deleteUser(id: string): Promise<boolean> {
    const data = await this.getData()
    const userIndex = data.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return false

    data.users.splice(userIndex, 1)
    await this.saveData(data)
    return true
  }

  // Ticket methods
  async getTickets(): Promise<Ticket[]> {
    const data = await this.getData()
    return data.tickets
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    const data = await this.getData()
    return data.tickets.find((ticket) => ticket.id === id) || null
  }

  async getTicketsByUserId(userId: string): Promise<Ticket[]> {
    const data = await this.getData()
    return data.tickets.filter((ticket) => ticket.userId === userId)
  }

  async getTicketsByAssignee(assigneeId: string): Promise<Ticket[]> {
    const data = await this.getData()
    return data.tickets.filter((ticket) => ticket.assignedTo === assigneeId)
  }

  async createTicket(ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt">): Promise<Ticket> {
    const data = await this.getData()
    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: 0,
    }
    data.tickets.push(newTicket)
    await this.saveData(data)
    return newTicket
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    const data = await this.getData()
    const ticketIndex = data.tickets.findIndex((ticket) => ticket.id === id)
    if (ticketIndex === -1) return null

    data.tickets[ticketIndex] = {
      ...data.tickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await this.saveData(data)
    return data.tickets[ticketIndex]
  }

  async deleteTicket(id: string): Promise<boolean> {
    const data = await this.getData()
    const ticketIndex = data.tickets.findIndex((ticket) => ticket.id === id)
    if (ticketIndex === -1) return false

    data.tickets.splice(ticketIndex, 1)
    // Also delete associated comments
    data.comments = data.comments.filter((comment) => comment.ticketId !== id)
    await this.saveData(data)
    return true
  }

  // Comment methods
  async getComments(): Promise<Comment[]> {
    const data = await this.getData()
    return data.comments
  }

  async getCommentsByTicket(ticketId: string): Promise<Comment[]> {
    const data = await this.getData()
    return data.comments.filter((comment) => comment.ticketId === ticketId)
  }

  async createComment(commentData: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const data = await this.getData()
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    data.comments.push(newComment)
    await this.saveData(data)
    return newComment
  }

  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment | null> {
    const data = await this.getData()
    const commentIndex = data.comments.findIndex((comment) => comment.id === id)
    if (commentIndex === -1) return null

    data.comments[commentIndex] = { ...data.comments[commentIndex], ...updates }
    await this.saveData(data)
    return data.comments[commentIndex]
  }

  async deleteComment(id: string): Promise<boolean> {
    const data = await this.getData()
    const commentIndex = data.comments.findIndex((comment) => comment.id === id)
    if (commentIndex === -1) return false

    data.comments.splice(commentIndex, 1)
    await this.saveData(data)
    return true
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    const data = await this.getData()
    return data.categories
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const data = await this.getData()
    return data.categories.find((category) => category.id === id) || null
  }

  async createCategory(categoryData: Omit<Category, "id" | "createdAt">): Promise<Category> {
    const data = await this.getData()
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    data.categories.push(newCategory)
    await this.saveData(data)
    return newCategory
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const data = await this.getData()
    const categoryIndex = data.categories.findIndex((category) => category.id === id)
    if (categoryIndex === -1) return null

    data.categories[categoryIndex] = { ...data.categories[categoryIndex], ...updates }
    await this.saveData(data)
    return data.categories[categoryIndex]
  }

  async deleteCategory(id: string): Promise<boolean> {
    const data = await this.getData()
    const categoryIndex = data.categories.findIndex((category) => category.id === id)
    if (categoryIndex === -1) return false

    data.categories.splice(categoryIndex, 1)
    await this.saveData(data)
    return true
  }

  // Analytics methods
  async getAnalytics() {
    const data = await this.getData()

    const totalTickets = data.tickets.length
    const openTickets = data.tickets.filter((t) => t.status === "open").length
    const inProgressTickets = data.tickets.filter((t) => t.status === "in_progress").length
    const resolvedTickets = data.tickets.filter((t) => t.status === "resolved").length
    const closedTickets = data.tickets.filter((t) => t.status === "closed").length

    const totalUsers = data.users.length
    const adminUsers = data.users.filter((u) => u.role === "admin").length
    const supportAgents = data.users.filter((u) => u.role === "support_agent").length
    const endUsers = data.users.filter((u) => u.role === "end_user").length

    const totalComments = data.comments.length

    return {
      tickets: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
      },
      users: {
        total: totalUsers,
        admin: adminUsers,
        supportAgent: supportAgents,
        endUser: endUsers,
      },
      comments: {
        total: totalComments,
      },
    }
  }
}

export const databaseService = DatabaseService.getInstance()
