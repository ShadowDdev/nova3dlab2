import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  User,
  Package,
  MapPin,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  Heart,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/stores'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Order, Address } from '@/types'

// Mock data
const mockOrders: Order[] = [
  {
    id: '1',
    order_number: 'PF-2024-001234',
    user_id: '1',
    status: 'processing',
    payment_status: 'paid',
    subtotal: 89.99,
    shipping_cost: 0,
    tax: 9.0,
    discount: 0,
    total: 98.99,
    shipping_address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'US',
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    order_number: 'PF-2024-001235',
    user_id: '1',
    status: 'shipped',
    payment_status: 'paid',
    subtotal: 149.99,
    shipping_cost: 9.99,
    tax: 15.0,
    discount: 15.0,
    total: 159.98,
    shipping_address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'US',
    },
    tracking_number: '1Z999AA10123456784',
    tracking_url: 'https://www.ups.com/track',
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-12T09:15:00Z',
  },
  {
    id: '3',
    order_number: 'PF-2024-001230',
    user_id: '1',
    status: 'delivered',
    payment_status: 'paid',
    subtotal: 59.99,
    shipping_cost: 9.99,
    tax: 6.0,
    discount: 0,
    total: 75.98,
    shipping_address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'US',
    },
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-05T16:30:00Z',
  },
]

const mockAddresses: Address[] = [
  {
    id: '1',
    label: 'Home',
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94102',
    country: 'US',
    is_default: true,
  },
  {
    id: '2',
    label: 'Office',
    street: '456 Market St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94103',
    country: 'US',
    is_default: false,
  },
]

const mockUploadedFiles = [
  {
    id: '1',
    name: 'custom-bracket.stl',
    uploaded_at: '2024-01-15T10:30:00Z',
    size: 1245000,
    thumbnail: '/placeholder.jpg',
  },
  {
    id: '2',
    name: 'phone-holder.stl',
    uploaded_at: '2024-01-10T14:20:00Z',
    size: 2340000,
    thumbnail: '/placeholder.jpg',
  },
  {
    id: '3',
    name: 'gear-assembly.step',
    uploaded_at: '2024-01-05T08:00:00Z',
    size: 5670000,
    thumbnail: '/placeholder.jpg',
  },
]

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />
    case 'processing':
      return <AlertCircle className="w-4 h-4" />
    case 'shipped':
      return <Truck className="w-4 h-4" />
    case 'delivered':
      return <CheckCircle2 className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
    case 'processing':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    case 'shipped':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    case 'delivered':
      return 'bg-green-500/10 text-green-600 dark:text-green-400'
    case 'cancelled':
      return 'bg-red-500/10 text-red-600 dark:text-red-400'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function AccountPage() {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/')
  }

  // Mock user for demo
  const displayUser = user || {
    email: 'demo@example.com',
    user_metadata: { full_name: 'John Doe' },
  }
  const displayProfile = profile || {
    full_name: 'John Doe',
    avatar_url: null,
  }

  const quickStats = [
    { label: 'Total Orders', value: mockOrders.length },
    { label: 'In Progress', value: mockOrders.filter((o) => o.status === 'processing').length },
    { label: 'Saved Files', value: mockUploadedFiles.length },
    { label: 'Addresses', value: mockAddresses.length },
  ]

  return (
    <>
      <Helmet>
        <title>My Account | Nova 3D Lab</title>
        <meta
          name="description"
          content="Manage your Nova 3D Lab account, view orders, and update your settings."
        />
      </Helmet>

      <div className="min-h-screen pt-20">
        {/* Header */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={displayProfile.avatar_url || undefined} />
                  <AvatarFallback className="text-xl">
                    {displayProfile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">
                    {displayProfile.full_name || 'User'}
                  </h1>
                  <p className="text-muted-foreground">{displayUser.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="files">My Files</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-3xl font-bold text-primary">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-auto py-4" asChild>
                      <Link to="/upload">
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto mb-2" />
                          <span>Upload Design</span>
                        </div>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4" asChild>
                      <Link to="/shop">
                        <div className="text-center">
                          <Package className="w-6 h-6 mx-auto mb-2" />
                          <span>Browse Products</span>
                        </div>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4" asChild>
                      <Link to="/wishlist">
                        <div className="text-center">
                          <Heart className="w-6 h-6 mx-auto mb-2" />
                          <span>View Wishlist</span>
                        </div>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4"
                      onClick={() => setActiveTab('settings')}
                    >
                      <div className="text-center">
                        <Settings className="w-6 h-6 mx-auto mb-2" />
                        <span>Account Settings</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOrders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(order.total)}</p>
                          <Badge variant="secondary" className="capitalize">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              {mockOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{order.order_number}</h3>
                            <p className="text-sm text-muted-foreground">
                              Placed on {formatDate(order.created_at)}
                            </p>
                            {order.tracking_number && (
                              <div className="mt-2">
                                <a
                                  href={order.tracking_url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  Track Package: {order.tracking_number}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end gap-2">
                          <p className="text-xl font-bold">{formatPrice(order.total)}</p>
                          <Badge className={`capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Invoice
                        </Button>
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-4">
              <div className="flex justify-end">
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {mockAddresses.map((address, index) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span className="font-semibold">{address.label}</span>
                            {address.is_default && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-muted-foreground">
                          {address.street}
                          <br />
                          {address.city}, {address.state} {address.postal_code}
                          <br />
                          {address.country}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-4">
              <div className="flex justify-end">
                <Button variant="gradient" asChild>
                  <Link to="/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New File
                  </Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockUploadedFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <FileText className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold truncate">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(file.uploaded_at)} •{' '}
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link to={`/upload?file=${file.id}`}>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Order
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile picture.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={displayProfile.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl">
                        {displayProfile.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        Change Photo
                      </Button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input defaultValue={displayProfile.full_name || ''} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input defaultValue={displayUser.email} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company</label>
                      <Input placeholder="Your company name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      placeholder="Tell us a little about yourself..."
                      rows={3}
                    />
                  </div>
                  <Button variant="gradient">Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your experience and notification settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Material</label>
                      <Select defaultValue="pla">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pla">PLA</SelectItem>
                          <SelectItem value="petg">PETG</SelectItem>
                          <SelectItem value="resin">Resin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Measurement Units</label>
                      <Select defaultValue="metric">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (mm, cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (inches)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="gradient">Save Preferences</Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive">Delete Account</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

// Missing import fix
const ShoppingCart = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
)
