import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Upload, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-forge-600 via-forge-700 to-forge-900" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl" />

          <div className="relative py-16 md:py-24 px-6 md:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              Ready to bring your ideas to life?
            </motion.div>

            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto">
              Start Your 3D Printing
              <br />
              Journey Today
            </h2>

            <p className="text-forge-200 text-lg max-w-2xl mx-auto mb-8">
              Upload your design, choose your material, and get an instant quote.
              We'll handle the rest and deliver premium quality prints to your door.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="xl"
                className="bg-white text-forge-900 hover:bg-white/90 shadow-xl"
                asChild
              >
                <Link to="/upload">
                  <Upload className="w-5 h-5 mr-2" />
                  Get Instant Quote
                </Link>
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link to="/shop">
                  Browse Products
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Trust text */}
            <p className="mt-8 text-forge-300 text-sm">
              Join 10,000+ engineers, makers, and businesses who trust PrintForge
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
