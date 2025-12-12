import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Book,
  ShoppingCart,
  Truck,
  CreditCard,
  Package,
  Settings,
  HelpCircle,
  ChevronRight,
  Mail,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of 3D printing',
      articles: 5,
    },
    {
      icon: ShoppingCart,
      title: 'Orders & Products',
      description: 'Information about ordering',
      articles: 8,
    },
    {
      icon: Truck,
      title: 'Shipping & Delivery',
      description: 'Delivery times and tracking',
      articles: 6,
    },
    {
      icon: CreditCard,
      title: 'Payments & Pricing',
      description: 'Payment methods and billing',
      articles: 4,
    },
    {
      icon: Package,
      title: 'Materials & Quality',
      description: 'Material specs and standards',
      articles: 7,
    },
    {
      icon: Settings,
      title: 'Account & Settings',
      description: 'Manage your account',
      articles: 5,
    },
  ]

  const popularArticles = [
    {
      title: 'How to prepare your 3D model for printing',
      category: 'Getting Started',
    },
    {
      title: 'Understanding material options and their uses',
      category: 'Materials & Quality',
    },
    {
      title: 'How to track your order',
      category: 'Shipping & Delivery',
    },
    {
      title: 'Canceling or modifying an order',
      category: 'Orders & Products',
    },
    {
      title: 'Accepted file formats and requirements',
      category: 'Getting Started',
    },
  ]

  const faqs = [
    {
      question: 'What file formats do you accept?',
      answer:
        'We accept STL, OBJ, STEP, and IGES file formats. STL is the most common and recommended format for 3D printing. For best results, ensure your model is watertight (no holes in the mesh) and has a minimum resolution of 0.1mm.',
    },
    {
      question: 'How long does shipping take?',
      answer:
        'Standard shipping takes 5-7 business days within the continental US. Express shipping (2-3 days) and overnight options are available at checkout. International shipping typically takes 7-14 business days depending on the destination.',
    },
    {
      question: 'What is your return policy?',
      answer:
        'We offer a 30-day satisfaction guarantee on all orders. If your print has defects or doesn\'t match the specifications, we\'ll reprint it for free or provide a full refund. Custom designs are evaluated on a case-by-case basis.',
    },
    {
      question: 'How do I get a quote for a custom print?',
      answer:
        'Simply upload your 3D model file on our Upload page. Our instant quoting system will analyze your model and provide pricing based on size, material, and quantity. For complex projects, you can request a manual quote from our team.',
    },
    {
      question: 'What materials are available?',
      answer:
        'We offer a wide range of materials including PLA (standard and premium), ABS, PETG, Nylon, Resin, TPU (flexible), and various specialty materials. Each material has different properties suited for different applications.',
    },
    {
      question: 'Can you help with 3D modeling?',
      answer:
        'Yes! Our design team can help bring your ideas to life. We offer design services starting at $50/hour. Most simple designs are completed within 1-2 hours. Contact us with your project details for a quote.',
    },
    {
      question: 'What is the minimum order quantity?',
      answer:
        'There is no minimum order quantity. You can order a single item or thousands of units. We offer volume discounts: 10% off for 10+ items, 15% off for 25+ items, and 20% off for 50+ identical items.',
    },
    {
      question: 'How do I cancel or modify my order?',
      answer:
        'Orders can be modified or canceled within 2 hours of placement. After that, we may have already started production. Contact our support team immediately if you need to make changes. Rush orders cannot be canceled once production begins.',
    },
  ]

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs

  return (
    <>
      <Helmet>
        <title>Help Center | Nova 3D Lab</title>
        <meta
          name="description"
          content="Find answers to your questions about 3D printing, orders, shipping, materials, and more at Nova 3D Lab Help Center."
        />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16">
        {/* Hero with Search */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent py-16 mb-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                How can we help?
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Search our knowledge base or browse categories below
              </p>

              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Categories */}
          {!searchQuery && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="font-display text-2xl font-bold mb-6">
                Browse by Category
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <category.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                              {category.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {category.description}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {category.articles} articles
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Popular Articles */}
          {!searchQuery && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="font-display text-2xl font-bold mb-6">
                Popular Articles
              </h2>
              <Card>
                <CardContent className="divide-y">
                  {popularArticles.map((article, index) => (
                    <div
                      key={index}
                      className="py-4 first:pt-6 last:pb-6 flex items-center justify-between gap-4 hover:bg-muted/50 -mx-6 px-6 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <h3 className="font-medium hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.section>
          )}

          {/* FAQs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: searchQuery ? 0.1 : 0.5 }}
            className="mb-16"
          >
            <h2 className="font-display text-2xl font-bold mb-6">
              {searchQuery
                ? `Search Results (${filteredFaqs.length})`
                : 'Frequently Asked Questions'}
            </h2>

            {filteredFaqs.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any articles matching "{searchQuery}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.section>

          {/* Contact Support */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl">
                  Still need help?
                </CardTitle>
                <CardDescription>
                  Our support team is here to assist you with any questions
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-8">
                <Button asChild>
                  <Link to="/contact">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
                <Button variant="outline">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Submit a Ticket
                </Button>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </>
  )
}
