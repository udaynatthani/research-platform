import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import useToast from '../../hooks/useToast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 chars'),
})

export default function LoginPage() {
  const { login } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (d) => {
    try {
      await login(d.email, d.password)
      navigate('/dashboard')
    } catch (e) {
      const msg = e.response?.data?.error || (e.response?.data?.errors && e.response.data.errors.join(', ')) || 'Login failed'
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
          <h1 className="font-display font-bold text-3xl text-slate-900">Synara</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your workspace</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full mt-2">
              Sign in
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            No account? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
