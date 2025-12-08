// Database Types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: 'customer' | 'admin'
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    newsletter: boolean
  }
  created_at: string
  updated_at: string
}

export interface Material {
  id: string
  name: string
  slug: string
  description: string
  price_per_cm3: number
  colors: MaterialColor[]
  properties: {
    strength: number // 1-10
    flexibility: number // 1-10
    heat_resistance: number // 1-10
    detail: number // 1-10
    food_safe: boolean
    uv_resistant: boolean
  }
  min_layer_height: number
  max_layer_height: number
  image_url: string
  is_active: boolean
  created_at: string
}

export interface MaterialColor {
  name: string
  hex: string
  premium: boolean
  price_modifier: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  base_price?: number
  compare_at_price: number | null
  material_id: string
  material?: Material
  category: ProductCategory
  tags: string[]
  images: (ProductImage | string)[]
  model_url: string | null
  specs: {
    dimensions: { x: number; y: number; z: number }
    weight_grams: number
    layer_height: number
    infill_percentage: number
    print_time_hours: number
  }
  stock_quantity: number
  in_stock?: boolean
  is_featured: boolean
  is_active: boolean
  rating_average: number
  average_rating?: number
  rating_count: number
  review_count?: number
  created_at: string
  updated_at: string
}

export interface ProductImage {
  url: string
  alt: string
  is_primary: boolean
}

export type ProductCategory = 
  | 'prototypes'
  | 'art'
  | 'functional'
  | 'miniatures'
  | 'jewelry'
  | 'home'
  | 'industrial'
  | 'custom'

export interface Order {
  id: string
  user_id: string | null
  order_number: string
  status: OrderStatus
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  total: number
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  coupon_code?: string | null
  shipping_address: Address
  billing_address?: Address
  shipping_method?: 'standard' | 'express'
  tracking_number?: string | null
  tracking_url?: string | null
  notes?: string | null
  stripe_payment_intent_id?: string | null
  items?: OrderItem[]
  created_at: string
  updated_at: string
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'printing'
  | 'quality_check'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product?: Product
  uploaded_model_id: string | null
  uploaded_model?: UploadedModel
  material_id: string
  material?: Material
  color: string
  infill_percentage: number
  layer_height: number
  quantity: number
  unit_price: number
  total_price: number
  thumbnail_url: string | null
  notes: string | null
}

export interface CartItem {
  id: string
  user_id: string | null
  session_id: string | null
  product_id: string | null
  product?: Product
  uploaded_model_id: string | null
  uploaded_model?: UploadedModel
  material_id: string
  material?: Material
  color: string
  infill_percentage: number
  layer_height: number
  quantity: number
  unit_price?: number
  created_at: string
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  product?: Product
  created_at: string
}

export interface Address {
  id?: string
  user_id?: string
  label?: string
  first_name?: string
  last_name?: string
  company?: string
  street?: string
  address_line1?: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  is_default?: boolean
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  order_id: string
  rating: number
  title: string
  content: string
  images: string[]
  is_verified: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  user?: {
    full_name: string
    avatar_url: string | null
  }
}

export interface UploadedModel {
  id: string
  user_id: string | null
  session_id: string | null
  file_name: string
  file_url: string
  thumbnail_url: string | null
  file_size: number
  volume_cm3: number
  dimensions: { x: number; y: number; z: number }
  printability_issues: PrintabilityIssue[]
  is_printable: boolean
  created_at: string
}

export interface PrintabilityIssue {
  type: 'wall_thickness' | 'overhangs' | 'non_manifold' | 'inverted_normals' | 'scale'
  severity: 'warning' | 'error'
  message: string
}

export interface Coupon {
  id: string
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value: number | null
  max_uses: number | null
  used_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  is_subscribed: boolean
  created_at: string
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, string>
}

// Filter & Sort Types
export interface ProductFilters {
  category?: ProductCategory
  material?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  colors?: string[]
  tags?: string[]
  inStock?: boolean
}

export interface ProductSort {
  field: 'price' | 'created_at' | 'rating_average' | 'name'
  direction: 'asc' | 'desc'
}

// Quote Types
export interface QuoteRequest {
  file: File
  material_id: string
  color: string
  infill_percentage: number
  layer_height: number
  quantity: number
}

export interface QuoteResponse {
  uploaded_model: UploadedModel
  price: number
  lead_time_days: number
  breakdown: {
    material_cost: number
    labor_cost: number
    setup_cost: number
  }
}

// Checkout Types
export interface CheckoutData {
  shipping_address: Address
  billing_address: Address
  same_as_shipping: boolean
  shipping_method: 'standard' | 'express'
  coupon_code?: string
  notes?: string
}

// Analytics Types (for admin)
export interface DashboardStats {
  total_revenue: number
  total_orders: number
  total_customers: number
  pending_orders: number
  revenue_change: number
  orders_change: number
  customers_change: number
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

// Search Types
export interface SearchResult {
  products: Product[]
  materials: Material[]
  total: number
}
