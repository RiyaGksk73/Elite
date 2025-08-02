export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl = "/api"

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "An error occurred",
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error("API request error:", error)
      return {
        success: false,
        error: "Network error occurred",
      }
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request("/auth", {
      method: "POST",
      body: JSON.stringify({ action: "login", email, password }),
    })
  }

  async register(email: string, password: string, name: string) {
    return this.request("/auth", {
      method: "POST",
      body: JSON.stringify({ action: "register", email, password, name }),
    })
  }

  async logout() {
    return this.request("/auth", {
      method: "POST",
      body: JSON.stringify({ action: "logout" }),
    })
  }

  // Ticket methods
  async getTickets(filters?: {
    userId?: string
    assignedTo?: string
    status?: string
    category?: string
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }

    const query = params.toString()
    return this.request(`/tickets${query ? `?${query}` : ""}`)
  }

  async getTicket(id: string) {
    return this.request(`/tickets/${id}`)
  }

  async createTicket(ticketData: {
    title: string
    description: string
    priority?: string
    category?: string
    userId: string
    assignedTo?: string
    tags?: string[]
  }) {
    return this.request("/tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
    })
  }

  async updateTicket(id: string, updates: any) {
    return this.request(`/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async deleteTicket(id: string) {
    return this.request(`/tickets/${id}`, {
      method: "DELETE",
    })
  }

  // Comment methods
  async getComments(ticketId?: string) {
    const query = ticketId ? `?ticketId=${ticketId}` : ""
    return this.request(`/comments${query}`)
  }

  async createComment(commentData: {
    ticketId: string
    userId: string
    content: string
    isInternal?: boolean
  }) {
    return this.request("/comments", {
      method: "POST",
      body: JSON.stringify(commentData),
    })
  }

  // User methods
  async getUsers(role?: string) {
    const query = role ? `?role=${role}` : ""
    return this.request(`/users${query}`)
  }

  async createUser(userData: {
    email: string
    name: string
    role: string
  }) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  // Category methods
  async getCategories() {
    return this.request("/categories")
  }

  async createCategory(categoryData: {
    name: string
    description: string
    color?: string
  }) {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    })
  }
}

export const apiClient = new ApiClient()
