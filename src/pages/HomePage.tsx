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
        <title>Nova 3D Lab - Premium 3D Printing Services</title>
        <meta
          name="description"
          content="Transform your ideas into reality with Nova 3D Lab. Premium 3D printing services for engineers, makers, and businesses in India. Upload your design and get an instant quote."
        />
        <meta property="og:title" content="Nova 3D Lab - Premium 3D Printing Services" />
        <meta
          property="og:description"
          content="Transform your ideas into reality with Nova 3D Lab. Premium 3D printing services for engineers, makers, and businesses in India."
        />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Nova 3D Lab",
            "description": "Premium 3D Printing Services in India",
            "url": "https://nova3dlab.com",
            "logo": "https://nova3dlab.com/logo.png",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Chandigarh",
              "addressRegion": "Chandigarh",
              "addressCountry": "India"
            },
            "email": "support@nova3dlab.com",
            "sameAs": [
              "https://twitter.com/nova3dlab",
              "https://facebook.com/nova3dlab",
              "https://instagram.com/nova3dlab"
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
