import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF, PresentationControls } from '@react-three/drei'
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Maximize2,
  Truck,
  Shield,
  RotateCcw,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Upload,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCartStore, useWishlistStore, useAuthStore } from '@/stores'
import { useProduct, useReviews, useRelatedProducts, useMaterials, useCreateReview } from '@/hooks/useSupabase'
import { formatPrice, formatDate, getInitials, calculateLeadTime, getImageUrl, getImageAlt } from '@/lib/utils'
import type { Product, Review } from '@/types'
import { toast } from 'sonner'

// 3D Model Viewer Component
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function Model3DViewer({ modelUrl }: { modelUrl: string | null }) {
  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">No 3D model available</p>
      </div>
    )
  }

  return (
    <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <PresentationControls
        global
        rotation={[0.13, 0.1, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-1, 0.75]}
        snap={true}
      >
        <Stage environment="city" intensity={0.6}>
          <Model url={modelUrl} />
        </Stage>
      </PresentationControls>
      <OrbitControls enableZoom enablePan={false} />
    </Canvas>
  )
}

// Rating breakdown component
function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
      : 0,
  }))

  return (
    <div className="space-y-2">
      {ratingCounts.map(({ rating, count, percentage }) => (
        <div key={rating} className="flex items-center gap-3">
          <span className="text-sm w-12">{rating} star</span>
          <Progress value={percentage} className="flex-1 h-2" />
          <span className="text-sm text-muted-foreground w-8">{count}</span>
        </div>
      ))}
    </div>
  )
}

// Review Form Component
function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess: () => void }) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const { mutate: createReview, isPending } = useCreateReview()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createReview(
      { product_id: productId, rating, title, comment },
      {
        onSuccess: () => {
          toast.success('Review submitted successfully!')
          setTitle('')
          setComment('')
          setRating(5)
          onSuccess()
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to submit review')
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Your Review</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others what you think about this product..."
          rows={4}
          required
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Submit Review
      </Button>
    </form>
  )
}

// Related Products Carousel
function RelatedProducts({ productId, categoryId }: { productId: string; categoryId: string | null }) {
  const { data: products, isLoading } = useRelatedProducts(productId, categoryId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    )
  }

  if (!products?.length) return null

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} to={`/product/${product.slug}`}>
            <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={getImageUrl(product.images[0])}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium truncate">{product.name}</h3>
                <p className="text-primary font-bold">{formatPrice(product.price)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [selectedImage, setSelectedImage] = useState(0)
  const [showModel, setShowModel] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [infill, setInfill] = useState([20])
  const [layerHeight, setLayerHeight] = useState('0.2')
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  const { addItem, openCart } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  // Fetch data from Supabase
  const { data: product, isLoading: productLoading, error: productError } = useProduct(slug || '')
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(product?.id || '')
  const { data: materials = [] } = useMaterials()

  // Get material for the product
  const material = materials.find(m => m.id === product?.material_id) || product?.material

  // Set initial color when material loads
  useEffect(() => {
    if (material?.colors?.length && !selectedColor) {
      setSelectedColor(material.colors[0].name)
    }
  }, [material, selectedColor])

  if (productLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/shop">Browse Products</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null

  const selectedColorData = material?.colors?.find((c) => c.name === selectedColor)
  const totalPrice = product.price + (selectedColorData?.price_modifier || 0)
  const volume = product.specs.dimensions.x * product.specs.dimensions.y * product.specs.dimensions.z
  const leadTime = calculateLeadTime(volume)

  const handleAddToCart = () => {
    if (!material) {
      toast.error('Please wait for product data to load')
      return
    }

    addItem({
      product,
      material,
      color: selectedColor,
      infill_percentage: infill[0],
      layer_height: parseFloat(layerHeight),
      quantity,
    })
    toast.success('Added to cart!', {
      action: {
        label: 'View Cart',
        onClick: openCart,
      },
    })
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | Nova 3D Lab</title>
        <meta name="description" content={product.short_description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.short_description} />
        <meta property="og:image" content={getImageUrl(product.images[0])} />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.short_description,
            "image": getImageUrl(product.images[0]),
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "USD",
              "availability": product.stock_quantity !== 0 ? "InStock" : "OutOfStock",
            },
            "aggregateRating": product.rating_count > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": product.rating_average,
              "reviewCount": product.rating_count,
            } : undefined,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen pt-20">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/shop" className="hover:text-foreground">Shop</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                {showModel && product.model_url ? (
                  <Model3DViewer modelUrl={product.model_url} />
                ) : (
                  <img
                    src={getImageUrl(product.images[selectedImage]) || '/placeholder.jpg'}
                    alt={getImageAlt(product.images[selectedImage], product.name)}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* View toggle */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {product.model_url && (
                    <Button
                      variant={showModel ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setShowModel(!showModel)}
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      {showModel ? '2D View' : '3D View'}
                    </Button>
                  )}
                  <Button variant="secondary" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Badges */}
                {discount && (
                  <Badge variant="destructive" className="absolute top-4 left-4 z-10 text-sm px-3 py-1">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedImage(index)
                        setShowModel(false)
                      }}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={getImageAlt(image, `${product.name} thumbnail ${index + 1}`)}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{product.rating_average.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({product.rating_count} reviews)
                  </span>
                </div>

                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  {product.name}
                </h1>
                <p className="text-muted-foreground">{product.short_description}</p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(totalPrice * quantity)}
                </span>
                {product.compare_at_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price * quantity)}
                  </span>
                )}
              </div>

              <Separator />

              {/* Color Selection */}
              {material?.colors && material.colors.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Color: <span className="text-muted-foreground">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {material.colors.map((color) => (
                      <button
                        key={color.name}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.name
                            ? 'border-primary scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => setSelectedColor(color.name)}
                        title={`${color.name}${color.premium ? ' (+$' + color.price_modifier + ')' : ''}`}
                      >
                        {selectedColor === color.name && (
                          <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg" />
                        )}
                        {color.premium && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-[10px] flex items-center justify-center text-white">
                            +
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Infill */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Infill: <span className="text-muted-foreground">{infill[0]}%</span>
                </label>
                <Slider
                  value={infill}
                  onValueChange={setInfill}
                  min={10}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Light (10%)</span>
                  <span>Solid (100%)</span>
                </div>
              </div>

              {/* Layer Height */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Layer Height / Quality
                </label>
                <Select value={layerHeight} onValueChange={setLayerHeight}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">0.1mm - Ultra Fine (Slowest)</SelectItem>
                    <SelectItem value="0.15">0.15mm - Fine</SelectItem>
                    <SelectItem value="0.2">0.2mm - Standard (Recommended)</SelectItem>
                    <SelectItem value="0.3">0.3mm - Draft (Fastest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium mb-3 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {product.stock_quantity > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {product.stock_quantity} in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Lead Time */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span>
                  Estimated delivery:{' '}
                  <strong>{leadTime} business days</strong>
                </span>
              </div>

              {/* Upload Your Own File Button */}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your Own Design
                </Link>
              </Button>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="gradient"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!material}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => toggleItem(product)}
                  className={inWishlist ? 'text-red-500' : ''}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">Over $100</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs">Quality Guarantee</p>
                  <p className="text-xs text-muted-foreground">100% Inspected</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30 Days</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mt-16">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6 prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Dimensions</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Width</span>
                          <span>{product.specs.dimensions.x} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Depth</span>
                          <span>{product.specs.dimensions.y} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Height</span>
                          <span>{product.specs.dimensions.z} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight</span>
                          <span>{product.specs.weight_grams}g</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Print Settings</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Material</span>
                          <span>{material?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Layer Height</span>
                          <span>{product.specs.layer_height}mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Infill</span>
                          <span>{product.specs.infill_percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Print Time</span>
                          <span>~{product.specs.print_time_hours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Rating Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold mb-2">{product.rating_average.toFixed(1)}</div>
                      <div className="flex justify-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(product.rating_average)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on {product.rating_count} reviews
                      </p>
                    </div>
                    <RatingBreakdown reviews={reviews} />
                    
                    {isAuthenticated ? (
                      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full mt-6">
                            Write a Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                          </DialogHeader>
                          <ReviewForm 
                            productId={product.id} 
                            onSuccess={() => setShowReviewDialog(false)} 
                          />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button variant="outline" className="w-full mt-6" asChild>
                        <Link to="/login">Sign in to Review</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.user?.avatar_url || ''} />
                              <AvatarFallback>
                                {getInitials(review.user?.full_name || 'User')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold">{review.user?.full_name || 'Anonymous'}</p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-muted'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    {review.is_verified && (
                                      <Badge variant="secondary" className="text-xs">
                                        Verified Purchase
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(review.created_at)}
                                </span>
                              </div>
                              {review.title && <h4 className="font-medium mb-2">{review.title}</h4>}
                              <p className="text-muted-foreground">{review.content}</p>
                              {review.images.length > 0 && (
                                <div className="flex gap-2 mt-4">
                                  {review.images.map((img, i) => (
                                    <img
                                      key={i}
                                      src={img}
                                      alt=""
                                      className="w-20 h-20 rounded-lg object-cover"
                                    />
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                <button className="hover:text-foreground">
                                  Helpful ({review.helpful_count})
                                </button>
                                <button className="hover:text-foreground">Report</button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          <RelatedProducts productId={product.id} categoryId={product.category} />
        </div>
      </div>
    </>
  )
}
