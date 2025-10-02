import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Website {
  id: string
  name: string
  domain: string
  subdomain: string
  customDomain?: string
  status: 'draft' | 'published' | 'archived'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  userId: string
  templateId: string
  pages: Page[]
  settings?: WebsiteSettings
}

export interface Page {
  id: string
  name: string
  slug: string
  isHomePage: boolean
  isPublished: boolean
  order: number
  createdAt: string
  updatedAt: string
  websiteId: string
  templateId?: string
  sections: Section[]
}

export interface Section {
  id: string
  type: string
  content: any
  settings: any
  order: number
  createdAt: string
  updatedAt: string
  pageId: string
}

export interface WebsiteSettings {
  id: string
  theme: any
  seo: any
  integrations: any
  aiSettings: any
  createdAt: string
  updatedAt: string
  websiteId: string
}

export interface CreateWebsiteData {
  name: string
  templateId: string
  domain?: string
}

export interface CreatePageData {
  name: string
  slug: string
  isHomePage?: boolean
}

export interface CreateSectionData {
  type: string
  content: any
  settings?: any
}

export const websiteAPI = {
  // Get all websites for current user
  async getWebsites(): Promise<{ data: Website[] }> {
    const response = await api.get('/websites')
    return response.data
  },

  // Get single website
  async getWebsite(id: string): Promise<{ data: Website }> {
    const response = await api.get(`/websites/${id}`)
    return response.data
  },

  // Create new website
  async createWebsite(data: CreateWebsiteData): Promise<{ data: Website }> {
    const response = await api.post('/websites', data)
    return response.data
  },

  // Update website
  async updateWebsite(id: string, data: Partial<Website>): Promise<{ data: Website }> {
    const response = await api.patch(`/websites/${id}`, data)
    return response.data
  },

  // Delete website
  async deleteWebsite(id: string): Promise<void> {
    await api.delete(`/websites/${id}`)
  },

  // Publish website
  async publishWebsite(id: string): Promise<{ data: Website }> {
    const response = await api.post(`/websites/${id}/publish`)
    return response.data
  },

  // Duplicate website
  async duplicateWebsite(id: string): Promise<{ data: Website }> {
    const response = await api.post(`/websites/${id}/duplicate`)
    return response.data
  },

  // Export website
  async exportWebsite(id: string): Promise<{ data: any }> {
    const response = await api.get(`/websites/${id}/export`)
    return response.data
  },

  // Import website
  async importWebsite(data: any): Promise<{ data: Website }> {
    const response = await api.post('/websites/import', data)
    return response.data
  },

  // Add page to website
  async addPage(websiteId: string, data: CreatePageData): Promise<{ data: Page }> {
    const response = await api.post(`/websites/${websiteId}/pages`, data)
    return response.data
  },

  // Update page
  async updatePage(id: string, data: Partial<Page>): Promise<{ data: Page }> {
    const response = await api.patch(`/pages/${id}`, data)
    return response.data
  },

  // Delete page
  async deletePage(id: string): Promise<void> {
    await api.delete(`/pages/${id}`)
  },

  // Add section to page
  async addSection(pageId: string, data: CreateSectionData): Promise<{ data: Section }> {
    const response = await api.post(`/pages/${pageId}/sections`, data)
    return response.data
  },

  // Update section
  async updateSection(id: string, data: Partial<Section>): Promise<{ data: Section }> {
    const response = await api.patch(`/sections/${id}`, data)
    return response.data
  },

  // Delete section
  async deleteSection(id: string): Promise<void> {
    await api.delete(`/sections/${id}`)
  },

  // Move section
  async moveSection(id: string, newOrder: number): Promise<void> {
    await api.patch(`/sections/${id}/move`, { order: newOrder })
  },

  // Save website (auto-save)
  async saveWebsite(id: string): Promise<void> {
    await api.post(`/websites/${id}/save`)
  },

  // Get website analytics
  async getAnalytics(id: string): Promise<{ data: any }> {
    const response = await api.get(`/websites/${id}/analytics`)
    return response.data
  },

  // Update website settings
  async updateSettings(id: string, settings: Partial<WebsiteSettings>): Promise<{ data: WebsiteSettings }> {
    const response = await api.patch(`/websites/${id}/settings`, settings)
    return response.data
  },

  // Get website preview URL
  async getPreviewUrl(id: string): Promise<{ data: { url: string } }> {
    const response = await api.get(`/websites/${id}/preview`)
    return response.data
  },

  // Get website public URL
  async getPublicUrl(id: string): Promise<{ data: { url: string } }> {
    const response = await api.get(`/websites/${id}/public-url`)
    return response.data
  }
}

export default websiteAPI