export interface User {
  id: string
  name: string
  email: string
  role: "end_user" | "support_agent" | "admin"
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

class ApiClient {
  private baseUrl = "/api"

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    return data
  }

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${this.baseUrl}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", email, password, name }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Registration failed")
    }

    return data
  }

  async logout() {
    const response = await fetch(`${this.baseUrl}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Logout failed")
    }

    return data
  }

  async getTickets(userId?: string): Promise<{ tickets: Ticket[] }> {
    const url = userId ? `${this.baseUrl}/tickets?userId=${userId}` : `${this.baseUrl}/tickets`
    const response = await fetch(url)

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to get tickets")
    }

    return data
  }

  async createTicket(ticketData: {
    subject: string
    description: string
    category: string
    priority: string
    created_by: string
  }): Promise<{ ticket: Ticket }> {
    const response = await fetch(`${this.baseUrl}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticketData),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to create ticket")
    }

    return data
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<{ ticket: Ticket }> {
    const response = await fetch(`${this.baseUrl}/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to update ticket")
    }

    return data
  }

  async deleteTicket(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tickets/${id}`, {
      method: "DELETE",
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to delete ticket")
    }
  }

  async getComments(ticketId: string): Promise<{ comments: Comment[] }> {
    const response = await fetch(`${this.baseUrl}/comments?ticketId=${ticketId}`)

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to get comments")
    }

    return data
  }

  async createComment(commentData: {
    ticket_id: string
    content: string
    author_id: string
    author_name: string
    author_role: string
  }): Promise<{ comment: Comment }> {
    const response = await fetch(`${this.baseUrl}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to create comment")
    }

    return data
  }

  async getUsers(): Promise<{ users: User[] }> {
    const response = await fetch(`${this.baseUrl}/users`)

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to get users")
    }

    return data
  }

  async getCategories(): Promise<{ categories: Category[] }> {
    const response = await fetch(`${this.baseUrl}/categories`)

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to get categories")
    }

    return data
  }
}

export const apiClient = new ApiClient()
