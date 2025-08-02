// JSONBlob service for persistent data storage
export class JSONBlobService {
  private static readonly BASE_URL = "https://jsonblob.com/api/jsonBlob"
  private static blobId: string | null = null

  // Initialize with existing blob ID or create new one
  static async initialize() {
    // Try to get existing blob ID from localStorage
    const savedBlobId = localStorage.getItem("quickdesk_blob_id")
    if (savedBlobId) {
      this.blobId = savedBlobId
      // Verify the blob exists
      try {
        await this.getData()
        return
      } catch (error) {
        // Blob doesn't exist, create new one
        localStorage.removeItem("quickdesk_blob_id")
      }
    }

    // Create new blob with initial data
    await this.createInitialBlob()
  }

  private static async createInitialBlob() {
    const initialData = {
      users: [
        {
          id: "admin-001",
          name: "Elite Coders Admin",
          email: "Elitcoders@123",
          password: "Elitcoders@123",
          role: "admin",
          created_at: "2024-01-01T00:00:00Z",
          status: "active",
          profile: {
            phone: "+1-555-0100",
            department: "Administration",
            avatar: "/placeholder.svg?height=40&width=40",
          },
        },
        {
          id: "agent-001",
          name: "Sarah Johnson",
          email: "sarah.johnson@quickdesk.com",
          password: "agent123",
          role: "support_agent",
          created_at: "2024-01-02T08:00:00Z",
          status: "active",
          profile: {
            phone: "+1-555-0101",
            department: "Technical Support",
            avatar: "/placeholder.svg?height=40&width=40",
          },
        },
        {
          id: "user-001",
          name: "John Smith",
          email: "john.smith@example.com",
          password: "user123",
          role: "end_user",
          created_at: "2024-01-03T10:00:00Z",
          status: "active",
          profile: {
            phone: "+1-555-0201",
            department: "Marketing",
            avatar: "/placeholder.svg?height=40&width=40",
          },
        },
      ],
      categories: [
        {
          id: "cat-001",
          name: "Technical Issues",
          description: "Hardware, software, and system-related problems",
          created_at: "2024-01-01T00:00:00Z",
          ticket_count: 25,
          color: "#ef4444",
        },
        {
          id: "cat-002",
          name: "Feature Requests",
          description: "New feature suggestions and enhancements",
          created_at: "2024-01-01T00:00:00Z",
          ticket_count: 18,
          color: "#3b82f6",
        },
        {
          id: "cat-003",
          name: "Bug Reports",
          description: "Software bugs and unexpected behavior",
          created_at: "2024-01-01T00:00:00Z",
          ticket_count: 12,
          color: "#f59e0b",
        },
        {
          id: "cat-004",
          name: "Account Management",
          description: "User account, billing, and subscription issues",
          created_at: "2024-01-01T00:00:00Z",
          ticket_count: 8,
          color: "#10b981",
        },
      ],
      tickets: [
        {
          id: "ticket-001",
          subject: "Login authentication failing on mobile app",
          description:
            "Users are unable to authenticate through the mobile application. The login process hangs at the authentication step and eventually times out.",
          status: "open",
          category: "Technical Issues",
          priority: "high",
          created_by: "user-001",
          created_at: "2024-01-15T09:30:00Z",
          updated_at: "2024-01-15T09:30:00Z",
          votes: 8,
          comments_count: 3,
          attachments: ["error-screenshot.png"],
        },
        {
          id: "ticket-002",
          subject: "Request for dark mode implementation",
          description:
            "Many users have requested a dark mode option for better user experience during night-time usage.",
          status: "in_progress",
          category: "Feature Requests",
          priority: "medium",
          created_by: "user-001",
          assigned_to: "agent-001",
          created_at: "2024-01-14T14:20:00Z",
          updated_at: "2024-01-15T10:15:00Z",
          votes: 15,
          comments_count: 7,
          attachments: [],
        },
      ],
      comments: [
        {
          id: "comment-001",
          ticket_id: "ticket-001",
          content:
            "I can reproduce this issue on both iPhone 14 and Samsung Galaxy S23. The app shows a loading spinner for about 30 seconds before timing out.",
          author_id: "user-001",
          author_name: "John Smith",
          author_role: "end_user",
          created_at: "2024-01-15T10:15:00Z",
        },
        {
          id: "comment-002",
          ticket_id: "ticket-001",
          content:
            "Thank you for the detailed report. I'm investigating this issue now. Can you please try clearing the app cache and let me know if the issue persists?",
          author_id: "agent-001",
          author_name: "Sarah Johnson",
          author_role: "support_agent",
          created_at: "2024-01-15T11:30:00Z",
        },
      ],
    }

    try {
      const response = await fetch(this.BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(initialData),
      })

      if (response.ok) {
        const location = response.headers.get("Location")
        if (location) {
          this.blobId = location.split("/").pop() || null
          if (this.blobId) {
            localStorage.setItem("quickdesk_blob_id", this.blobId)
          }
        }
      }
    } catch (error) {
      console.error("Failed to create initial blob:", error)
      throw error
    }
  }

  static async getData(): Promise<any> {
    if (!this.blobId) {
      await this.initialize()
    }

    try {
      const response = await fetch(`${this.BASE_URL}/${this.blobId}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }

      const data = await response.json()

      // Ensure the data structure has the required arrays
      return {
        users: Array.isArray(data.users) ? data.users : [],
        tickets: Array.isArray(data.tickets) ? data.tickets : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        comments: Array.isArray(data.comments) ? data.comments : [],
        ...data,
      }
    } catch (error) {
      console.error("Failed to get data:", error)
      // Return default structure if fetch fails
      return {
        users: [],
        tickets: [],
        categories: [],
        comments: [],
      }
    }
  }

  static async updateData(data: any): Promise<void> {
    if (!this.blobId) {
      await this.initialize()
    }

    try {
      const response = await fetch(`${this.BASE_URL}/${this.blobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to update data: ${response.status}`)
      }
    } catch (error) {
      console.error("Failed to update data:", error)
      throw error
    }
  }

  // Helper method to get blob ID for debugging
  static getBlobId(): string | null {
    return this.blobId
  }
}
