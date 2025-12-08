import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCartStore, useWishlistStore } from '@/stores'
import { useFeaturedProducts, useMaterials } from '@/hooks/useSupabase'
import { formatPrice, getImageUrl, getImageAlt } from '@/lib/utils'
import type { Product } from '@/types'
import { toast } from 'sonner'

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
            src={getImageUrl(product.images[0]) || '/placeholder.jpg'}
            alt={getImageAlt(product.images[0], product.name)}
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
    <Card className="overflow-hidden flex-[0_0_280px] min-w-0">
      <Skeleton className="aspect-square" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
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

  const { data: products = [], isLoading, error } = useFeaturedProducts()

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (error) {
    return null // Silently fail if can't load featured products
  }

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

        {isLoading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured products available</p>
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {products.map((product, index) => (
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
        )}

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
