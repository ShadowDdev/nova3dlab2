import { motion } from 'framer-motion'
import { Shield, Truck, Award, HeadphonesIcon, RefreshCw, Leaf } from 'lucide-react'

const badges = [
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Every print inspected before shipping',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Free express shipping over $100',
  },
  {
    icon: Award,
    title: 'ISO Certified',
    description: 'ISO 9001:2015 certified facility',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Expert support anytime you need',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns',
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'Sustainable materials & practices',
  },
]

export function TrustBadges() {
  return (
    <section className="py-16 border-y bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                <badge.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
