import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import useToast from '../../hooks/useToast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const schema = z.object({
  email:    z.string().email('Invalid email'),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric + underscore only'),
  password: z.string().min(6).max(128),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

export default function RegisterPage() {
  const { register: regUser } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (d) => {
    try {
      await regUser(d.email, d.username, d.password)
      pushToast({ message: 'Account created! Please sign in.', type: 'success' })
      navigate('/login')
    } catch (e) {
      const msg = e.response?.data?.error || (e.response?.data?.errors && e.response.data.errors.join(', ')) || 'Registration failed'
      pushToast({ message: msg, type: 'error' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <span className="text-white font-display font-bold text-2xl">R</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Create account</h1>
          <p className="text-slate-500 text-sm mt-1">Start your research journey</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@uni.edu" error={errors.email?.message} {...register('email')} />
            <Input label="Username" placeholder="jane_researcher" error={errors.username?.message} {...register('username')} />
            <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            <Input label="Confirm password" type="password" placeholder="••••••••" error={errors.confirm?.message} {...register('confirm')} />
            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full mt-2">
              Create account
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
