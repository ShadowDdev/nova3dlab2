import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Chrome, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithMagicLink, signInWithGoogle, signInWithGithub } = useAuthStore()

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await signIn(data.email, data.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign in'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    const email = getValues('email')
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error('Please enter a valid email address first')
      return
    }

    setIsMagicLinkLoading(true)
    try {
      await signInWithMagicLink(email)
      toast.success('Check your email for a magic link!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send magic link'
      toast.error(message)
    } finally {
      setIsMagicLinkLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google'
      toast.error(message)
    }
  }

  const handleGithubLogin = async () => {
    try {
      await signInWithGithub()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with GitHub'
      toast.error(message)
    }
  }

  return (
    <>
      <Helmet>
        <title>Sign In | PrintForge</title>
        <meta name="description" content="Sign in to your PrintForge account to manage orders, view your wishlist, and more." />
      </Helmet>

      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleGoogleLogin}>
                  <Chrome className="w-5 h-5 mr-2" />
                  Google
                </Button>
                <Button variant="outline" onClick={handleGithubLogin}>
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </Button>
              </div>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                  or continue with email
                </span>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" {...register('rememberMe')} />
                    <label
                      htmlFor="remember"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                </div>

                <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleMagicLink}
                disabled={isMagicLinkLoading}
              >
                {isMagicLinkLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Send Magic Link
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  )
}
