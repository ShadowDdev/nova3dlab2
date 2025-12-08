import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Star,
  ShoppingCart,
  Heart,
  ChevronDown,
  Filter,
  Search,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useProducts, useMaterials, useCategories } from '@/hooks/useSupabase'
import { formatPrice, capitalizeFirst, getImageUrl, getImageAlt } from '@/lib/utils'
import type { Product, ProductCategory } from '@/types'
import { toast } from 'sonner'

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'prototypes', label: 'Prototypes' },
  { value: 'art', label: 'Art & Decor' },
  { value: 'functional', label: 'Functional Parts' },
  { value: 'miniatures', label: 'Miniatures' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'home', label: 'Home & Living' },
  { value: 'industrial', label: 'Industrial' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name', label: 'Name A-Z' },
]

function ProductCard({ product }: { product: Product }) {
  const { toggleItem, isInWishlist } = useWishlistStore()
  const { addItem, openCart } = useCartStore()
  const { data: materials } = useMaterials()
  const inWishlist = isInWishlist(product.id)

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const material = materials?.find(m => m.id === product.material_id) || product.material
    if (!material) {
      toast.error('Product not available')
      return
    }

    addItem({
      product,
      material,
      color: material.colors[0]?.name || 'Default',
      infill_percentage: product.specs.infill_percentage,
      layer_height: product.specs.layer_height,
      quantity: 1,
    })
    toast.success('Added to cart!', {
      action: {
        label: 'View Cart',
        onClick: openCart,
      },
    })
  }

  return (
    <Link to={`/product/${product.slug}`}>
      <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={getImageUrl(product.images[0])}
            alt={getImageAlt(product.images[0], product.name)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount && <Badge variant="destructive">-{discount}%</Badge>}
            {product.is_featured && <Badge variant="glow">Featured</Badge>}
            {product.stock_quantity > 0 && product.stock_quantity < 10 && (
              <Badge variant="warning">Low Stock</Badge>
            )}
          </div>

          {/* Wishlist button */}
          <Button
            variant="secondary"
            size="icon"
            className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${
              inWishlist ? 'text-red-500' : ''
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleItem(product)
            }}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </Button>

          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
            <Button
              variant="gradient"
              className="w-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-medium mb-1 truncate">{product.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{product.rating_average.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.rating_count})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </CardContent>
    </Card>
  )
}

function FilterPanel({
  selectedMaterials,
  setSelectedMaterials,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  onClear,
}: {
  selectedMaterials: string[]
  setSelectedMaterials: (materials: string[]) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  minRating: number
  setMinRating: (rating: number) => void
  onClear: () => void
}) {
  const { data: materials = [] } = useMaterials()

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={['category', 'material', 'price', 'rating']}>
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <button
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !selectedCategory ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedCategory('')}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="material">
          <AccordionTrigger>Material</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {materials.map((mat) => (
                <label key={mat.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedMaterials.includes(mat.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMaterials([...selectedMaterials, mat.id])
                      } else {
                        setSelectedMaterials(selectedMaterials.filter((m) => m !== mat.id))
                      }
                    }}
                  />
                  <span>{mat.name}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={500}
                step={10}
              />
              <div className="flex justify-between text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Minimum Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    minRating === rating ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => setMinRating(rating)}
                >
                  {rating === 0 ? (
                    'Any Rating'
                  ) : (
                    <>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span>& Up</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button variant="outline" className="w-full" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  )
}

export function ShopPage() {
  const { category: urlCategory } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || '')
  const [priceRange, setPriceRange] = useState([0, 500])
  const [minRating, setMinRating] = useState(0)
  const [page, setPage] = useState(0)
  const limit = 12

  // Fetch products from Supabase
  const { data: products = [], isLoading, error } = useProducts({
    category: selectedCategory || undefined,
    material: selectedMaterials[0] || undefined,
    search: searchQuery || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    sortBy: sortBy as 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'name',
    limit,
    offset: page * limit,
  })

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (searchQuery) params.set('q', searchQuery)
    setSearchParams(params, { replace: true })
  }, [sortBy, searchQuery, setSearchParams])

  // Update category from URL
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory)
    }
  }, [urlCategory])

  const clearFilters = () => {
    setSelectedMaterials([])
    setSelectedCategory('')
    setPriceRange([0, 500])
    setMinRating(0)
    setSearchQuery('')
    setPage(0)
  }

  const activeFiltersCount =
    selectedMaterials.length +
    (selectedCategory ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    (minRating > 0 ? 1 : 0)

  return (
    <>
      <Helmet>
        <title>
          {selectedCategory
            ? `${capitalizeFirst(selectedCategory)} Products | Nova3D Lab`
            : 'Shop All Products | Nova3D Lab'}
        </title>
        <meta
          name="description"
          content="Browse our collection of premium 3D printed products. From functional parts to art pieces, find the perfect item for your needs."
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
                {selectedCategory
                  ? capitalizeFirst(selectedCategory)
                  : 'All Products'}
              </h1>
              <p className="text-muted-foreground">
                Discover our collection of premium 3D printed products
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge>{activeFiltersCount}</Badge>
                  )}
                </h2>
                <FilterPanel
                  selectedMaterials={selectedMaterials}
                  setSelectedMaterials={setSelectedMaterials}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  onClear={clearFilters}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge className="ml-2">{activeFiltersCount}</Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterPanel
                          selectedMaterials={selectedMaterials}
                          setSelectedMaterials={setSelectedMaterials}
                          selectedCategory={selectedCategory}
                          setSelectedCategory={setSelectedCategory}
                          priceRange={priceRange}
                          setPriceRange={setPriceRange}
                          minRating={minRating}
                          setMinRating={setMinRating}
                          onClear={clearFilters}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="hidden sm:flex border rounded-lg">
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
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {capitalizeFirst(selectedCategory)}
                      <button onClick={() => setSelectedCategory('')}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedMaterials.map((mat) => (
                    <Badge key={mat} variant="secondary" className="gap-1">
                      {mat}
                      <button
                        onClick={() =>
                          setSelectedMaterials(selectedMaterials.filter((m) => m !== mat))
                        }
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {(priceRange[0] > 0 || priceRange[1] < 500) && (
                    <Badge variant="secondary" className="gap-1">
                      ${priceRange[0]} - ${priceRange[1]}
                      <button onClick={() => setPriceRange([0, 500])}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {minRating > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      {minRating}+ Stars
                      <button onClick={() => setMinRating(0)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              )}

              {/* Products Grid */}
              {isLoading ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1'
                  }`}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Failed to load products. Please try again.
                  </p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </Card>
              ) : products.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No products found matching your criteria.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`grid gap-6 ${
                      viewMode === 'grid'
                        ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
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
                  </motion.div>

                  {/* Load More */}
                  {products.length >= limit && (
                    <div className="mt-8 text-center">
                      <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
