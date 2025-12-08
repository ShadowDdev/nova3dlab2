import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, MeshDistortMaterial, Environment, Sparkles } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Upload, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as THREE from 'three'

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={2}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#0ea5e9"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

function FloatingParticles() {
  return (
    <Sparkles
      count={100}
      scale={10}
      size={2}
      speed={0.4}
      color="#00f5ff"
    />
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#bf00ff" intensity={0.5} />
      <AnimatedSphere />
      <FloatingParticles />
      <Environment preset="city" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-forge-950/20 dark:to-forge-900/10" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* 3D Canvas */}
      <div className="absolute inset-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Premium 3D Printing Services
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Transform Your{' '}
            <span className="text-gradient">Ideas</span>
            <br />
            Into Reality
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8"
          >
            From rapid prototypes to production-grade parts, we deliver
            precision 3D printing with the finest materials. Upload your design
            and get an instant quote.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Button variant="gradient" size="xl" asChild>
              <Link to="/upload">
                <Upload className="w-5 h-5 mr-2" />
                Get Instant Quote
              </Link>
            </Button>

            <Button variant="outline" size="xl" asChild>
              <Link to="/shop">
                Browse Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            <Button variant="ghost" size="xl" asChild>
              <Link to="/services">
                Our Services
              </Link>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Fast Turnaround</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">10k+</span>
              <span>Orders Delivered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">4.9</span>
              <span>★ Rating</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </section>
  )
}
