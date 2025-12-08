import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const materials = [
  {
    name: 'PLA',
    slug: 'pla',
    icon: '🌱',
    color: 'from-green-500 to-emerald-500',
    description: 'Eco-friendly & beginner-friendly',
    priceFrom: 0.05,
  },
  {
    name: 'PETG',
    slug: 'petg',
    icon: '💧',
    color: 'from-blue-500 to-cyan-500',
    description: 'Strong & water-resistant',
    priceFrom: 0.07,
  },
  {
    name: 'Resin',
    slug: 'resin',
    icon: '💎',
    color: 'from-purple-500 to-pink-500',
    description: 'Ultra-detailed & smooth',
    priceFrom: 0.12,
  },
  {
    name: 'TPU',
    slug: 'tpu',
    icon: '🔵',
    color: 'from-indigo-500 to-blue-500',
    description: 'Flexible & durable',
    priceFrom: 0.09,
  },
  {
    name: 'Nylon',
    slug: 'nylon',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    description: 'Tough & heat-resistant',
    priceFrom: 0.15,
  },
  {
    name: 'Carbon Fiber',
    slug: 'carbon-fiber',
    icon: '🖤',
    color: 'from-gray-700 to-gray-900',
    description: 'Lightweight & ultra-strong',
    priceFrom: 0.25,
  },
  {
    name: 'Metal',
    slug: 'metal',
    icon: '🔩',
    color: 'from-slate-500 to-zinc-500',
    description: 'Industrial-grade metal prints',
    priceFrom: 0.50,
  },
]

export function MaterialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Premium <span className="text-gradient">Materials</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our selection of high-quality materials, each optimized
            for specific applications and requirements.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {materials.map((material, index) => (
            <motion.div
              key={material.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/shop/${material.slug}`}
                className="group block h-full"
              >
                <div className="relative h-full p-6 rounded-2xl bg-card border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 overflow-hidden">
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${material.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                  />

                  <div className="relative">
                    <span className="text-4xl mb-4 block">{material.icon}</span>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {material.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {material.description}
                    </p>
                    <p className="text-sm">
                      From{' '}
                      <span className="font-semibold text-primary">
                        ${material.priceFrom}/cm³
                      </span>
                    </p>

                    <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
