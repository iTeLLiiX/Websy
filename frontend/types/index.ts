// User Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  subscription: Subscription
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

// Website Types
export interface Website {
  id: string
  userId: string
  name: string
  domain: string
  subdomain: string
  templateId: string
  status: 'draft' | 'published' | 'archived'
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  settings: WebsiteSettings
  pages: Page[]
  customDomain?: string
}

export interface WebsiteSettings {
  theme: Theme
  seo: SEO
  analytics?: Analytics
  integrations: Integrations
  aiSettings: AISettings
}

export interface Theme {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  spacing: 'compact' | 'normal' | 'relaxed'
  headerStyle: 'minimal' | 'standard' | 'bold'
  footerStyle: 'minimal' | 'standard' | 'detailed'
}

export interface SEO {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  favicon?: string
  robots: 'index' | 'noindex'
}

export interface Analytics {
  googleAnalyticsId?: string
  facebookPixelId?: string
  hotjarId?: string
}

export interface Integrations {
  instagram?: InstagramIntegration
  facebook?: FacebookIntegration
  googleMaps?: GoogleMapsIntegration
  bookingSystem?: BookingSystem
  onlineShop?: OnlineShop
}

export interface InstagramIntegration {
  enabled: boolean
  accessToken: string
  username: string
  autoSync: boolean
}

export interface FacebookIntegration {
  enabled: boolean
  pageId: string
  accessToken: string
}

export interface GoogleMapsIntegration {
  enabled: boolean
  placeId: string
  apiKey: string
}

export interface BookingSystem {
  enabled: boolean
  provider: 'calendly' | 'acuity' | 'builtin'
  settings: Record<string, any>
}

export interface OnlineShop {
  enabled: boolean
  maxProducts: number
  paymentMethods: string[]
  currency: string
}

export interface AISettings {
  voiceEnabled: boolean
  autoBranding: boolean
  contentGeneration: boolean
  imageOptimization: boolean
}

// Page Types
export interface Page {
  id: string
  websiteId: string
  name: string
  slug: string
  isHomePage: boolean
  isPublished: boolean
  order: number
  sections: Section[]
  createdAt: Date
  updatedAt: Date
}

export interface Section {
  id: string
  type: SectionType
  content: SectionContent
  settings: SectionSettings
  order: number
}

export type SectionType = 
  | 'hero'
  | 'about'
  | 'services'
  | 'menu'
  | 'gallery'
  | 'contact'
  | 'testimonials'
  | 'pricing'
  | 'blog'
  | 'booking'
  | 'shop'
  | 'custom'

export interface SectionContent {
  title?: string
  subtitle?: string
  text?: string
  images?: Image[]
  buttons?: Button[]
  items?: any[]
  [key: string]: any
}

export interface SectionSettings {
  backgroundColor?: string
  textColor?: string
  padding?: 'none' | 'small' | 'medium' | 'large'
  margin?: 'none' | 'small' | 'medium' | 'large'
  alignment?: 'left' | 'center' | 'right'
  fullWidth?: boolean
  [key: string]: any
}

export interface Image {
  id: string
  url: string
  alt: string
  width: number
  height: number
  caption?: string
}

export interface Button {
  id: string
  text: string
  url: string
  style: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'sm' | 'md' | 'lg'
}

// Template Types
export interface Template {
  id: string
  name: string
  description: string
  category: 'restaurant' | 'handwerker' | 'shop' | 'service' | 'portfolio'
  thumbnail: string
  preview: string[]
  pages: TemplatePage[]
  features: string[]
  isPremium: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TemplatePage {
  name: string
  slug: string
  isHomePage: boolean
  sections: Section[]
}

// AI Types
export interface AIRequest {
  type: 'voice-to-text' | 'text-to-content' | 'image-generation' | 'auto-branding' | 'content-optimization'
  input: any
  context?: any
}

export interface AIResponse {
  success: boolean
  data: any
  error?: string
  usage?: {
    tokens: number
    cost: number
  }
}

// Builder Types
export interface BuilderState {
  selectedWebsite?: Website
  selectedPage?: Page
  selectedSection?: Section
  isPreviewMode: boolean
  isAIProcessing: boolean
  undoStack: BuilderAction[]
  redoStack: BuilderAction[]
}

export interface BuilderAction {
  id: string
  type: 'add' | 'update' | 'delete' | 'move'
  target: 'page' | 'section' | 'content'
  data: any
  timestamp: Date
}

// API Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface ContactForm {
  name: string
  email: string
  phone?: string
  message: string
  businessType?: string
}

export interface BookingForm {
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  message?: string
}

// Error Types
export interface APIError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Component Props Types
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
