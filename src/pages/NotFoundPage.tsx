import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Search, ShoppingBag, Upload, ArrowLeft, Box } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'

export function NotFoundPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const quickLinks = [
    { icon: Home, label: 'Go Home', href: '/', description: 'Return to the homepage' },
    { icon: ShoppingBag, label: 'Browse Shop', href: '/shop', description: 'Explore our products' },
    { icon: Upload, label: 'Upload Design', href: '/upload', description: 'Get an instant quote' },
  ]

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Nova3D Lab</title>
        <meta name="description" content="The page you're looking for doesn't exist. Let's help you find what you need." />
      </Helmet>

      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* 3D-themed error illustration */}
            <div className="relative mb-8 inline-block">
              <motion.div
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="relative"
              >
                <Box className="w-32 h-32 md:w-40 md:h-40 text-muted-foreground/20" strokeWidth={1} />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-6xl md:text-8xl font-bold text-primary">404</span>
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl md:text-4xl font-bold mb-4"
            >
              Model Not Found
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-lg mb-8 max-w-md mx-auto"
            >
              Looks like this print job got lost in transit. The page you're looking for
              doesn't exist or has been moved.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSearch}
              className="max-w-md mx-auto mb-12"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-24"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2"
                >
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid sm:grid-cols-3 gap-4 mb-8"
            >
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6 text-center">
                      <Link to={link.href} className="block group">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                          <link.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {link.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">{link.description}</p>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
