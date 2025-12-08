import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Star,
  ShoppingCart,
  Heart,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { useWishlistStore, useCartStore } from '@/stores'
import { formatPrice, capitalizeFirst } from '@/lib/utils'
import type { Product, ProductCategory } from '@/types'

// Mock data
const mockProducts: Product[] = Array.from({ length: 24 }, (_, i) => ({
  id: String(i + 1),
  name: `Product ${i + 1}`,
  slug: `product-${i + 1}`,
  description: 'A high-quality 3D printed product',
  short_description: 'Premium 3D print',
  price: Math.floor(Math.random() * 150) + 20,
  compare_at_price: Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 100 : null,
  material_id: String(Math.floor(Math.random() * 7) + 1),
  category: ['prototypes', 'art', 'functional', 'miniatures', 'jewelry', 'home', 'industrial'][
    Math.floor(Math.random() * 7)
  ] as ProductCategory,
  tags: ['popular', 'new', 'sale'].slice(0, Math.floor(Math.random() * 3) + 1),
  images: [
    {
      url: `https://picsum.photos/seed/${i + 1}/400/400`,
      alt: `Product ${i + 1}`,
      is_primary: true,
    },
  ],
  model_url: null,
  specs: {
    dimensions: { x: 10, y: 10, z: 10 },
    weight_grams: 100,
    layer_height: 0.2,
    infill_percentage: 20,
    print_time_hours: 4,
  },
  stock_quantity: Math.floor(Math.random() * 100),
  is_featured: Math.random() > 0.8,
  is_active: true,
  rating_average: Math.round((Math.random() * 2 + 3) * 10) / 10,
  rating_count: Math.floor(Math.random() * 200),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))

const materials = [
  { id: '1', name: 'PLA', count: 45 },
  { id: '2', name: 'PETG', count: 32 },
  { id: '3', name: 'Resin', count: 28 },
  { id: '4', name: 'TPU', count: 15 },
  { id: '5', name: 'Nylon', count: 12 },
  { id: '6', name: 'Carbon Fiber', count: 8 },
  { id: '7', name: 'Metal', count: 5 },
]

const colors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Purple', hex: '#A855F7' },
]

function ProductCard({ product }: { product: Product }) {
  const { toggleItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null

  return (
    <Card hover className="group relative overflow-hidden">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0]?.url}
          alt={product.images[0]?.alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount && <Badge variant="destructive">-{discount}%</Badge>}
          {product.is_featured && <Badge variant="glow">Featured</Badge>}
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <Badge variant="warning">Low Stock</Badge>
          )}
        </div>

        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 bg-background/80 backdrop-blur-sm ${
            inWishlist ? 'text-red-500' : ''
          }`}
          onClick={() => toggleItem(product)}
        >
          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
        </Button>

        {/* Quick add button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="gradient" className="w-full" size="sm">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <Link to={`/p/${product.slug}`}>
          <h3 className="font-semibold mb-1 hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
          {product.short_description}
        </p>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating_average}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.rating_count} reviews)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProductSkeleton() {
  return (
    <Card>
      <Skeleton className="aspect-square" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
      </CardContent>
    </Card>
  )
}

function FilterSidebar({
  selectedMaterials,
  setSelectedMaterials,
  selectedColors,
  setSelectedColors,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
}: {
  selectedMaterials: string[]
  setSelectedMaterials: (materials: string[]) => void
  selectedColors: string[]
  setSelectedColors: (colors: string[]) => void
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  minRating: number
  setMinRating: (rating: number) => void
}) {
  return (
    <div className="space-y-6">
      {/* Materials */}
      <Accordion type="single" collapsible defaultValue="materials">
        <AccordionItem value="materials" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2">
            <span className="font-semibold">Material</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {materials.map((material) => (
                <div key={material.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`material-${material.id}`}
                    checked={selectedMaterials.includes(material.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMaterials([...selectedMaterials, material.id])
                      } else {
                        setSelectedMaterials(
                          selectedMaterials.filter((m) => m !== material.id)
                        )
                      }
                    }}
                  />
                  <Label
                    htmlFor={`material-${material.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    {material.name}
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    ({material.count})
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Colors */}
      <Accordion type="single" collapsible defaultValue="colors">
        <AccordionItem value="colors" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2">
            <span className="font-semibold">Color</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColors.includes(color.name)
                      ? 'border-primary scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => {
                    if (selectedColors.includes(color.name)) {
                      setSelectedColors(
                        selectedColors.filter((c) => c !== color.name)
                      )
                    } else {
                      setSelectedColors([...selectedColors, color.name])
                    }
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Price Range */}
      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2">
            <span className="font-semibold">Price Range</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                max={500}
                step={10}
              />
              <div className="flex items-center justify-between text-sm">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Rating */}
      <Accordion type="single" collapsible defaultValue="rating">
        <AccordionItem value="rating" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2">
            <span className="font-semibold">Minimum Rating</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                    minRating === rating ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                  onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                >
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm">& Up</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export function ShopPage() {
  const { material } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Filters
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    material ? [material] : []
  )
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState('newest')

  const activeFiltersCount =
    selectedMaterials.length +
    selectedColors.length +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    (minRating > 0 ? 1 : 0)

  // Simulate loading products
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setProducts(mockProducts.slice(0, 12))
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [selectedMaterials, selectedColors, priceRange, minRating, sortBy])

  const loadMore = () => {
    setPage((p) => p + 1)
    // Simulate loading more
    setTimeout(() => {
      const newProducts = mockProducts.slice(products.length, products.length + 12)
      setProducts([...products, ...newProducts])
      if (products.length + newProducts.length >= mockProducts.length) {
        setHasMore(false)
      }
    }, 500)
  }

  const clearFilters = () => {
    setSelectedMaterials([])
    setSelectedColors([])
    setPriceRange([0, 500])
    setMinRating(0)
  }

  const pageTitle = material
    ? `${capitalizeFirst(material.replace('-', ' '))} Products`
    : 'Shop All Products'

  return (
    <>
      <Helmet>
        <title>{pageTitle} | PrintForge</title>
        <meta
          name="description"
          content={`Browse our collection of premium 3D printed ${
            material || 'products'
          }. High-quality prints with fast delivery.`}
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
                {pageTitle}
              </h1>
              <p className="text-muted-foreground">
                Discover high-quality 3D printed products crafted with precision
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </h2>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <FilterSidebar
                  selectedMaterials={selectedMaterials}
                  setSelectedMaterials={setSelectedMaterials}
                  selectedColors={selectedColors}
                  setSelectedColors={setSelectedColors}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  minRating={minRating}
                  setMinRating={setMinRating}
                />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <SlidersHorizontal className="w-5 h-5" />
                          Filters
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterSidebar
                          selectedMaterials={selectedMaterials}
                          setSelectedMaterials={setSelectedMaterials}
                          selectedColors={selectedColors}
                          setSelectedColors={setSelectedColors}
                          priceRange={priceRange}
                          setPriceRange={setPriceRange}
                          minRating={minRating}
                          setMinRating={setMinRating}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <p className="text-sm text-muted-foreground">
                    Showing {products.length} of {mockProducts.length} products
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode */}
                  <div className="hidden sm:flex items-center border rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              <AnimatePresence>
                {activeFiltersCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 mb-6"
                  >
                    {selectedMaterials.map((id) => {
                      const material = materials.find((m) => m.id === id)
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedMaterials(
                              selectedMaterials.filter((m) => m !== id)
                            )
                          }
                        >
                          {material?.name}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      )
                    })}
                    {selectedColors.map((color) => (
                      <Badge
                        key={color}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedColors(selectedColors.filter((c) => c !== color))
                        }
                      >
                        {color}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                    {(priceRange[0] > 0 || priceRange[1] < 500) && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setPriceRange([0, 500])}
                      >
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    )}
                    {minRating > 0 && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setMinRating(0)}
                      >
                        {minRating}+ Stars
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Grid */}
              {isLoading ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1'
                  }`}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">
                    No products found matching your filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className={`grid gap-6 ${
                      viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                    }`}
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="text-center mt-12">
                      <Button variant="outline" size="lg" onClick={loadMore}>
                        Load More Products
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
