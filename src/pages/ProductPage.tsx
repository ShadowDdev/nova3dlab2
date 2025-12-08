import { useState, useEffect, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, PresentationControls } from '@react-three/drei'
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
  Check,
  Package,
  Clock,
  Maximize2,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCartStore, useWishlistStore } from '@/stores'
import { formatPrice, formatDate, getInitials, calculateLeadTime } from '@/lib/utils'
import type { Product, Material, Review } from '@/types'
import { toast } from 'sonner'

// Mock data
const mockProduct: Product = {
  id: '1',
  name: 'Geometric Vase Collection',
  slug: 'geometric-vase-collection',
  description: `
    <p>Elevate your interior design with our stunning Geometric Vase Collection. Each vase is 3D printed with precision using premium PLA material, featuring intricate geometric patterns that catch light beautifully.</p>
    <h3>Features</h3>
    <ul>
      <li>Modern minimalist design</li>
      <li>Water-tight when sealed</li>
      <li>Multiple size options</li>
      <li>Perfect for dried flowers or as standalone decor</li>
    </ul>
    <h3>Care Instructions</h3>
    <p>Clean with a damp cloth. For water use, ensure the internal seal is intact. Not dishwasher safe.</p>
  `,
  short_description: 'Modern geometric vase perfect for contemporary spaces',
  price: 49.99,
  compare_at_price: 69.99,
  material_id: '1',
  category: 'home',
  tags: ['vase', 'home decor', 'geometric', 'modern'],
  images: [
    { url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800', alt: 'Geometric Vase Front', is_primary: true },
    { url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800', alt: 'Geometric Vase Side', is_primary: false },
    { url: 'https://images.unsplash.com/photo-1612198273689-b437f53152ca?w=800', alt: 'Geometric Vase Detail', is_primary: false },
    { url: 'https://images.unsplash.com/photo-1578247249874-2707c21cfc45?w=800', alt: 'Geometric Vase in Room', is_primary: false },
  ],
  model_url: '/models/vase.glb',
  specs: {
    dimensions: { x: 10, y: 10, z: 20 },
    weight_grams: 150,
    layer_height: 0.2,
    infill_percentage: 20,
    print_time_hours: 4,
  },
  stock_quantity: 50,
  is_featured: true,
  is_active: true,
  rating_average: 4.8,
  rating_count: 124,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockMaterial: Material = {
  id: '1',
  name: 'PLA',
  slug: 'pla',
  description: 'Eco-friendly and beginner-friendly material',
  price_per_cm3: 0.05,
  colors: [
    { name: 'Matte Black', hex: '#1a1a1a', premium: false, price_modifier: 0 },
    { name: 'Pure White', hex: '#ffffff', premium: false, price_modifier: 0 },
    { name: 'Forest Green', hex: '#228B22', premium: false, price_modifier: 0 },
    { name: 'Ocean Blue', hex: '#006994', premium: false, price_modifier: 0 },
    { name: 'Sunset Orange', hex: '#fd5c28', premium: true, price_modifier: 5 },
    { name: 'Rose Gold', hex: '#b76e79', premium: true, price_modifier: 10 },
  ],
  properties: {
    strength: 6,
    flexibility: 3,
    heat_resistance: 4,
    detail: 8,
    food_safe: true,
    uv_resistant: false,
  },
  min_layer_height: 0.1,
  max_layer_height: 0.3,
  image_url: '',
  is_active: true,
  created_at: new Date().toISOString(),
}

const mockReviews: Review[] = [
  {
    id: '1',
    user_id: '1',
    product_id: '1',
    order_id: '1',
    rating: 5,
    title: 'Absolutely stunning!',
    content: 'The quality exceeded my expectations. The geometric patterns are crisp and the finish is flawless. It looks amazing on my shelf.',
    images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=200'],
    is_verified: true,
    helpful_count: 24,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user: { full_name: 'Sarah Chen', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  },
  {
    id: '2',
    user_id: '2',
    product_id: '1',
    order_id: '2',
    rating: 5,
    title: 'Perfect gift',
    content: 'Bought this for my partner and she loved it! The rose gold color is even more beautiful in person.',
    images: [],
    is_verified: true,
    helpful_count: 18,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user: { full_name: 'Marcus Johnson', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  },
  {
    id: '3',
    user_id: '3',
    product_id: '1',
    order_id: '3',
    rating: 4,
    title: 'Great quality, minor imperfection',
    content: 'The vase is beautiful overall. There was a tiny layer line visible on one side, but it\'s barely noticeable. Still very happy with the purchase.',
    images: [],
    is_verified: true,
    helpful_count: 12,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user: { full_name: 'Emily Rodriguez', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
  },
]

function Model3DViewer() {
  return (
    <div className="w-full h-full bg-muted/30 rounded-xl">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <PresentationControls
            global
            zoom={0.8}
            rotation={[0, -Math.PI / 4, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <mesh>
              <cylinderGeometry args={[0.5, 0.8, 2, 32]} />
              <meshStandardMaterial color="#0ea5e9" metalness={0.3} roughness={0.4} />
            </mesh>
          </PresentationControls>
          <ContactShadows position={[0, -1.2, 0]} opacity={0.4} blur={2} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  )
}

function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100,
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

export function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [material, setMaterial] = useState<Material | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showModel, setShowModel] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [infill, setInfill] = useState([20])
  const [layerHeight, setLayerHeight] = useState('0.2')

  const { addItem, openCart } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()

  useEffect(() => {
    // Simulate loading
    setIsLoading(true)
    setTimeout(() => {
      setProduct(mockProduct)
      setMaterial(mockMaterial)
      setSelectedColor(mockMaterial.colors[0].name)
      setIsLoading(false)
    }, 500)
  }, [slug])

  if (isLoading || !product || !material) {
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

  const inWishlist = isInWishlist(product.id)
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null

  const selectedColorData = material.colors.find((c) => c.name === selectedColor)
  const totalPrice = product.price + (selectedColorData?.price_modifier || 0)
  const leadTime = calculateLeadTime(product.specs.dimensions.x * product.specs.dimensions.y * product.specs.dimensions.z)

  const handleAddToCart = () => {
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
        <title>{product.name} | PrintForge</title>
        <meta name="description" content={product.short_description} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.short_description,
            "image": product.images[0]?.url,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "USD",
              "availability": product.stock_quantity > 0 ? "InStock" : "OutOfStock",
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating_average,
              "reviewCount": product.rating_count,
            },
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
                {showModel ? (
                  <Model3DViewer />
                ) : (
                  <img
                    src={product.images[selectedImage]?.url}
                    alt={product.images[selectedImage]?.alt}
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
                  <Badge variant="destructive" className="absolute top-4 left-4">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {/* Thumbnails */}
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
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
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
                    <span className="font-semibold">{product.rating_average}</span>
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
                  <span className="text-sm text-muted-foreground">
                    {product.stock_quantity} in stock
                  </span>
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

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="gradient"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
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
                Reviews ({mockReviews.length})
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
                          <span>{material.name}</span>
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
                      <div className="text-5xl font-bold mb-2">{product.rating_average}</div>
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
                    <RatingBreakdown reviews={mockReviews} />
                    <Button variant="outline" className="w-full mt-6">
                      Write a Review
                    </Button>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                  {mockReviews.map((review) => (
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
                                <p className="font-semibold">{review.user?.full_name}</p>
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
                                    <Badge variant="success" className="text-xs">
                                      Verified Purchase
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                            <h4 className="font-medium mb-2">{review.title}</h4>
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
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
