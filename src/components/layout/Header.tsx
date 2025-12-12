import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Upload,
  Package,
  Boxes,
  Sparkles,
  LogOut,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCartStore, useThemeStore, useAuthStore } from '@/stores'
import { cn, getInitials } from '@/lib/utils'
import { signOut } from '@/lib/supabase'

const materials = [
  { name: 'PLA', slug: 'pla', icon: '🌱' },
  { name: 'PETG', slug: 'petg', icon: '💧' },
  { name: 'Resin', slug: 'resin', icon: '💎' },
  { name: 'TPU', slug: 'tpu', icon: '🔵' },
  { name: 'Nylon', slug: 'nylon', icon: '⚡' },
  { name: 'Carbon Fiber', slug: 'carbon-fiber', icon: '🖤' },
  { name: 'Metal', slug: 'metal', icon: '🔩' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()
  
  const { items, openCart, getItemCount } = useCartStore()
  const { theme, toggleTheme } = useThemeStore()
  const { isAuthenticated, profile, logout } = useAuthStore()
  
  const itemCount = getItemCount()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const handleSignOut = async () => {
    await signOut()
    logout()
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b shadow-lg'
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forge-500 to-neon-cyan flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Boxes className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-forge-500 to-neon-cyan blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            </div>
            <span className="font-display font-bold text-xl hidden sm:block">
              <span className="text-gradient">Nova 3D</span>
              <span className="text-foreground"> Lab</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1">
                  Shop <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/shop" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    All Products
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {materials.map((material) => (
                  <DropdownMenuItem key={material.slug} asChild>
                    <Link
                      to={`/shop/${material.slug}`}
                      className="flex items-center gap-2"
                    >
                      <span>{material.icon}</span>
                      {material.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" asChild>
              <Link to="/upload" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload & Quote
              </Link>
            </Button>

            <Button variant="ghost" asChild>
              <Link to="/services">Services</Link>
            </Button>

            <Button variant="ghost" asChild>
              <Link to="/about">About</Link>
            </Button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <AnimatePresence>
              {isSearchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="hidden md:flex items-center"
                >
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="w-64"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                </motion.div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden md:flex"
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}
            </AnimatePresence>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild>
              <Link to="/wishlist">
                <Heart className="w-5 h-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback>
                        {getInitials(profile?.full_name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{profile?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/orders" className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="gradient" size="sm" asChild className="hidden sm:flex">
                <Link to="/login">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forge-500 to-neon-cyan flex items-center justify-center">
                      <Boxes className="w-5 h-5 text-white" />
                    </div>
                    PrintForge
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Link
                      to="/shop"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Package className="w-5 h-5" />
                      All Products
                    </Link>

                    <div className="pl-6 space-y-1">
                      {materials.map((material) => (
                        <Link
                          key={material.slug}
                          to={`/shop/${material.slug}`}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm"
                        >
                          <span>{material.icon}</span>
                          {material.name}
                        </Link>
                      ))}
                    </div>

                    <Link
                      to="/upload"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      Upload & Quote
                    </Link>

                    <Link
                      to="/services"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Sparkles className="w-5 h-5" />
                      Services
                    </Link>
                  </div>

                  <div className="pt-4 border-t">
                    {!isAuthenticated && (
                      <Button variant="gradient" className="w-full" asChild>
                        <Link to="/login">Sign In</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}
