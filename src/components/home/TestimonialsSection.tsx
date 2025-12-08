import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Product Designer',
    company: 'TechStartup Inc.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    content: "PrintForge has completely transformed our prototyping workflow. The quality is exceptional, and the turnaround time is incredible. We've cut our development cycle by 40%.",
    rating: 5,
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    role: 'Mechanical Engineer',
    company: 'AutoMotive Solutions',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    content: "The carbon fiber parts we ordered exceeded our expectations. Perfect for our high-stress applications. The team's expertise in material selection was invaluable.",
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Founder',
    company: 'ArtisanCrafts',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    content: 'As an artist, I need my pieces to be perfect. PrintForge delivers every time. The resin prints are incredibly detailed - my customers can\'t believe they\'re 3D printed!',
    rating: 5,
  },
  {
    id: 4,
    name: 'David Park',
    role: 'R&D Director',
    company: 'MedTech Industries',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    content: 'For medical device prototyping, precision is non-negotiable. PrintForge consistently delivers parts within ±0.1mm tolerance. Their quality control process is top-notch.',
    rating: 5,
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Operations Manager',
    company: 'BatchPro Manufacturing',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
    content: "We switched to PrintForge for our batch production needs. The consistency across 500+ parts was remarkable. Their pricing at scale makes it economically viable for production runs.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
  })

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setActiveIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-gradient">Customers</span> Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust PrintForge for their
            3D printing needs.
          </p>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <div className="h-full p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow">
                      <Quote className="w-10 h-10 text-primary/20 mb-4" />
                      
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>

                      <p className="text-muted-foreground mb-6 line-clamp-4">
                        "{testimonial.content}"
                      </p>

                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback>
                            {getInitials(testimonial.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role} at {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={scrollPrev}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={scrollNext}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
