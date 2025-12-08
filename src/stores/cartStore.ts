import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, Material, Product, UploadedModel } from '@/types'
import { calculatePrice } from '@/lib/utils'

interface CartItemInput {
  product?: Product
  uploaded_model?: UploadedModel
  material: Material
  color: string
  infill_percentage: number
  layer_height: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItemInput) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateItem: (id: string, updates: Partial<CartItemInput>) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getSubtotal: () => number
  getItemCount: () => number
  getItemPrice: (item: CartItem) => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (input) => {
        const id = crypto.randomUUID()
        const newItem: CartItem = {
          id,
          user_id: null,
          session_id: localStorage.getItem('printforge_session_id'),
          product_id: input.product?.id || null,
          product: input.product,
          uploaded_model_id: input.uploaded_model?.id || null,
          uploaded_model: input.uploaded_model,
          material_id: input.material.id,
          material: input.material,
          color: input.color,
          infill_percentage: input.infill_percentage,
          layer_height: input.layer_height,
          quantity: input.quantity,
          created_at: new Date().toISOString(),
        }

        set((state) => {
          // Check if similar item exists
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product_id === newItem.product_id &&
              item.uploaded_model_id === newItem.uploaded_model_id &&
              item.material_id === newItem.material_id &&
              item.color === newItem.color &&
              item.infill_percentage === newItem.infill_percentage &&
              item.layer_height === newItem.layer_height
          )

          if (existingIndex >= 0) {
            const updatedItems = [...state.items]
            updatedItems[existingIndex].quantity += input.quantity
            return { items: updatedItems, isOpen: true }
          }

          return { items: [...state.items, newItem], isOpen: true }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () => {
        const { items, getItemPrice } = get()
        return items.reduce((total, item) => total + getItemPrice(item), 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },

      getItemPrice: (item) => {
        if (item.product) {
          // For pre-made products, use the product price
          const colorModifier = item.material?.colors.find(c => c.name === item.color)?.price_modifier || 0
          return (item.product.price + colorModifier) * item.quantity
        } else if (item.uploaded_model && item.material) {
          // For custom uploads, calculate based on volume
          return calculatePrice(
            item.uploaded_model.volume_cm3,
            item.material.price_per_cm3,
            item.infill_percentage,
            item.quantity
          )
        }
        return 0
      },
    }),
    {
      name: 'printforge-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
