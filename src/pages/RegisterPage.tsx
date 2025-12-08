import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Chrome,
  Github,
  User,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores'
import { toast } from 'sonner'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

const passwordRequirements = [
  { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw: string) => /[0-9]/.test(pw) },
]

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, signInWithGithub } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const password = watch('password', '')

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await signUp(data.email, data.password, data.fullName)
      toast.success('Account created! Please check your email to verify your account.')
      navigate('/login')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create account'
      toast.error(message)
    } finally {
      setIsLoading(false)
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
        <title>Create Account | PrintForge</title>
        <meta
          name="description"
          content="Join PrintForge to order custom 3D prints, track orders, and access exclusive features."
        />
      </Helmet>

      <div className="min-h-screen pt-20 py-12 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Create Account</CardTitle>
              <CardDescription>
                Join PrintForge to start ordering custom 3D prints
              </CardDescription>
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
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10"
                      {...register('fullName')}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

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
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
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
                  {/* Password Requirements */}
                  <div className="space-y-1 pt-2">
                    {passwordRequirements.map((req) => {
                      const met = req.test(password)
                      return (
                        <div
                          key={req.label}
                          className={`flex items-center gap-2 text-sm transition-colors ${
                            met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                          }`}
                        >
                          <Check
                            className={`w-4 h-4 ${met ? 'opacity-100' : 'opacity-30'}`}
                          />
                          {req.label}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" {...register('acceptTerms')} className="mt-1" />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                  >
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
                )}

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  )
}
