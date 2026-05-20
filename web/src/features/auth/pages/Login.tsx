import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useLogin } from '../services/use-login';
import { loginSchema } from '../services/schemas';
import { useAuth } from '../store/auth.store';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate using Zod schema
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: typeof errors = {};
      validation.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof typeof errors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Call login mutation
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          setIsLoggedIn(true);
          navigate('/');
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || 'Email hoặc mật khẩu không chính xác';
          setErrors({ general: message });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/40 p-8 space-y-6 transition-all">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/20">
            E
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-3">Chào mừng trở lại</h2>
          <p className="text-sm text-slate-500">Đăng nhập vào cổng đối tác EcoPartner</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start gap-3 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
              Email doanh nghiệp
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="partner@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                  errors.email
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-600 pl-1">{errors.email}</p>}
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                  errors.password
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                }`}
              />
            </div>
            {errors.password && <p className="text-xs text-rose-600 pl-1">{errors.password}</p>}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs font-medium pl-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
              />
              Ghi nhớ đăng nhập
            </label>
            <a href="#forgot" className="text-emerald-600 hover:text-emerald-700">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Chưa có tài khoản đối tác?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
