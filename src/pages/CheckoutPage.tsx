import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CreditCard,
  Truck,
  MapPin,
  Shield,
  Lock,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCartStore, useAuthStore } from '@/stores'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
  saveAddress: z.boolean().optional(),
})

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Valid card number is required'),
  cardName: z.string().min(2, 'Name on card is required'),
  expiryDate: z.string().min(5, 'Valid expiry date is required'),
  cvv: z.string().min(3, 'Valid CVV is required'),
  saveCard: z.boolean().optional(),
})

type ShippingForm = z.infer<typeof shippingSchema>
type PaymentForm = z.infer<typeof paymentSchema>

const steps = [
  { id: 'shipping', title: 'Shipping', icon: MapPin },
  { id: 'payment', title: 'Payment', icon: CreditCard },
  { id: 'review', title: 'Review', icon: Package },
]

const shippingOptions = [
  { id: 'standard', name: 'Standard Shipping', price: 9.99, days: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 19.99, days: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 39.99, days: '1 business day' },
]

export function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [shippingOption, setShippingOption] = useState('standard')
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCartStore()
  const { user, profile } = useAuthStore()

  const [shippingData, setShippingData] = useState<ShippingForm | null>(null)

  const shippingForm = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: profile?.full_name?.split(' ')[0] || '',
      lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      saveAddress: true,
    },
  })

  const paymentForm = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      saveCard: false,
    },
  })

  const selectedShipping = shippingOptions.find((o) => o.id === shippingOption)!
  const shippingCost = subtotal >= 75 ? 0 : selectedShipping.price
  const tax = subtotal * 0.1
  const total = subtotal + shippingCost + tax

  const onShippingSubmit = (data: ShippingForm) => {
    setShippingData(data)
    setCurrentStep(1)
  }

  const onPaymentSubmit = () => {
    setCurrentStep(2)
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Clear cart and redirect
    clearCart()
    toast.success('Order placed successfully!')
    navigate('/account?tab=orders')
  }

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Checkout | PrintForge</title>
        </Helmet>
        <div className="min-h-screen pt-20 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some items to your cart before checking out.
            </p>
            <Button variant="gradient" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Checkout | PrintForge</title>
        <meta name="description" content="Complete your order with secure checkout." />
      </Helmet>

      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-24 h-1 mx-2 rounded ${
                        index < currentStep ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Shipping Step */}
                {currentStep === 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={shippingForm.handleSubmit(onShippingSubmit)}
                        className="space-y-6"
                      >
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <Input
                              {...shippingForm.register('firstName')}
                              placeholder="John"
                            />
                            {shippingForm.formState.errors.firstName && (
                              <p className="text-sm text-destructive">
                                {shippingForm.formState.errors.firstName.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <Input
                              {...shippingForm.register('lastName')}
                              placeholder="Doe"
                            />
                            {shippingForm.formState.errors.lastName && (
                              <p className="text-sm text-destructive">
                                {shippingForm.formState.errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                              {...shippingForm.register('email')}
                              type="email"
                              placeholder="john@example.com"
                            />
                            {shippingForm.formState.errors.email && (
                              <p className="text-sm text-destructive">
                                {shippingForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                              {...shippingForm.register('phone')}
                              placeholder="+1 (555) 000-0000"
                            />
                            {shippingForm.formState.errors.phone && (
                              <p className="text-sm text-destructive">
                                {shippingForm.formState.errors.phone.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Address</label>
                          <Input
                            {...shippingForm.register('address')}
                            placeholder="123 Main Street"
                          />
                          {shippingForm.formState.errors.address && (
                            <p className="text-sm text-destructive">
                              {shippingForm.formState.errors.address.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Apartment, suite, etc. (optional)
                          </label>
                          <Input
                            {...shippingForm.register('apartment')}
                            placeholder="Apt 4B"
                          />
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <Input
                              {...shippingForm.register('city')}
                              placeholder="San Francisco"
                            />
                            {shippingForm.formState.errors.city && (
                              <p className="text-sm text-destructive">
                                {shippingForm.formState.errors.city.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">State</label>
                            <Input
                              {...shippingForm.register('state')}
                              placeholder="CA"
                            />
                            {shippingForm.formState.errors.state && (
                              <p className="text-sm text-destructive">
                                {shippingForm.formState.errors.state.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">ZIP Code</label>
                            <Input
                              {...shippingForm.register('zipCode')}
                              placeholder="94102"
                            />
                            {shippingForm.formState.errors.zipCode && (
                              <p className="text-sm text-destructive">
                                {shippingForm.formState.errors.zipCode.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Country</label>
                          <Select
                            value={shippingForm.watch('country')}
                            onValueChange={(value) =>
                              shippingForm.setValue('country', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />

                        {/* Shipping Method */}
                        <div>
                          <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-primary" />
                            Shipping Method
                          </h3>
                          <div className="space-y-3">
                            {shippingOptions.map((option) => (
                              <div
                                key={option.id}
                                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                                  shippingOption === option.id
                                    ? 'border-primary bg-primary/5'
                                    : 'hover:border-primary/50'
                                }`}
                                onClick={() => setShippingOption(option.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 ${
                                      shippingOption === option.id
                                        ? 'border-primary bg-primary'
                                        : 'border-muted-foreground'
                                    }`}
                                  />
                                  <div>
                                    <p className="font-medium">{option.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {option.days}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-semibold">
                                  {subtotal >= 75 && option.id === 'standard'
                                    ? 'FREE'
                                    : formatPrice(option.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saveAddress"
                            {...shippingForm.register('saveAddress')}
                          />
                          <label
                            htmlFor="saveAddress"
                            className="text-sm text-muted-foreground cursor-pointer"
                          >
                            Save this address for future orders
                          </label>
                        </div>

                        <div className="flex justify-between pt-4">
                          <Button variant="ghost" asChild>
                            <Link to="/cart">
                              <ChevronLeft className="w-4 h-4 mr-2" />
                              Back to Cart
                            </Link>
                          </Button>
                          <Button type="submit" variant="gradient">
                            Continue to Payment
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Step */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={paymentForm.handleSubmit(onPaymentSubmit)}
                        className="space-y-6"
                      >
                        <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3 text-sm">
                          <Lock className="w-5 h-5 text-primary" />
                          <span>
                            Your payment information is encrypted and secure.
                          </span>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Card Number</label>
                          <Input
                            {...paymentForm.register('cardNumber')}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                          {paymentForm.formState.errors.cardNumber && (
                            <p className="text-sm text-destructive">
                              {paymentForm.formState.errors.cardNumber.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name on Card</label>
                          <Input
                            {...paymentForm.register('cardName')}
                            placeholder="John Doe"
                          />
                          {paymentForm.formState.errors.cardName && (
                            <p className="text-sm text-destructive">
                              {paymentForm.formState.errors.cardName.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Expiry Date</label>
                            <Input
                              {...paymentForm.register('expiryDate')}
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                            {paymentForm.formState.errors.expiryDate && (
                              <p className="text-sm text-destructive">
                                {paymentForm.formState.errors.expiryDate.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">CVV</label>
                            <Input
                              {...paymentForm.register('cvv')}
                              placeholder="123"
                              maxLength={4}
                              type="password"
                            />
                            {paymentForm.formState.errors.cvv && (
                              <p className="text-sm text-destructive">
                                {paymentForm.formState.errors.cvv.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saveCard"
                            {...paymentForm.register('saveCard')}
                          />
                          <label
                            htmlFor="saveCard"
                            className="text-sm text-muted-foreground cursor-pointer"
                          >
                            Save card for future purchases
                          </label>
                        </div>

                        <div className="flex justify-between pt-4">
                          <Button type="button" variant="ghost" onClick={goBack}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back
                          </Button>
                          <Button type="submit" variant="gradient">
                            Review Order
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Review Step */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          Review Your Order
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Shipping Address */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Shipping Address</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentStep(0)}
                            >
                              Edit
                            </Button>
                          </div>
                          {shippingData && (
                            <div className="p-4 rounded-lg bg-muted/50">
                              <p className="font-medium">
                                {shippingData.firstName} {shippingData.lastName}
                              </p>
                              <p className="text-muted-foreground">
                                {shippingData.address}
                                {shippingData.apartment &&
                                  `, ${shippingData.apartment}`}
                                <br />
                                {shippingData.city}, {shippingData.state}{' '}
                                {shippingData.zipCode}
                                <br />
                                {shippingData.country}
                              </p>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Shipping Method */}
                        <div>
                          <h3 className="font-semibold mb-2">Shipping Method</h3>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="font-medium">{selectedShipping.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedShipping.days}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        {/* Payment Method */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Payment Method</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentStep(1)}
                            >
                              Edit
                            </Button>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                            <CreditCard className="w-5 h-5" />
                            <span>•••• •••• •••• {paymentForm.watch('cardNumber').slice(-4)}</span>
                          </div>
                        </div>

                        <Separator />

                        {/* Order Items */}
                        <div>
                          <h3 className="font-semibold mb-4">Order Items</h3>
                          <div className="space-y-4">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                              >
                                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden">
                                  {item.product?.images?.[0] ? (
                                    <img
                                      src={item.product.images[0]}
                                      alt={item.product?.name || 'Product'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {item.product?.name ||
                                      item.uploaded_model?.file_name ||
                                      'Custom Print'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-semibold">
                                  {formatPrice(item.unit_price * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between pt-4">
                          <Button variant="ghost" onClick={goBack}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back
                          </Button>
                          <Button
                            variant="gradient"
                            size="lg"
                            onClick={handlePlaceOrder}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Lock className="w-5 h-5 mr-2" />
                                Place Order - {formatPrice(total)}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="truncate">
                              {item.product?.name ||
                                item.uploaded_model?.file_name ||
                                'Custom Print'}
                            </p>
                            <p className="text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-medium">
                            {formatPrice(item.unit_price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>
                          {shippingCost === 0 ? (
                            <span className="text-green-600 dark:text-green-400">
                              FREE
                            </span>
                          ) : (
                            formatPrice(shippingCost)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>

                    {/* Trust Badges */}
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 text-primary" />
                        <span>Secure SSL Encryption</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="w-4 h-4 text-primary" />
                        <span>Free Shipping Over $75</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="w-4 h-4 text-primary" />
                        <span>Quality Guaranteed</span>
                      </div>
                    </div>
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
