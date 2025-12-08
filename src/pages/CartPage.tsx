import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  Truck,
  Shield,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/stores'
import { formatPrice } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } =
    useCartStore()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discount: number
  } | null>(null)

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return

    // Mock coupon validation
    if (couponCode.toUpperCase() === 'WELCOME10') {
      setAppliedCoupon({ code: 'WELCOME10', discount: 10 })
      toast.success('Coupon applied! 10% discount')
    } else if (couponCode.toUpperCase() === 'FIRST20') {
      setAppliedCoupon({ code: 'FIRST20', discount: 20 })
      toast.success('Coupon applied! 20% discount')
    } else {
      toast.error('Invalid coupon code')
    }
    setCouponCode('')
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    toast.info('Coupon removed')
  }

  const discount = appliedCoupon ? subtotal * (appliedCoupon.discount / 100) : 0
  const shipping = subtotal > 75 ? 0 : 9.99
  const tax = (subtotal - discount) * 0.1 // 10% tax
  const total = subtotal - discount + shipping + tax

  return (
    <>
      <Helmet>
        <title>Shopping Cart | PrintForge</title>
        <meta
          name="description"
          content="Review your cart and proceed to checkout. Free shipping on orders over $75."
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
                Shopping <span className="text-gradient">Cart</span>
              </h1>
              <p className="text-muted-foreground">
                {totalItems === 0
                  ? 'Your cart is empty'
                  : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
              </p>
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
                <ShoppingCart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet. Start
                shopping to find amazing 3D printed products!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/shop">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Browse Products
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/upload">Upload Your Design</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardContent className="p-4 md:p-6">
                          <div className="flex gap-4 md:gap-6">
                            {/* Image */}
                            <div className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                              {item.product?.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product?.name || 'Custom Print'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold truncate">
                                    {item.product?.name ||
                                      item.uploaded_model?.file_name ||
                                      'Custom Print'}
                                  </h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {item.material && (
                                      <Badge variant="secondary">
                                        {item.material.name}
                                      </Badge>
                                    )}
                                    {item.color && (
                                      <Badge variant="outline">{item.color}</Badge>
                                    )}
                                    {item.infill_percentage && (
                                      <Badge variant="outline">
                                        {item.infill_percentage}% Infill
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </div>

                              <div className="flex items-end justify-between mt-4">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        Math.max(1, item.quantity - 1)
                                      )
                                    }
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-12 text-center font-medium">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                  <p className="text-lg font-semibold">
                                    {formatPrice(item.unit_price * item.quantity)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="text-sm text-muted-foreground">
                                      {formatPrice(item.unit_price)} each
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Clear Cart */}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => {
                      clearCart()
                      setAppliedCoupon(null)
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Cart
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="sticky top-24 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Coupon */}
                      <div>
                        {appliedCoupon ? (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              <span className="font-medium">
                                {appliedCoupon.code}
                              </span>
                              <span className="text-sm">
                                ({appliedCoupon.discount}% off)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={removeCoupon}
                              className="h-auto p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === 'Enter' && handleApplyCoupon()
                              }
                            />
                            <Button variant="outline" onClick={handleApplyCoupon}>
                              Apply
                            </Button>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Price Breakdown */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                            <span>Discount ({appliedCoupon.discount}%)</span>
                            <span>-{formatPrice(discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>
                            {shipping === 0 ? (
                              <span className="text-green-600 dark:text-green-400">
                                FREE
                              </span>
                            ) : (
                              formatPrice(shipping)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Tax (estimated)
                          </span>
                          <span>{formatPrice(tax)}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(total)}</span>
                      </div>

                      {shipping === 0 && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                          <Truck className="w-4 h-4" />
                          <span>You've qualified for free shipping!</span>
                        </div>
                      )}

                      {shipping > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Add {formatPrice(75 - subtotal)} more for free shipping
                        </div>
                      )}

                      <Button
                        variant="gradient"
                        className="w-full"
                        size="lg"
                        asChild
                      >
                        <Link to="/checkout">
                          Proceed to Checkout
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                      <Shield className="w-5 h-5 text-primary" />
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                      <Truck className="w-5 h-5 text-primary" />
                      <span>Fast Shipping</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
