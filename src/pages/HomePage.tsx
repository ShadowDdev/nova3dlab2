import { Helmet } from 'react-helmet-async'
import {
  HeroSection,
  FeaturedProducts,
  MaterialsSection,
  ServicesSection,
  TestimonialsSection,
  TrustBadges,
  CTASection,
} from '@/components/home'

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>PrintForge - Premium 3D Printing Services</title>
        <meta
          name="description"
          content="Transform your ideas into reality with PrintForge. Premium 3D printing services for engineers, makers, and businesses. Upload your design and get an instant quote."
        />
        <meta property="og:title" content="PrintForge - Premium 3D Printing Services" />
        <meta
          property="og:description"
          content="Transform your ideas into reality with PrintForge. Premium 3D printing services for engineers, makers, and businesses."
        />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "PrintForge",
            "description": "Premium 3D Printing Services",
            "url": "https://printforge.com",
            "logo": "https://printforge.com/logo.png",
            "sameAs": [
              "https://twitter.com/printforge",
              "https://facebook.com/printforge",
              "https://instagram.com/printforge"
            ]
          })}
        </script>
      </Helmet>

      <HeroSection />
      <TrustBadges />
      <FeaturedProducts />
      <MaterialsSection />
      <ServicesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
