import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileType,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  Check,
  Info,
  Loader2,
  Box,
  Ruler,
  Scale,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { useCartStore } from '@/stores'
import { useMaterials } from '@/hooks'
import { formatPrice, formatFileSize, isValidModelFile, calculatePrice, calculateLeadTime } from '@/lib/utils'
import type { UploadedModel, Material, PrintabilityIssue } from '@/types'
import { toast } from 'sonner'

// Default materials fallback if Supabase is unavailable
const defaultMaterials: Material[] = [
  {
    id: '1',
    name: 'PLA',
    slug: 'pla',
    description: 'Eco-friendly, beginner-friendly',
    price_per_cm3: 0.05,
    colors: [
      { name: 'Black', hex: '#1a1a1a', premium: false, price_modifier: 0 },
      { name: 'White', hex: '#ffffff', premium: false, price_modifier: 0 },
      { name: 'Red', hex: '#ef4444', premium: false, price_modifier: 0 },
      { name: 'Blue', hex: '#3b82f6', premium: false, price_modifier: 0 },
      { name: 'Green', hex: '#22c55e', premium: false, price_modifier: 0 },
    ],
    properties: { strength: 6, flexibility: 3, heat_resistance: 4, detail: 8, food_safe: true, uv_resistant: false },
    min_layer_height: 0.1,
    max_layer_height: 0.3,
    image_url: '',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'PETG',
    slug: 'petg',
    description: 'Strong, water-resistant',
    price_per_cm3: 0.07,
    colors: [
      { name: 'Black', hex: '#1a1a1a', premium: false, price_modifier: 0 },
      { name: 'Clear', hex: '#e5e7eb', premium: false, price_modifier: 0 },
      { name: 'Blue', hex: '#3b82f6', premium: false, price_modifier: 0 },
    ],
    properties: { strength: 8, flexibility: 4, heat_resistance: 7, detail: 7, food_safe: true, uv_resistant: true },
    min_layer_height: 0.1,
    max_layer_height: 0.3,
    image_url: '',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Resin',
    slug: 'resin',
    description: 'Ultra-detailed, smooth finish',
    price_per_cm3: 0.12,
    colors: [
      { name: 'Grey', hex: '#6b7280', premium: false, price_modifier: 0 },
      { name: 'White', hex: '#ffffff', premium: false, price_modifier: 0 },
      { name: 'Black', hex: '#1a1a1a', premium: false, price_modifier: 0 },
      { name: 'Clear', hex: '#e5e7eb', premium: true, price_modifier: 5 },
    ],
    properties: { strength: 5, flexibility: 2, heat_resistance: 5, detail: 10, food_safe: false, uv_resistant: false },
    min_layer_height: 0.025,
    max_layer_height: 0.1,
    image_url: '',
    is_active: true,
    created_at: new Date().toISOString(),
  },
]

interface UploadedFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'analyzing' | 'ready' | 'error'
  model?: UploadedModel
  error?: string
}

interface FileConfig {
  material_id: string
  color: string
  infill: number
  layer_height: number
  quantity: number
  scale: number
}

function analyzeModel(file: File): Promise<UploadedModel> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate model analysis
      const volume = Math.random() * 100 + 10
      const x = Math.random() * 15 + 5
      const y = Math.random() * 15 + 5
      const z = Math.random() * 20 + 5

      const issues: PrintabilityIssue[] = []
      if (Math.random() > 0.7) {
        issues.push({
          type: 'overhangs',
          severity: 'warning',
          message: 'Model has overhangs greater than 45°. Supports may be needed.',
        })
      }
      if (Math.random() > 0.8) {
        issues.push({
          type: 'wall_thickness',
          severity: 'warning',
          message: 'Some walls are thinner than 1mm and may not print properly.',
        })
      }

      resolve({
        id: crypto.randomUUID(),
        user_id: null,
        session_id: null,
        file_name: file.name,
        file_url: URL.createObjectURL(file),
        thumbnail_url: null,
        file_size: file.size,
        volume_cm3: volume,
        dimensions: { x, y, z },
        printability_issues: issues,
        is_printable: issues.filter((i) => i.severity === 'error').length === 0,
        created_at: new Date().toISOString(),
      })
    }, 2000)
  })
}

export function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [configs, setConfigs] = useState<Record<string, FileConfig>>({})
  const [expandedFile, setExpandedFile] = useState<string | null>(null)
  const { addItem, openCart } = useCartStore()
  
  // Fetch materials from Supabase
  const { data: supabaseMaterials, isLoading: materialsLoading } = useMaterials()
  
  // Use Supabase materials if available, otherwise fall back to defaults
  const materials = (supabaseMaterials && supabaseMaterials.length > 0) 
    ? supabaseMaterials 
    : defaultMaterials

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (!isValidModelFile(file.name)) {
        toast.error(`Invalid file type: ${file.name}. Accepted: STL, OBJ, 3MF, STEP`)
        continue
      }

      const id = crypto.randomUUID()
      const uploadedFile: UploadedFile = {
        id,
        file,
        progress: 0,
        status: 'uploading',
      }

      setFiles((prev) => [...prev, uploadedFile])

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: i } : f))
        )
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'analyzing' } : f))
      )

      try {
        const model = await analyzeModel(file)
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: 'ready', model } : f))
        )
        // Use first material from list or default to '1'
        const defaultMaterial = materials[0]
        setConfigs((prev) => ({
          ...prev,
          [id]: {
            material_id: defaultMaterial?.id || '1',
            color: defaultMaterial?.colors?.[0]?.name || 'Black',
            infill: 20,
            layer_height: 0.2,
            quantity: 1,
            scale: 100,
          },
        }))
        if (!expandedFile) {
          setExpandedFile(id)
        }
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: 'error', error: 'Failed to analyze file' } : f
          )
        )
      }
    }
  }, [expandedFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/stl': ['.stl'],
      'model/obj': ['.obj'],
      'model/3mf': ['.3mf'],
      'model/step': ['.step', '.stp'],
    },
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    const newConfigs = { ...configs }
    delete newConfigs[id]
    setConfigs(newConfigs)
    if (expandedFile === id) {
      setExpandedFile(null)
    }
  }

  const updateConfig = (id: string, updates: Partial<FileConfig>) => {
    setConfigs((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }))
  }

  const getQuote = (file: UploadedFile) => {
    if (!file.model) return null
    const config = configs[file.id]
    if (!config) return null

    const material = materials.find((m) => m.id === config.material_id)
    if (!material) return null

    const scaledVolume = file.model.volume_cm3 * (config.scale / 100) ** 3
    const price = calculatePrice(scaledVolume, material.price_per_cm3, config.infill, config.quantity)
    const leadTime = calculateLeadTime(scaledVolume, config.quantity)

    return { price, leadTime, scaledVolume }
  }

  const addToCart = (file: UploadedFile) => {
    if (!file.model) return
    const config = configs[file.id]
    const material = materials.find((m) => m.id === config.material_id)
    if (!material) return

    addItem({
      uploaded_model: file.model,
      material,
      color: config.color,
      infill_percentage: config.infill,
      layer_height: config.layer_height,
      quantity: config.quantity,
    })

    toast.success('Added to cart!', {
      action: {
        label: 'View Cart',
        onClick: openCart,
      },
    })
  }

  const getTotalQuote = () => {
    let totalPrice = 0
    let maxLeadTime = 0

    files.forEach((file) => {
      const quote = getQuote(file)
      if (quote) {
        totalPrice += quote.price
        maxLeadTime = Math.max(maxLeadTime, quote.leadTime)
      }
    })

    return { totalPrice, maxLeadTime }
  }

  const readyFiles = files.filter((f) => f.status === 'ready')
  const { totalPrice, maxLeadTime } = getTotalQuote()

  return (
    <>
      <Helmet>
        <title>Upload & Get Quote | PrintForge</title>
        <meta
          name="description"
          content="Upload your 3D model files and get an instant quote. Supported formats: STL, OBJ, 3MF, STEP."
        />
      </Helmet>

      <div className="min-h-screen pt-20">
        {/* Header */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Upload & Get <span className="text-gradient">Instant Quote</span>
              </h1>
              <p className="text-muted-foreground">
                Upload your 3D models and we'll analyze them instantly. Supported
                formats: STL, OBJ, 3MF, STEP
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Area & Files */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dropzone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={isDragActive ? 'border-primary border-2' : ''}>
                  <CardContent className="p-0">
                    <div
                      {...getRootProps()}
                      className="p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input {...getInputProps()} />
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {isDragActive
                          ? 'Drop your files here'
                          : 'Drag & drop your 3D files'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        or click to browse your computer
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['STL', 'OBJ', '3MF', 'STEP'].map((format) => (
                          <Badge key={format} variant="secondary">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Files List */}
              <AnimatePresence mode="popLayout">
                {files.map((file, index) => {
                  const config = configs[file.id]
                  const quote = getQuote(file)
                  const material = config
                    ? materials.find((m) => m.id === config.material_id)
                    : null

                  return (
                    <motion.div
                      key={file.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <FileType className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold truncate">
                                    {file.file.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {formatFileSize(file.file.size)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {file.status === 'ready' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        setExpandedFile(
                                          expandedFile === file.id ? null : file.id
                                        )
                                      }
                                    >
                                      {expandedFile === file.id ? (
                                        <ChevronUp className="w-5 h-5" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5" />
                                      )}
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFile(file.id)}
                                  >
                                    <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                                  </Button>
                                </div>
                              </div>

                              {/* Progress */}
                              {(file.status === 'uploading' ||
                                file.status === 'analyzing') && (
                                <div className="mt-4">
                                  <div className="flex items-center justify-between text-sm mb-2">
                                    <span>
                                      {file.status === 'uploading'
                                        ? 'Uploading...'
                                        : 'Analyzing model...'}
                                    </span>
                                    {file.status === 'uploading' && (
                                      <span>{file.progress}%</span>
                                    )}
                                  </div>
                                  <Progress
                                    value={
                                      file.status === 'analyzing' ? 100 : file.progress
                                    }
                                    className={
                                      file.status === 'analyzing' ? 'animate-pulse' : ''
                                    }
                                  />
                                </div>
                              )}

                              {/* Error */}
                              {file.status === 'error' && (
                                <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                  {file.error}
                                </div>
                              )}

                              {/* Model Info */}
                              {file.status === 'ready' && file.model && (
                                <div className="mt-4">
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Box className="w-4 h-4 text-muted-foreground" />
                                      <span>
                                        {file.model.volume_cm3.toFixed(1)} cm³
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Ruler className="w-4 h-4 text-muted-foreground" />
                                      <span>
                                        {file.model.dimensions.x.toFixed(1)} ×{' '}
                                        {file.model.dimensions.y.toFixed(1)} ×{' '}
                                        {file.model.dimensions.z.toFixed(1)} cm
                                      </span>
                                    </div>
                                    {quote && (
                                      <div className="flex items-center gap-2 text-primary font-semibold">
                                        <DollarSign className="w-4 h-4" />
                                        <span>{formatPrice(quote.price)}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Warnings */}
                                  {file.model.printability_issues.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                      {file.model.printability_issues.map(
                                        (issue, i) => (
                                          <div
                                            key={i}
                                            className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                                              issue.severity === 'error'
                                                ? 'bg-destructive/10 text-destructive'
                                                : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                            }`}
                                          >
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{issue.message}</span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Configuration */}
                          <AnimatePresence>
                            {expandedFile === file.id && config && material && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <Separator className="my-6" />
                                <div className="grid sm:grid-cols-2 gap-6">
                                  {/* Material */}
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      Material
                                    </label>
                                    <Select
                                      value={config.material_id}
                                      onValueChange={(value) =>
                                        updateConfig(file.id, {
                                          material_id: value,
                                          color:
                                            materials.find((m) => m.id === value)
                                              ?.colors[0].name || 'Black',
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {materials.map((m) => (
                                          <SelectItem key={m.id} value={m.id}>
                                            {m.name} - {formatPrice(m.price_per_cm3)}
                                            /cm³
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Color */}
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      Color
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                      {material.colors.map((color) => (
                                        <button
                                          key={color.name}
                                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                                            config.color === color.name
                                              ? 'border-primary scale-110'
                                              : 'border-transparent'
                                          }`}
                                          style={{ backgroundColor: color.hex }}
                                          onClick={() =>
                                            updateConfig(file.id, {
                                              color: color.name,
                                            })
                                          }
                                          title={color.name}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  {/* Infill */}
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      Infill: {config.infill}%
                                    </label>
                                    <Slider
                                      value={[config.infill]}
                                      onValueChange={([value]) =>
                                        updateConfig(file.id, { infill: value })
                                      }
                                      min={10}
                                      max={100}
                                      step={5}
                                    />
                                  </div>

                                  {/* Layer Height */}
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      Layer Height
                                    </label>
                                    <Select
                                      value={String(config.layer_height)}
                                      onValueChange={(value) =>
                                        updateConfig(file.id, {
                                          layer_height: parseFloat(value),
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0.1">
                                          0.1mm - Ultra Fine
                                        </SelectItem>
                                        <SelectItem value="0.15">
                                          0.15mm - Fine
                                        </SelectItem>
                                        <SelectItem value="0.2">
                                          0.2mm - Standard
                                        </SelectItem>
                                        <SelectItem value="0.3">
                                          0.3mm - Draft
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Scale */}
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      Scale: {config.scale}%
                                    </label>
                                    <Slider
                                      value={[config.scale]}
                                      onValueChange={([value]) =>
                                        updateConfig(file.id, { scale: value })
                                      }
                                      min={25}
                                      max={400}
                                      step={25}
                                    />
                                  </div>

                                  {/* Quantity */}
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      Quantity
                                    </label>
                                    <Select
                                      value={String(config.quantity)}
                                      onValueChange={(value) =>
                                        updateConfig(file.id, {
                                          quantity: parseInt(value),
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[1, 2, 3, 4, 5, 10, 20, 50, 100].map(
                                          (qty) => (
                                            <SelectItem
                                              key={qty}
                                              value={String(qty)}
                                            >
                                              {qty}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                  {quote && (
                                    <div className="space-y-1">
                                      <p className="text-2xl font-bold text-primary">
                                        {formatPrice(quote.price)}
                                      </p>
                                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {quote.leadTime} business days
                                      </p>
                                    </div>
                                  )}
                                  <Button
                                    variant="gradient"
                                    onClick={() => addToCart(file)}
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Quote Summary */}
            <div>
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>Quote Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {readyFiles.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Upload files to see your quote</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {readyFiles.map((file) => {
                          const quote = getQuote(file)
                          const config = configs[file.id]
                          return (
                            <div
                              key={file.id}
                              className="flex justify-between items-center text-sm"
                            >
                              <div className="truncate flex-1">
                                <p className="truncate">{file.file.name}</p>
                                <p className="text-muted-foreground">
                                  ×{config?.quantity || 1}
                                </p>
                              </div>
                              <span className="font-medium">
                                {quote ? formatPrice(quote.price) : '-'}
                              </span>
                            </div>
                          )
                        })}

                        <Separator />

                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-semibold">
                            {formatPrice(totalPrice)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Lead Time
                          </span>
                          <span>{maxLeadTime} business days</span>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center text-lg">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-primary">
                            {formatPrice(totalPrice)}
                          </span>
                        </div>

                        <Button
                          variant="gradient"
                          className="w-full"
                          size="lg"
                          onClick={() => {
                            readyFiles.forEach((file) => addToCart(file))
                          }}
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Add All to Cart
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">FAQ</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="px-6 pb-6">
                      <AccordionItem value="formats">
                        <AccordionTrigger className="text-sm">
                          What file formats do you accept?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm">
                          We accept STL, OBJ, 3MF, and STEP files. For best
                          results, export your models in binary STL format.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="pricing">
                        <AccordionTrigger className="text-sm">
                          How is pricing calculated?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm">
                          Pricing is based on material volume, infill percentage,
                          layer height, and quantity. Volume discounts apply for
                          larger orders.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="quality">
                        <AccordionTrigger className="text-sm">
                          What quality can I expect?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm">
                          We maintain strict quality control. Standard tolerance
                          is ±0.2mm for FDM prints and ±0.1mm for resin prints.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
