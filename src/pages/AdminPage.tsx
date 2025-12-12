import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  PackageOpen,
  FileX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatDate } from '@/lib/utils'
import { useAdminStats, useAdminOrders, useAdminProducts, useAdminMaterialStats } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ProductFormModal } from '@/components/admin/ProductFormModal'
import type { Order, Product } from '@/types'

// Mock data
const stats = [
  {
    title: 'Total Revenue',
    value: '₹48,23,489',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
  },
  {
    title: 'Total Orders',
    value: '1,234',
    change: '+8.2%',
    trend: 'up' as const,
    icon: ShoppingCart,
  },
  {
    title: 'Total Products',
    value: '156',
    change: '+4',
    trend: 'up' as const,
    icon: Package,
  },
  {
    title: 'Total Customers',
    value: '2,847',
    change: '+23.1%',
    trend: 'up' as const,
    icon: Users,
  },
]

// Note: recentOrders removed - now using real Supabase data

const mockProducts: Partial<Product>[] = [
  {
    id: '1',
    name: 'Geometric Desk Organizer',
    slug: 'geometric-desk-organizer',
    base_price: 29.99,
    in_stock: true,
    images: ['/placeholder.jpg'],
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Honeycomb Phone Stand',
    slug: 'honeycomb-phone-stand',
    base_price: 19.99,
    in_stock: true,
    images: ['/placeholder.jpg'],
    created_at: '2024-01-14T00:00:00Z',
  },
  {
    id: '3',
    name: 'Modular Cable Clips (Set of 10)',
    slug: 'modular-cable-clips',
    base_price: 12.99,
    in_stock: false,
    images: ['/placeholder.jpg'],
    created_at: '2024-01-13T00:00:00Z',
  },
  {
    id: '4',
    name: 'Articulated Dragon',
    slug: 'articulated-dragon',
    base_price: 49.99,
    in_stock: true,
    images: ['/placeholder.jpg'],
    created_at: '2024-01-12T00:00:00Z',
  },
  {
    id: '5',
    name: 'Minimalist Planter',
    slug: 'minimalist-planter',
    base_price: 24.99,
    in_stock: true,
    images: ['/placeholder.jpg'],
    created_at: '2024-01-11T00:00:00Z',
  },
]

const salesData = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 15200 },
  { month: 'Mar', revenue: 18900 },
  { month: 'Apr', revenue: 16400 },
  { month: 'May', revenue: 21200 },
  { month: 'Jun', revenue: 24800 },
]

// Fallback material stats
const defaultMaterialStats = [
  { name: 'PLA', orders: 450, percentage: 38 },
  { name: 'PETG', orders: 320, percentage: 27 },
  { name: 'Resin', orders: 210, percentage: 18 },
  { name: 'TPU', orders: 120, percentage: 10 },
  { name: 'Nylon', orders: 84, percentage: 7 },
]

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

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [productSearch, setProductSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const queryClient = useQueryClient()
  
  // Open modal for new product
  const handleAddProduct = () => {
    setEditingProduct(null)
    setProductModalOpen(true)
  }

  // Open modal for editing product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setProductModalOpen(true)
  }
  
  // Note: Admin access is controlled by RLS policies in Supabase
  // If user is not admin, queries will return empty arrays

  // Fetch data from Supabase with error handling
  const { 
    data: adminStats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useAdminStats()
  
  const { 
    data: supabaseOrders, 
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useAdminOrders({ 
    status: orderFilter === 'all' ? undefined : orderFilter, 
    search: orderSearch,
    limit: 10 
  })
  
  const { 
    data: supabaseProducts, 
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useAdminProducts({ 
    search: productSearch,
    limit: 10 
  })
  const { data: materialStats, isLoading: materialsLoading } = useAdminMaterialStats()

  // Show error toast on fetch errors
  useEffect(() => {
    if (statsError) {
      toast.error('Failed to load dashboard stats. Please try again.')
    }
    if (ordersError) {
      toast.error('Failed to load orders. Please try again.')
    }
    if (productsError) {
      toast.error('Failed to load products. Please try again.')
    }
  }, [statsError, ordersError, productsError])

  // Use Supabase data - don't fall back to mock data for real usage
  const orders = supabaseOrders || []
  const products = supabaseProducts || []
  const topMaterials = materialStats?.length ? materialStats : defaultMaterialStats

  // Refresh all data
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] })
    toast.success('Refreshing data...')
  }

  // Build stats from Supabase data (with proper zero values for empty data)
  const stats = [
    {
      title: 'Total Revenue',
      value: statsLoading ? null : formatPrice(adminStats?.totalRevenue || 0),
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: statsLoading ? null : (adminStats?.totalOrders || 0).toLocaleString('en-IN'),
      change: '+8.2%',
      trend: 'up' as const,
      icon: ShoppingCart,
    },
    {
      title: 'Total Products',
      value: statsLoading ? null : (adminStats?.totalProducts || 0).toLocaleString('en-IN'),
      change: '+4',
      trend: 'up' as const,
      icon: Package,
    },
    {
      title: 'Total Customers',
      value: statsLoading ? null : (adminStats?.totalCustomers || 0).toLocaleString('en-IN'),
      change: '+23.1%',
      trend: 'up' as const,
      icon: Users,
    },
  ]

  const maxRevenue = Math.max(...salesData.map((d) => d.revenue))

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Nova 3D Lab</title>
        <meta name="description" content="Manage your Nova 3D Lab store." />
      </Helmet>

      <div className="min-h-screen pt-20">
        {/* Header */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <LayoutDashboard className="w-8 h-8 text-primary" />
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening with your store.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="gradient" onClick={handleAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <stat.icon className="w-6 h-6 text-primary" />
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              stat.trend === 'up'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {stat.trend === 'up' ? (
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                            )}
                            {stat.change}
                          </Badge>
                        </div>
                        {stat.value === null ? (
                          <Skeleton className="h-8 w-24 mb-1" />
                        ) : (
                          <h3 className="text-2xl font-bold">{stat.value}</h3>
                        )}
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly revenue for the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between h-64 gap-2">
                      {salesData.map((data) => (
                        <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full bg-primary/80 rounded-t-md hover:bg-primary transition-colors"
                            style={{
                              height: `${(data.revenue / maxRevenue) * 100}%`,
                            }}
                          />
                          <span className="text-xs text-muted-foreground">{data.month}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Materials */}
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Materials</CardTitle>
                    <CardDescription>Orders by material type</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {materialsLoading ? (
                      <>
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                          </div>
                        ))}
                      </>
                    ) : topMaterials.length === 0 ? (
                      <div className="py-4 text-center text-muted-foreground">
                        <p>No material data available</p>
                      </div>
                    ) : (
                      topMaterials.map((material) => (
                        <div key={material.name} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{material.name}</span>
                            <span className="text-muted-foreground">
                              {material.orders} orders
                            </span>
                          </div>
                          <Progress value={material.percentage} className="h-2" />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest orders from your store</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setActiveTab('orders')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="py-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-8 text-center">
                      <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No orders yet</p>
                      <p className="text-sm text-muted-foreground">Orders will appear here once customers start purchasing</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Order</th>
                            <th className="text-left py-3 px-2 font-medium">Customer</th>
                            <th className="text-left py-3 px-2 font-medium">Status</th>
                            <th className="text-left py-3 px-2 font-medium">Date</th>
                            <th className="text-right py-3 px-2 font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order: any) => (
                            <tr key={order.id} className="border-b last:border-0">
                              <td className="py-3 px-2">
                                <span className="font-medium">{order.order_number}</span>
                              </td>
                              <td className="py-3 px-2">{order.customer || 'Unknown'}</td>
                              <td className="py-3 px-2">
                                <Badge className={`capitalize ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-2 text-muted-foreground">
                                {formatDate(order.created_at)}
                              </td>
                              <td className="py-3 px-2 text-right font-medium">
                                {formatPrice(order.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div>
                      <CardTitle>All Orders</CardTitle>
                      <CardDescription>Manage and track customer orders</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search orders..."
                          className="pl-9 w-64"
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                        />
                      </div>
                      <Select value={orderFilter} onValueChange={setOrderFilter}>
                        <SelectTrigger className="w-40">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {ordersLoading ? (
                      <div className="py-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="py-12 text-center">
                        <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          When customers place orders, they will appear here. You can track, manage, and update order statuses.
                        </p>
                      </div>
                    ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Order</th>
                          <th className="text-left py-3 px-2 font-medium">Customer</th>
                          <th className="text-left py-3 px-2 font-medium">Status</th>
                          <th className="text-left py-3 px-2 font-medium">Payment</th>
                          <th className="text-left py-3 px-2 font-medium">Date</th>
                          <th className="text-right py-3 px-2 font-medium">Total</th>
                          <th className="text-right py-3 px-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order: any) => (
                          <tr key={order.id} className="border-b last:border-0">
                            <td className="py-3 px-2">
                              <span className="font-medium">{order.order_number}</span>
                            </td>
                            <td className="py-3 px-2">{order.customer || 'Unknown'}</td>
                            <td className="py-3 px-2">
                              <Badge className={`capitalize ${getStatusColor(order.status)}`}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className="capitalize">
                                {order.payment_status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-muted-foreground">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="py-3 px-2 text-right font-medium">
                              {formatPrice(order.total)}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div>
                      <CardTitle>Products</CardTitle>
                      <CardDescription>Manage your product catalog</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          className="pl-9 w-64"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                        />
                      </div>
                      <Button variant="gradient" onClick={handleAddProduct}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {productsLoading ? (
                      <div className="py-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="py-12 text-center">
                        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No products yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                          Start building your catalog by adding your first product.
                        </p>
                        <Button variant="gradient" onClick={handleAddProduct}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Product
                        </Button>
                      </div>
                    ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Product</th>
                          <th className="text-left py-3 px-2 font-medium">Price</th>
                          <th className="text-left py-3 px-2 font-medium">Status</th>
                          <th className="text-left py-3 px-2 font-medium">Created</th>
                          <th className="text-right py-3 px-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: any) => (
                          <tr key={product.id} className="border-b last:border-0">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-muted" />
                                <span className="font-medium">{product.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              {formatPrice(product.base_price || 0)}
                            </td>
                            <td className="py-3 px-2">
                              <Badge
                                variant={product.in_stock !== false ? 'default' : 'destructive'}
                              >
                                {product.in_stock !== false ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-muted-foreground">
                              {formatDate(product.created_at || '')}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customers</CardTitle>
                  <CardDescription>View and manage customer accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Customer management coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Detailed analytics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Advanced analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        product={editingProduct}
      />
    </>
  )
}
