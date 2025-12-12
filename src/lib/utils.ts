import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ProductImage } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to get image URL from ProductImage or string
export function getImageUrl(image: ProductImage | string | undefined, fallback: string = '/placeholder.jpg'): string {
  if (!image) return fallback
  if (typeof image === 'string') return image
  return image.url || fallback
}

// Helper to get image alt text
export function getImageAlt(image: ProductImage | string | undefined, fallback: string = 'Product image'): string {
  if (!image) return fallback
  if (typeof image === 'string') return fallback
  return image.alt || fallback
}

export function formatPrice(price: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

// Format price in Indian Rupees with proper Indian number formatting
export function formatPriceInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDateShort(date)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculateVolume(dimensions: { x: number; y: number; z: number }): number {
  return dimensions.x * dimensions.y * dimensions.z
}

export function calculatePrice(
  volumeCm3: number,
  pricePerCm3: number,
  infillPercentage: number = 20,
  quantity: number = 1
): number {
  const effectiveVolume = volumeCm3 * (infillPercentage / 100)
  return effectiveVolume * pricePerCm3 * quantity
}

export function calculateLeadTime(
  volumeCm3: number,
  quantity: number = 1,
  priority: 'standard' | 'express' = 'standard'
): number {
  const baseHours = Math.ceil(volumeCm3 / 10) * quantity
  const baseDays = Math.ceil(baseHours / 24)
  return priority === 'express' ? Math.max(1, Math.ceil(baseDays / 2)) : baseDays + 2
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/
  return phoneRegex.test(phone)
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isValidModelFile(filename: string): boolean {
  const validExtensions = ['stl', 'obj', '3mf', 'step', 'stp']
  return validExtensions.includes(getFileExtension(filename))
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'text-yellow-500 bg-yellow-500/10',
    processing: 'text-blue-500 bg-blue-500/10',
    printing: 'text-purple-500 bg-purple-500/10',
    quality_check: 'text-orange-500 bg-orange-500/10',
    shipped: 'text-cyan-500 bg-cyan-500/10',
    delivered: 'text-green-500 bg-green-500/10',
    cancelled: 'text-red-500 bg-red-500/10',
  }
  return statusColors[status] || 'text-gray-500 bg-gray-500/10'
}

export function getOrderStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    printing: 'Printing',
    quality_check: 'Quality Check',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return statusLabels[status] || status
}
