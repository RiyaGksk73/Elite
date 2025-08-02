// API client for making requests to our backend
class ApiClient {
  private baseUrl = "/api"

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Request failed")
      }

      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
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
  async getTickets(
    filters: {
      userId?: string
      userRole?: string
      status?: string
      category?: string
      search?: string
    } = {},
  ) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    return this.request(`/tickets?${params.toString()}`)
  }

  async getTicket(id: string) {
    return this.request(`/tickets/${id}`)
  }

  async createTicket(ticket: {
    title: string
    description: string
    category?: string
    priority?: string
    userId: string
    userEmail: string
    userName: string
  }) {
    return this.request("/tickets", {
      method: "POST",
      body: JSON.stringify(ticket),
    })
  }

  async updateTicket(
    id: string,
    updates: {
      status?: string
      priority?: string
      assignedTo?: string
      resolution?: string
    },
  ) {
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
  async getComments(ticketId: string) {
    return this.request(`/comments?ticketId=${ticketId}`)
  }

  async createComment(comment: {
    ticketId: string
    content: string
    userId: string
    userName: string
    userRole: string
  }) {
    return this.request("/comments", {
      method: "POST",
      body: JSON.stringify(comment),
    })
  }

  // User methods
  async getUsers() {
    return this.request("/users")
  }

  async createUser(user: {
    email: string
    name: string
    role: string
  }) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(user),
    })
  }

  // Category methods
  async getCategories() {
    return this.request("/categories")
  }

  async createCategory(category: {
    name: string
    description?: string
  }) {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    })
  }
}

export const apiClient = new ApiClient()
