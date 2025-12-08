import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useCartStore, useWishlistStore } from '@/stores'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

// Mock featured products data
const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Geometric Vase Collection',
    slug: 'geometric-vase-collection',
    description: 'Modern geometric vase perfect for contemporary spaces',
    short_description: 'Modern geometric vase',
    price: 49.99,
    compare_at_price: 69.99,
    material_id: '1',
    category: 'home',
    tags: ['vase', 'home decor', 'geometric'],
    images: [{ url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400', alt: 'Geometric Vase', is_primary: true }],
    model_url: null,
    specs: { dimensions: { x: 10, y: 10, z: 20 }, weight_grams: 150, layer_height: 0.2, infill_percentage: 20, print_time_hours: 4 },
    stock_quantity: 50,
    is_featured: true,
    is_active: true,
    rating_average: 4.8,
    rating_count: 124,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Articulated Dragon',
    slug: 'articulated-dragon',
    description: 'Fully articulated dragon with flexible joints',
    short_description: 'Flexible articulated dragon',
    price: 34.99,
    compare_at_price: null,
    material_id: '1',
    category: 'art',
    tags: ['dragon', 'articulated', 'toy'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'Dragon', is_primary: true }],
    model_url: null,
    specs: { dimensions: { x: 15, y: 5, z: 5 }, weight_grams: 80, layer_height: 0.15, infill_percentage: 15, print_time_hours: 6 },
    stock_quantity: 100,
    is_featured: true,
    is_active: true,
    rating_average: 4.9,
    rating_count: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Cable Management Box',
    slug: 'cable-management-box',
    description: 'Keep your desk organized with this sleek cable box',
    short_description: 'Desk cable organizer',
    price: 24.99,
    compare_at_price: 34.99,
    material_id: '2',
    category: 'functional',
    tags: ['organizer', 'desk', 'cables'],
    images: [{ url: 'https://images.unsplash.com/photo-1586920740099-f3ceb65bc51e?w=400', alt: 'Cable Box', is_primary: true }],
    model_url: null,
    specs: { dimensions: { x: 20, y: 10, z: 8 }, weight_grams: 200, layer_height: 0.2, infill_percentage: 25, print_time_hours: 3 },
    stock_quantity: 200,
    is_featured: true,
    is_active: true,
    rating_average: 4.7,
    rating_count: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Miniature Castle Set',
    slug: 'miniature-castle-set',
    description: 'Detailed miniature castle for tabletop gaming',
    short_description: 'Tabletop miniature castle',
    price: 89.99,
    compare_at_price: null,
    material_id: '3',
    category: 'miniatures',
    tags: ['miniature', 'castle', 'gaming'],
    images: [{ url: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400', alt: 'Castle', is_primary: true }],
    model_url: null,
    specs: { dimensions: { x: 30, y: 30, z: 40 }, weight_grams: 500, layer_height: 0.1, infill_percentage: 20, print_time_hours: 12 },
    stock_quantity: 25,
    is_featured: true,
    is_active: true,
    rating_average: 5.0,
    rating_count: 43,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Industrial Bracket Set',
    slug: 'industrial-bracket-set',
    description: 'Heavy-duty carbon fiber brackets for industrial use',
    short_description: 'Carbon fiber brackets',
    price: 149.99,
    compare_at_price: 179.99,
    material_id: '6',
    category: 'industrial',
    tags: ['bracket', 'industrial', 'carbon fiber'],
    images: [{ url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400', alt: 'Brackets', is_primary: true }],
    model_url: null,
    specs: { dimensions: { x: 10, y: 5, z: 3 }, weight_grams: 50, layer_height: 0.15, infill_percentage: 80, print_time_hours: 2 },
    stock_quantity: 75,
    is_featured: true,
    is_active: true,
    rating_average: 4.6,
    rating_count: 67,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Pendant Light Shade',
    slug: 'pendant-light-shade',
    description: 'Elegant pendant lamp shade with intricate patterns',
    short_description: 'Designer lamp shade',
    price: 59.99,
    compare_at_price: null,
    material_id: '1',
    category: 'home',
    tags: ['lighting', 'home decor', 'pendant'],
    images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', alt: 'Lamp Shade', is_primary: true }],
    model_url: null,
    specs: { dimensions: { x: 25, y: 25, z: 20 }, weight_grams: 120, layer_height: 0.15, infill_percentage: 10, print_time_hours: 8 },
    stock_quantity: 40,
    is_featured: true,
    is_active: true,
    rating_average: 4.8,
    rating_count: 92,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
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
          {discount && (
            <Badge variant="destructive">-{discount}%</Badge>
          )}
          {product.is_featured && (
            <Badge variant="glow">Featured</Badge>
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

export function FeaturedProducts() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Featured <span className="text-gradient">Products</span>
            </h2>
            <p className="text-muted-foreground">
              Handpicked designs, expertly printed
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={scrollPrev}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={scrollNext}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-[0_0_280px] min-w-0"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button variant="outline" size="lg" asChild>
            <Link to="/shop">
              View All Products
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
