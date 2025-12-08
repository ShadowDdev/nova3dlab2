import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Upload, 
  Zap, 
  Boxes, 
  Clock, 
  Shield, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const services = [
  {
    icon: Upload,
    title: 'Instant Quote',
    description: 'Upload your 3D file and get an instant price quote with real-time cost breakdown.',
    features: ['Automatic file analysis', 'Volume calculation', 'Multiple material options'],
    href: '/upload',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Rapid Prototyping',
    description: 'Turn your concepts into physical prototypes in as little as 24 hours.',
    features: ['Express delivery', 'Multiple iterations', 'Design feedback'],
    href: '/services#prototyping',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Boxes,
    title: 'Batch Production',
    description: 'Scale from prototype to production with consistent quality and competitive pricing.',
    features: ['Volume discounts', 'Quality assurance', 'Dedicated support'],
    href: '/services#batch',
    color: 'from-purple-500 to-pink-500',
  },
]

const stats = [
  { value: '10,000+', label: 'Orders Delivered' },
  { value: '24h', label: 'Fastest Turnaround' },
  { value: '99.9%', label: 'On-Time Delivery' },
  { value: '4.9/5', label: 'Customer Rating' },
]

export function ServicesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-gradient">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From single prototypes to large production runs, we offer comprehensive
            3D printing services tailored to your needs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <service.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="font-semibold text-xl mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-6">{service.description}</p>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button variant="outline" className="w-full group/btn" asChild>
                    <Link to={service.href}>
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl bg-gradient-to-br from-forge-900 to-forge-950 p-8 md:p-12 overflow-hidden"
        >
          {/* Background effects */}
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-forge-300 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
