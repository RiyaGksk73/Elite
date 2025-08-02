import { JSONBlobService } from "./jsonblob-service"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "end_user" | "support_agent" | "admin"
  created_at: string
  status: "active" | "inactive"
  profile?: {
    phone?: string
    department?: string
    avatar?: string
  }
}

export interface Ticket {
  id: string
  subject: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  category: string
  priority: "low" | "medium" | "high"
  created_by: string
  assigned_to?: string
  created_at: string
  updated_at: string
  votes: number
  comments_count: number
  attachments?: string[]
}

export interface Comment {
  id: string
  ticket_id: string
  content: string
  author_id: string
  author_name: string
  author_role: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  created_at: string
  ticket_count: number
  color?: string
}

export class DatabaseService {
  private static async getData() {
    return await JSONBlobService.getData()
  }

  private static async updateData(data: any) {
    await JSONBlobService.updateData(data)
  }

  static async getUsers(): Promise<User[]> {
    try {
      const data = await this.getData()
      return Array.isArray(data.users) ? data.users : []
    } catch (error) {
      console.error("Failed to get users:", error)
      return []
    }
  }

  static async getUserById(id: string): Promise<User | undefined> {
    try {
      console.log("🔍 Looking up user by ID:", id)
      const users = await this.getUsers()
      console.log(
        "👥 Available users:",
        users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
      )

      const user = users.find((user) => user.id === id)
      console.log("👤 Found user:", user ? { id: user.id, email: user.email, role: user.role } : "Not found")

      return user
    } catch (error) {
      console.error("Failed to get user by ID:", error)
      return undefined
    }
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const users = await this.getUsers()
      return users.find((user) => user.email === email)
    } catch (error) {
      console.error("Failed to get user by email:", error)
      return undefined
    }
  }

  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      console.log("🔐 Authenticating user:", email)

      // Validate inputs
      if (!email || !password) {
        console.log("❌ Missing email or password")
        return null
      }

      // Allow any email/password combination - create user if doesn't exist
      const users = await this.getUsers()
      console.log("👥 Total users in database:", users.length)

      let user = users.find((u) => u.email === email)
      console.log("🔍 Existing user found:", !!user)

      if (!user) {
        console.log("👤 Creating new user for:", email)

        // Determine role based on email - with null safety
        let role: User["role"] = "end_user"
        const emailLower = email.toLowerCase()

        if (emailLower.includes("admin")) {
          role = "admin"
        } else if (emailLower.includes("agent")) {
          role = "support_agent"
        }

        console.log("🎭 Assigned role:", role)

        // Create new user with the provided credentials
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: email.split("@")[0] || "User",
          email,
          password,
          role,
          created_at: new Date().toISOString(),
          status: "active",
          profile: {
            phone: "",
            department: "",
            avatar: `/placeholder.svg?height=40&width=40&query=${email.split("@")[0]}`,
          },
        }

        user = await this.createUser(newUser)
        console.log("✅ New user created:", { id: user.id, email: user.email, role: user.role })
      } else {
        console.log("✅ Existing user authenticated:", { id: user.id, email: user.email, role: user.role })
      }

      return user
    } catch (error) {
      console.error("❌ Authentication failed:", error)
      return null
    }
  }

  static async getTickets(): Promise<Ticket[]> {
    try {
      const data = await this.getData()
      return Array.isArray(data.tickets) ? data.tickets : []
    } catch (error) {
      console.error("Failed to get tickets:", error)
      return []
    }
  }

  static async getTicketById(id: string): Promise<Ticket | undefined> {
    const tickets = await this.getTickets()
    return tickets.find((ticket) => ticket.id === id)
  }

  static async getTicketsByUser(userId: string): Promise<Ticket[]> {
    try {
      const tickets = await this.getTickets()
      return tickets.filter((ticket) => ticket.created_by === userId)
    } catch (error) {
      console.error("Failed to get user tickets:", error)
      return []
    }
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const data = await this.getData()
      return Array.isArray(data.categories) ? data.categories : []
    } catch (error) {
      console.error("Failed to get categories:", error)
      return []
    }
  }

  static async getCommentsByTicket(ticketId: string): Promise<Comment[]> {
    try {
      const data = await this.getData()
      const comments = data.comments || []
      return Array.isArray(comments) ? comments.filter((comment: Comment) => comment.ticket_id === ticketId) : []
    } catch (error) {
      console.error("Failed to get comments:", error)
      return []
    }
  }

  static async createUser(userData: User): Promise<User> {
    try {
      console.log("📝 Creating user:", { email: userData.email, role: userData.role })

      const data = await this.getData()
      const newUser: User = {
        ...userData,
        id: userData.id || `user-${Date.now()}`,
        created_at: userData.created_at || new Date().toISOString(),
      }

      data.users = data.users || []
      data.users.push(newUser)
      await this.updateData(data)

      console.log("✅ User created successfully:", { id: newUser.id, email: newUser.email, role: newUser.role })
      return newUser
    } catch (error) {
      console.error("❌ Failed to create user:", error)
      throw error
    }
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const data = await this.getData()
    const userIndex = data.users.findIndex((user: User) => user.id === id)
    if (userIndex === -1) return null

    data.users[userIndex] = { ...data.users[userIndex], ...updates }
    await this.updateData(data)
    return data.users[userIndex]
  }

  static async deleteUser(id: string): Promise<boolean> {
    const data = await this.getData()
    const userIndex = data.users.findIndex((user: User) => user.id === id)
    if (userIndex === -1) return false

    data.users.splice(userIndex, 1)
    await this.updateData(data)
    return true
  }

  static async createTicket(ticketData: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket> {
    const data = await this.getData()
    const newTicket: Ticket = {
      ...ticketData,
      id: `ticket-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    data.tickets = data.tickets || []
    data.tickets.push(newTicket)

    // Update category ticket count
    if (data.categories) {
      const category = data.categories.find((cat: Category) => cat.name === ticketData.category)
      if (category) {
        category.ticket_count += 1
      }
    }

    await this.updateData(data)
    return newTicket
  }

  static async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    const data = await this.getData()
    const ticketIndex = data.tickets.findIndex((ticket: Ticket) => ticket.id === id)
    if (ticketIndex === -1) return null

    data.tickets[ticketIndex] = {
      ...data.tickets[ticketIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    await this.updateData(data)
    return data.tickets[ticketIndex]
  }

  static async createCategory(categoryData: Omit<Category, "id" | "created_at">): Promise<Category> {
    const data = await this.getData()
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    data.categories = data.categories || []
    data.categories.push(newCategory)
    await this.updateData(data)
    return newCategory
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const data = await this.getData()
    const categoryIndex = data.categories.findIndex((cat: Category) => cat.id === id)
    if (categoryIndex === -1) return null

    data.categories[categoryIndex] = { ...data.categories[categoryIndex], ...updates }
    await this.updateData(data)
    return data.categories[categoryIndex]
  }

  static async deleteCategory(id: string): Promise<boolean> {
    const data = await this.getData()
    const categoryIndex = data.categories.findIndex((cat: Category) => cat.id === id)
    if (categoryIndex === -1) return false

    data.categories.splice(categoryIndex, 1)
    await this.updateData(data)
    return true
  }

  static async addComment(commentData: Omit<Comment, "id" | "created_at">): Promise<Comment> {
    const data = await this.getData()
    const newComment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    data.comments = data.comments || []
    data.comments.push(newComment)

    // Update ticket comment count
    const ticket = data.tickets.find((t: Ticket) => t.id === commentData.ticket_id)
    if (ticket) {
      ticket.comments_count += 1
      ticket.updated_at = new Date().toISOString()
    }

    await this.updateData(data)
    return newComment
  }

  // Initialize the service
  static async initialize() {
    await JSONBlobService.initialize()
  }

  // Get blob ID for debugging
  static getBlobId(): string | null {
    return JSONBlobService.getBlobId()
  }
}
