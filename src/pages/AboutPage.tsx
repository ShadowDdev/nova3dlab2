import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
  Leaf,
  Zap,
  Shield,
  Users,
  Target,
  Heart,
  Award,
  Recycle,
  ChevronRight,
  Linkedin,
  Twitter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const values = [
  {
    icon: Target,
    title: 'Precision',
    description: 'We obsess over every micron to deliver prints that exceed expectations.',
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    description: 'Eco-friendly materials and processes to minimize our environmental footprint.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Constantly pushing the boundaries of what 3D printing can achieve.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Your success is our success. We go above and beyond for every project.',
  },
]

const milestones = [
  { year: '2018', title: 'Founded', description: 'Started in a garage with one printer and a dream.' },
  { year: '2019', title: '1,000 Orders', description: 'Reached our first major milestone.' },
  { year: '2020', title: 'Industrial Expansion', description: 'Added metal and carbon fiber capabilities.' },
  { year: '2021', title: '50+ Printers', description: 'Scaled our production facility.' },
  { year: '2022', title: 'Global Shipping', description: 'Now serving customers worldwide.' },
  { year: '2023', title: '100K+ Products', description: 'Celebrating our growth with our community.' },
]

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Former aerospace engineer with 15 years of additive manufacturing experience.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Marcus Johnson',
    role: 'CTO & Co-Founder',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'PhD in Materials Science, passionate about sustainable manufacturing.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Design',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    bio: 'Award-winning industrial designer with a focus on functional aesthetics.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'David Kim',
    role: 'Head of Production',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    bio: 'Manufacturing veteran ensuring every print meets our quality standards.',
    linkedin: '#',
    twitter: '#',
  },
]

const stats = [
  { value: '100K+', label: 'Products Delivered' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '99.8%', label: 'Quality Rate' },
  { value: '24hr', label: 'Avg Turnaround' },
]

const sustainabilityFeatures = [
  {
    icon: Recycle,
    title: 'Recycled Materials',
    description: 'We use recycled PLA and PETG whenever possible, giving plastic a second life.',
  },
  {
    icon: Leaf,
    title: 'Carbon Neutral Shipping',
    description: 'All our shipments are carbon-offset through verified environmental programs.',
  },
  {
    icon: Zap,
    title: 'Renewable Energy',
    description: 'Our facility runs on 100% renewable energy from solar and wind sources.',
  },
]

export function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us | Nova3D Lab</title>
        <meta
          name="description"
          content="Learn about Nova3D Lab's mission to democratize manufacturing through precision 3D printing. Meet our team and discover our commitment to quality and sustainability."
        />
      </Helmet>

      <div className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Empowering Makers with{' '}
                <span className="text-gradient">Precision 3D Printing</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We believe everyone should have access to professional-grade manufacturing.
                From prototypes to production, we bring your ideas to life.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/upload">Start Creating</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">Get in Touch</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Our Story
                </h2>
                <div className="prose prose-lg dark:prose-invert">
                  <p>
                    Nova3D Lab was born from a simple frustration: why is professional 3D printing
                    so inaccessible? Our founders, Sarah and Marcus, spent years in aerospace
                    and materials science, watching incredible technology remain locked behind
                    industrial gates.
                  </p>
                  <p>
                    In 2018, we set out to change that. Starting with a single printer in a
                    garage, we've grown into a state-of-the-art facility serving customers
                    worldwide. But our mission remains the same: democratize manufacturing
                    and empower creators everywhere.
                  </p>
                  <p>
                    Today, we're proud to offer the same precision and quality that Fortune 500
                    companies demand, to everyone from hobbyists to startups to established
                    businesses.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600"
                  alt="3D Printing Facility"
                  className="rounded-xl shadow-xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-lg shadow-lg">
                  <Award className="w-8 h-8 text-primary mb-2" />
                  <p className="font-semibold">ISO 9001 Certified</p>
                  <p className="text-sm text-muted-foreground">Quality Management</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Our Values
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do, from the materials we choose
                to how we serve our customers.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <value.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Our Journey
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From a single printer to a global operation, see how we've grown.
              </p>
            </motion.div>

            <div className="relative">
              <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-border hidden md:block" />
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-8 ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <Card className="inline-block">
                        <CardContent className="p-4">
                          <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                          <h3 className="font-semibold mt-1">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="hidden md:flex w-4 h-4 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Meet Our Team
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The passionate people behind Nova3D Lab who make the magic happen.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <Avatar className="w-24 h-24 mx-auto mb-4">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-primary text-sm mb-2">{member.role}</p>
                      <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={member.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sustainability Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-primary font-semibold mb-2 inline-flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Sustainability
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Printing a Greener Future
                </h2>
                <p className="text-muted-foreground mb-8">
                  We're committed to minimizing our environmental impact while delivering
                  exceptional quality. From material sourcing to shipping, sustainability
                  is woven into everything we do.
                </p>
                <div className="space-y-6">
                  {sustainabilityFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <img
                  src="https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600"
                  alt="Sustainable Manufacturing"
                  className="rounded-xl shadow-xl"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Bring Your Ideas to Life?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of creators who trust Nova3D Lab for their 3D printing needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/upload">
                    Get an Instant Quote
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
