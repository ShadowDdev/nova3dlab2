import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

// Validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  base_price: z.number().min(0, 'Price must be positive'),
  category_id: z.string().optional(),
  tags: z.string().optional(),
  is_featured: z.boolean(),
  in_stock: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any // Product to edit, null for new product
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function ProductFormModal({ open, onOpenChange, product }: ProductFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [existingModelUrl, setExistingModelUrl] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const queryClient = useQueryClient()

  const isEditing = !!product

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      short_description: '',
      base_price: 0,
      category_id: '',
      tags: '',
      is_featured: false,
      in_stock: true,
    },
  })

  const watchName = watch('name')

  // Auto-generate slug from name (only for new products)
  useEffect(() => {
    if (!isEditing && watchName) {
      setValue('slug', generateSlug(watchName))
    }
  }, [watchName, isEditing, setValue])

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      if (data) setCategories(data)
    }
    loadCategories()
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        short_description: product.short_description || '',
        base_price: product.base_price || 0,
        category_id: product.category_id || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        is_featured: product.is_featured || false,
        in_stock: product.in_stock !== false,
      })
      // Set existing images
      if (product.images && Array.isArray(product.images)) {
        setExistingImages(product.images)
      }
      // Set existing model URL
      if (product.model_url) {
        setExistingModelUrl(product.model_url)
      }
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        short_description: '',
        base_price: 0,
        category_id: '',
        tags: '',
        is_featured: false,
        in_stock: true,
      })
      setExistingImages([])
      setExistingModelUrl(null)
    }
    setImageFiles([])
    setImagePreviewUrls([])
    setModelFile(null)
  }, [product, reset])

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files])
      // Create preview URLs
      const newUrls = files.map(file => URL.createObjectURL(file))
      setImagePreviewUrls(prev => [...prev, ...newUrls])
    }
  }

  // Remove a new image
  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(imagePreviewUrls[index])
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  // Remove an existing image
  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  // Handle model file selection
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setModelFile(file)
      setExistingModelUrl(null) // Clear existing model when new one is selected
    }
  }

  // Upload file to Supabase Storage
  async function uploadFile(file: File, bucket: string, folder: string): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return urlData.publicUrl
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)

    try {
      // Upload new images
      const uploadedImageUrls: string[] = []
      for (const file of imageFiles) {
        const url = await uploadFile(file, 'products', 'images')
        if (url) uploadedImageUrls.push(url)
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageUrls]

      // Upload model file if provided
      let modelUrl = existingModelUrl
      if (modelFile) {
        const uploadedModelUrl = await uploadFile(modelFile, 'products', 'models')
        if (uploadedModelUrl) modelUrl = uploadedModelUrl
      }

      // Parse tags
      const tags = data.tags
        ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
        : []

      // Prepare product data
      const productData = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        short_description: data.short_description || null,
        base_price: data.base_price,
        category_id: data.category_id || null,
        tags,
        is_featured: data.is_featured,
        in_stock: data.in_stock,
        images: allImages,
        model_url: modelUrl,
        thumbnail_url: allImages[0] || null,
      }

      if (isEditing) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)

        if (error) throw error
        toast.success('Product updated successfully!')
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData)

        if (error) throw error
        toast.success('Product created successfully!')
      }

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })

      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error.message || 'Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name & Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Geometric Vase"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="e.g., geometric-vase"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Input
              id="short_description"
              {...register('short_description')}
              placeholder="Brief product summary"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed product description..."
              rows={4}
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_price">Price (₹) *</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                min="0"
                {...register('base_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.base_price && (
                <p className="text-sm text-destructive">{errors.base_price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={watch('category_id') || ''}
                onValueChange={(value) => setValue('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="e.g., home decor, modern, gift"
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {/* Existing images */}
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative w-20 h-20 border rounded overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-0 right-0 bg-destructive text-white p-0.5 rounded-bl"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* New image previews */}
              {imagePreviewUrls.map((url, index) => (
                <div key={`new-${index}`} className="relative w-20 h-20 border rounded overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-0 right-0 bg-destructive text-white p-0.5 rounded-bl"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* Upload button */}
              <label className="w-20 h-20 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 3D Model */}
          <div className="space-y-2">
            <Label>3D Model File (.glb, .stl)</Label>
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                  {modelFile ? (
                    <p className="text-sm">{modelFile.name}</p>
                  ) : existingModelUrl ? (
                    <p className="text-sm text-green-600">Model uploaded ✓</p>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-sm text-muted-foreground">Upload 3D model (optional)</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".glb,.stl,.gltf"
                    onChange={handleModelChange}
                    className="hidden"
                  />
                </div>
              </label>
              {(modelFile || existingModelUrl) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModelFile(null)
                    setExistingModelUrl(null)
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={watch('is_featured')}
                onCheckedChange={(checked) => setValue('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Featured Product</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="in_stock"
                checked={watch('in_stock')}
                onCheckedChange={(checked) => setValue('in_stock', checked)}
              />
              <Label htmlFor="in_stock">In Stock</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
