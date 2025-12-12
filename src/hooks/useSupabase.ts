import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { 
  Product, 
  Material, 
  Review, 
  Profile,
  CartItem,
  Order,
  ProductFilters 
} from '@/types'
import { useAuthStore } from '@/stores'

// Query Keys
export const queryKeys = {
  products: ['products'] as const,
  product: (slug: string) => ['products', slug] as const,
  featuredProducts: ['products', 'featured'] as const,
  materials: ['materials'] as const,
  material: (id: string) => ['materials', id] as const,
  categories: ['categories'] as const,
  reviews: (productId: string) => ['reviews', productId] as const,
  profile: (userId: string) => ['profile', userId] as const,
  cart: (userId: string | null) => ['cart', userId] as const,
  orders: (userId: string) => ['orders', userId] as const,
  faqs: ['faqs'] as const,
}

// ============================================
// PRODUCTS
// ============================================

interface ProductsParams {
  category?: string
  material?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'name'
  limit?: number
  offset?: number
  featured?: boolean
}

export function useProducts(params: ProductsParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.products, params],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          material:materials(*)
        `)
        .eq('in_stock', true)

      if (params.category) {
        query = query.eq('category_id', params.category)
      }

      if (params.material) {
        query = query.contains('available_materials', [params.material])
      }

      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      }

      if (params.minPrice !== undefined) {
        query = query.gte('base_price', params.minPrice)
      }

      if (params.maxPrice !== undefined) {
        query = query.lte('base_price', params.maxPrice)
      }

      if (params.minRating !== undefined) {
        query = query.gte('average_rating', params.minRating)
      }

      if (params.featured) {
        query = query.eq('is_featured', true)
      }

      // Sorting
      switch (params.sortBy) {
        case 'price_asc':
          query = query.order('base_price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('base_price', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'rating':
          query = query.order('average_rating', { ascending: false, nullsFirst: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      if (params.limit) {
        query = query.limit(params.limit)
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 12) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return transformProducts(data || [])
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: queryKeys.featuredProducts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          material:materials(*)
        `)
        .eq('is_featured', true)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw error
      return transformProducts(data || [])
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.product(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          material:materials(*)
        `)
        .eq('slug', slug)
        .single()

      if (error) throw error
      return transformProduct(data)
    },
    enabled: !!slug,
  })
}

export function useRelatedProducts(productId: string, categoryId: string | null) {
  return useQuery({
    queryKey: ['products', 'related', productId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          material:materials(*)
        `)
        .neq('id', productId)
        .eq('in_stock', true)
        .limit(4)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query

      if (error) throw error
      return transformProducts(data || [])
    },
    enabled: !!productId,
  })
}

// ============================================
// MATERIALS
// ============================================

export function useMaterials() {
  return useQuery({
    queryKey: queryKeys.materials,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return transformMaterials(data || [])
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: queryKeys.material(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return transformMaterial(data)
    },
    enabled: !!id,
  })
}

// ============================================
// CATEGORIES
// ============================================

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 30,
  })
}

// ============================================
// REVIEWS
// ============================================

export function useReviews(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews(productId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return transformReviews(data || [])
    },
    enabled: !!productId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (review: {
      product_id: string
      rating: number
      title: string
      comment: string
      images?: string[]
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Must be logged in to leave a review')

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...review,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews(variables.product_id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.product(variables.product_id) })
    },
  })
}

// ============================================
// CART (Supabase sync for logged-in users)
// ============================================

export function useCartItems() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: queryKeys.cart(user?.id || null),
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*),
          material:materials(*)
        `)
        .eq('user_id', user.id)

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

export function useSyncCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, items }: { userId: string; items: CartItem[] }) => {
      // Clear existing cart
      await supabase.from('cart_items').delete().eq('user_id', userId)

      if (items.length === 0) return

      // Insert new items
      const { error } = await supabase.from('cart_items').insert(
        items.map((item) => ({
          user_id: userId,
          product_id: item.product_id,
          uploaded_model_id: item.uploaded_model_id,
          material_id: item.material_id,
          quantity: item.quantity,
          color: item.color,
          infill_percentage: item.infill_percentage,
          layer_height: item.layer_height,
        }))
      )

      if (error) throw error
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart(userId) })
    },
  })
}

// ============================================
// ORDERS
// ============================================

export function useOrders() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: queryKeys.orders(user?.id || ''),
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*),
            material:materials(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

// ============================================
// ADMIN: Dashboard Stats
// ============================================

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      console.log('[Admin Stats] Fetching dashboard stats...')
      
      // Get total revenue and orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total, status, created_at')
      
      if (ordersError) {
        console.error('[Admin Stats] Error fetching orders:', ordersError.message, ordersError.code)
        // Return empty stats instead of throwing
        return {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalCustomers: 0,
        }
      }
      console.log('[Admin Stats] Orders fetched:', orders?.length || 0)

      // Get total products
      const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
      
      if (productError) {
        console.error('[Admin Stats] Error fetching product count:', productError.message)
      }
      console.log('[Admin Stats] Products count:', productCount)

      // Get total customers
      const { count: customerCount, error: customerError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (customerError) {
        console.error('[Admin Stats] Error fetching customer count:', customerError.message)
      }
      console.log('[Admin Stats] Customers count:', customerCount)

      const totalRevenue = orders?.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0) || 0
      const totalOrders = orders?.length || 0

      console.log('[Admin Stats] Done. Revenue:', totalRevenue, 'Orders:', totalOrders)
      
      return {
        totalRevenue,
        totalOrders,
        totalProducts: productCount || 0,
        totalCustomers: customerCount || 0,
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    placeholderData: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
    },
  })
}

export function useAdminOrders(params: { status?: string; search?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      // First try with email column (after migration)
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:profiles(id, full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status)
      }

      if (params.search) {
        query = query.or(`order_number.ilike.%${params.search}%`)
      }

      if (params.limit) {
        query = query.limit(params.limit)
      }

      let { data, error } = await query

      // If email column doesn't exist, fallback to query without email
      if (error?.code === '42703') {
        console.warn('Email column not found in profiles, using fallback query')
        let fallbackQuery = supabase
          .from('orders')
          .select(`
            *,
            user:profiles(id, full_name)
          `)
          .order('created_at', { ascending: false })

        if (params.status && params.status !== 'all') {
          fallbackQuery = fallbackQuery.eq('status', params.status)
        }

        if (params.search) {
          fallbackQuery = fallbackQuery.or(`order_number.ilike.%${params.search}%`)
        }

        if (params.limit) {
          fallbackQuery = fallbackQuery.limit(params.limit)
        }

        const fallbackResult = await fallbackQuery
        data = fallbackResult.data
        error = fallbackResult.error
      }

      if (error) {
        console.error('Error fetching admin orders:', error)
        return []
      }
      
      return data?.map(order => ({
        ...order,
        customer: order.user?.full_name || (order.user as any)?.email || 'Unknown Customer',
      })) || []
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    placeholderData: [],
  })
}

export function useAdminProducts(params: { search?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (params.search) {
        query = query.ilike('name', `%${params.search}%`)
      }

      if (params.limit) {
        query = query.limit(params.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching admin products:', error)
        return []
      }
      return data || []
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    placeholderData: [],
  })
}

export function useAdminMaterialStats() {
  return useQuery({
    queryKey: ['admin', 'material-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          material:materials(name)
        `)

      if (error) {
        console.error('Error fetching material stats:', error)
        return []
      }

      // Count by material
      const counts: Record<string, number> = {}
      data?.forEach(item => {
        const name = (item.material as any)?.name || 'Unknown'
        counts[name] = (counts[name] || 0) + 1
      })

      const total = Object.values(counts).reduce((a, b) => a + b, 0)
      
      return Object.entries(counts)
        .map(([name, orders]) => ({
          name,
          orders,
          percentage: total > 0 ? Math.round((orders / total) * 100) : 0,
        }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5)
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    placeholderData: [],
  })
}

// ============================================
// FAQs
// ============================================

export function useFaqs() {
  return useQuery({
    queryKey: queryKeys.faqs,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 30,
  })
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToProducts(callback: (payload: any) => void) {
  return supabase
    .channel('products-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      callback
    )
    .subscribe()
}

export function subscribeToOrders(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('orders-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe()
}

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

function transformProducts(data: any[]): Product[] {
  return data.map(transformProduct)
}

function transformProduct(data: any): Product {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    short_description: data.short_description || '',
    price: parseFloat(data.base_price) || 0,
    compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
    material_id: data.default_material_id || '',
    material: data.material ? transformMaterial(data.material) : undefined,
    category: data.category_id || 'custom',
    tags: data.tags || [],
    images: Array.isArray(data.images) ? data.images : [],
    model_url: data.model_url,
    specs: {
      dimensions: data.dimensions || { x: 0, y: 0, z: 0 },
      weight_grams: data.weight_grams || 0,
      layer_height: parseFloat(data.layer_height) || 0.2,
      infill_percentage: data.infill_percentage || 20,
      print_time_hours: parseFloat(data.print_time_hours) || 0,
    },
    stock_quantity: data.stock_quantity ?? -1,
    is_featured: data.is_featured || false,
    is_active: data.in_stock !== false,
    rating_average: parseFloat(data.average_rating) || 0,
    rating_count: data.review_count || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

function transformMaterials(data: any[]): Material[] {
  return data.map(transformMaterial)
}

function transformMaterial(data: any): Material {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    price_per_cm3: parseFloat(data.price_per_cm3) || 0,
    colors: Array.isArray(data.colors) ? data.colors : [],
    properties: data.properties || {
      strength: 5,
      flexibility: 5,
      heat_resistance: 5,
      detail: 5,
      food_safe: false,
      uv_resistant: false,
    },
    min_layer_height: parseFloat(data.min_layer_height) || 0.1,
    max_layer_height: parseFloat(data.max_layer_height) || 0.3,
    image_url: data.image_url || '',
    is_active: data.is_active !== false,
    created_at: data.created_at,
  }
}

function transformReviews(data: any[]): Review[] {
  return data.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    product_id: r.product_id,
    order_id: r.order_id || '',
    rating: r.rating,
    title: r.title || '',
    content: r.comment || '',
    images: Array.isArray(r.images) ? r.images : [],
    is_verified: r.is_verified || false,
    helpful_count: r.helpful_count || 0,
    created_at: r.created_at,
    updated_at: r.updated_at,
    user: r.user
      ? {
          full_name: r.user.full_name || 'Anonymous',
          avatar_url: r.user.avatar_url,
        }
      : undefined,
  }))
}
