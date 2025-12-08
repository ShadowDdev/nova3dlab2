import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  ShoppingCart,
  Trash2,
  ShoppingBag,
  Share2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWishlistStore, useCartStore, useAuthStore } from '@/stores'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import type { Material } from '@/types'

// Mock materials for adding to cart
const defaultMaterial: Material = {
  id: '1',
  name: 'PLA',
  slug: 'pla',
  description: 'Eco-friendly, beginner-friendly',
  price_per_cm3: 0.05,
  colors: [{ name: 'Black', hex: '#1a1a1a', premium: false, price_modifier: 0 }],
  properties: { strength: 6, flexibility: 3, heat_resistance: 4, detail: 8 },
  min_layer_height: 0.1,
  max_layer_height: 0.3,
  image_url: '',
  is_active: true,
  created_at: new Date().toISOString(),
}

export function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const { addItem: addToCart, openCart } = useCartStore()
  const { isLoggedIn } = useAuthStore()

  const handleAddToCart = (item: (typeof items)[0]) => {
    addToCart({
      product: item,
      material: defaultMaterial,
      color: defaultMaterial.colors[0].name,
      infill_percentage: 20,
      layer_height: 0.2,
      quantity: 1,
    })

    toast.success(`${item.name} added to cart!`, {
      action: {
        label: 'View Cart',
        onClick: openCart,
      },
    })
  }

  const handleAddAllToCart = () => {
    items.forEach((item) => {
      addToCart({
        product: item,
        material: defaultMaterial,
        color: defaultMaterial.colors[0].name,
        infill_percentage: 20,
        layer_height: 0.2,
        quantity: 1,
      })
    })

    toast.success(`${items.length} items added to cart!`, {
      action: {
        label: 'View Cart',
        onClick: openCart,
      },
    })
  }

  const handleShare = async () => {
    const productNames = items.map((item) => item.name).join(', ')
    const shareText = `Check out my PrintForge wishlist: ${productNames}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My PrintForge Wishlist',
          text: shareText,
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Wishlist link copied to clipboard!')
    }
  }

  if (!isLoggedIn) {
    return (
      <>
        <Helmet>
          <title>Wishlist | PrintForge</title>
        </Helmet>

        <div className="min-h-screen pt-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-4"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Save Your Favorites</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Sign in to save products to your wishlist and access them from any
              device.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="lg" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Wishlist | PrintForge</title>
        <meta
          name="description"
          content="View and manage your saved products. Add them to your cart when you're ready to order."
        />
      </Helmet>

      <div className="min-h-screen pt-20">
        {/* Header */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  My <span className="text-gradient">Wishlist</span>
                </h1>
                <p className="text-muted-foreground">
                  {items.length === 0
                    ? 'Start saving products you love'
                    : `${items.length} saved item${items.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              {items.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="gradient" onClick={handleAddAllToCart}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add All to Cart
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Browse our products and click the heart icon to save items you
                love. They'll appear here for easy access later.
              </p>
              <Button variant="gradient" size="lg" asChild>
                <Link to="/shop">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Shopping
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Product Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="group overflow-hidden">
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <img
                            src={item.images?.[0] || '/placeholder.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          {/* Quick Actions */}
                          <div className="absolute top-2 right-2 flex flex-col gap-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {!item.in_stock && (
                              <Badge variant="destructive">Out of Stock</Badge>
                            )}
                            {item.compare_at_price &&
                              item.compare_at_price > item.base_price && (
                                <Badge className="bg-red-500">
                                  {Math.round(
                                    (1 -
                                      item.base_price / item.compare_at_price) *
                                      100
                                  )}
                                  % OFF
                                </Badge>
                              )}
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <Link
                            to={`/product/${item.slug}`}
                            className="group/link"
                          >
                            <h3 className="font-semibold truncate group-hover/link:text-primary transition-colors">
                              {item.name}
                            </h3>
                          </Link>

                          {item.category && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.category.name}
                            </p>
                          )}

                          {/* Price */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(item.base_price)}
                            </span>
                            {item.compare_at_price &&
                              item.compare_at_price > item.base_price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(item.compare_at_price)}
                                </span>
                              )}
                          </div>

                          {/* Rating */}
                          {item.average_rating && (
                            <div className="flex items-center gap-1 mt-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(item.average_rating!)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-muted-foreground'
                                    }`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ({item.review_count})
                              </span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="gradient"
                              className="flex-1"
                              onClick={() => handleAddToCart(item)}
                              disabled={!item.in_stock}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <Link to={`/product/${item.slug}`}>
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Clear Wishlist */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={clearWishlist}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Wishlist
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
