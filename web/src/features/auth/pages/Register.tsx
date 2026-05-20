import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, User, Mail, Phone, Lock, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSendOtp } from '../services/use-send-otp';
import { useVerifyOtp } from '../services/use-verify-otp';
import { useRegisterPartner } from '../services/use-register-partner';
import { registerSchema } from '../services/schemas';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // State for flow
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: OTP, 3: Success

  // Form values state
  const [organizationName, setOrganizationName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP state
  const [otp, setOtp] = useState('');

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API mutations
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const registerMutation = useRegisterPartner();

  // Handle Step 1 Submit: Validate and Send OTP
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const validation = registerSchema.safeParse({
      organizationName,
      contactPerson,
      email,
      contactPhone,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Call send OTP API
    sendOtpMutation.mutate(email, {
      onSuccess: () => {
        setStep(2);
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại.';
        setErrors({ general: msg });
      },
    });
  };

  // Handle Step 2 Submit: Verify OTP and Register
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otp || otp.length < 6) {
      setErrors({ otp: 'Vui lòng nhập mã OTP gồm 6 chữ số' });
      return;
    }

    // Verify OTP first
    verifyOtpMutation.mutate(
      { email, otp },
      {
        onSuccess: () => {
          // If OTP is correct, perform registration
          registerMutation.mutate(
            {
              email,
              password,
              organizationName,
              contactPerson,
              contactPhone,
            },
            {
              onSuccess: () => {
                setStep(3);
              },
              onError: (regErr: any) => {
                const msg = regErr?.response?.data?.message || 'Không thể đăng ký tài khoản đối tác. Vui lòng kiểm tra lại thông tin.';
                setErrors({ general: msg });
              },
            }
          );
        },
        onError: (otpErr: any) => {
          const msg = otpErr?.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn';
          setErrors({ otp: msg });
        },
      }
    );
  };

  // Resend OTP
  const handleResendOtp = () => {
    setErrors({});
    sendOtpMutation.mutate(email, {
      onSuccess: () => {
        alert('Mã OTP mới đã được gửi thành công đến email của bạn!');
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.';
        setErrors({ general: msg });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/50 p-4 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/40 p-8 space-y-6 transition-all">
        
        {/* Step Indicator (for Step 1 & 2) */}
        {step !== 3 && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 1 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'bg-emerald-100 text-emerald-700'
            }`}>
              1
            </span>
            <span className="w-12 h-0.5 bg-slate-200"></span>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 2 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </span>
          </div>
        )}

        {/* ─── STEP 1: FILL FORM ────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/20">
                E
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-3">Đăng ký Đối tác mới</h2>
              <p className="text-sm text-slate-500">Trở thành điểm thu gom và đổi quà trong hệ sinh thái EcoHabit</p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              {errors.general && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errors.general}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organization Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Tên tổ chức / Doanh nghiệp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Store className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Công ty TNHH Môi trường Xanh"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                        errors.organizationName ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                      }`}
                    />
                  </div>
                  {errors.organizationName && <p className="text-xs text-rose-600 pl-1">{errors.organizationName}</p>}
                </div>

                {/* Contact Person */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Người đại diện liên hệ</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                        errors.contactPerson ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                      }`}
                    />
                  </div>
                  {errors.contactPerson && <p className="text-xs text-rose-600 pl-1">{errors.contactPerson}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Email doanh nghiệp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="business@ecohabit.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                        errors.email ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-600 pl-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Số điện thoại</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="0987654321"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                        errors.contactPhone ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                      }`}
                    />
                  </div>
                  {errors.contactPhone && <p className="text-xs text-rose-600 pl-1">{errors.contactPhone}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                        errors.password ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                      }`}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-rose-600 pl-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                        errors.confirmPassword ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-rose-600 pl-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Submit to OTP step */}
              <button
                type="submit"
                disabled={sendOtpMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
              >
                {sendOtpMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi mã OTP...
                  </>
                ) : (
                  <>
                    Gửi mã xác thực OTP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">
                Đã có tài khoản đối tác?{' '}
                <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </>
        )}

        {/* ─── STEP 2: VERIFY OTP ──────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/20">
                E
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-3">Xác thực Email</h2>
              <p className="text-sm text-slate-500">Mã xác thực đã được gửi tới email <span className="font-semibold text-slate-800">{email}</span></p>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-4">
              {errors.general && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errors.general}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-center">
                  Nhập mã OTP 6 chữ số
                </label>
                <div className="max-w-[240px] mx-auto relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={verifyOtpMutation.isPending || registerMutation.isPending}
                    className={`w-full py-3 text-center tracking-[0.5em] text-xl font-bold rounded-xl border bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all ${
                      errors.otp ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                    }`}
                  />
                </div>
                {errors.otp && <p className="text-xs text-rose-600 text-center">{errors.otp}</p>}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={verifyOtpMutation.isPending || registerMutation.isPending}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={verifyOtpMutation.isPending || registerMutation.isPending}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer active:scale-[0.98] transition-all"
                >
                  {verifyOtpMutation.isPending || registerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Xác nhận & Đăng ký
                    </>
                  )}
                </button>
              </div>

              {/* Resend button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendOtpMutation.isPending || verifyOtpMutation.isPending || registerMutation.isPending}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 cursor-pointer"
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </form>
          </>
        )}

        {/* ─── STEP 3: SUCCESS SCREEN ─────────────────────────────────────── */}
        {step === 3 && (
          <div className="text-center py-6 space-y-6">
            <div className="inline-flex w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full items-center justify-center">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng ký thành công!</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Hồ sơ đối tác của <span className="font-semibold text-slate-800">{organizationName}</span> đã được lưu nhận thành công.
                <br />
                Đơn đăng ký của bạn đang được Ban quản trị EcoHabit xem xét phê duyệt. Chúng tôi sẽ gửi thông báo đến email của bạn trong thời gian sớm nhất.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl font-medium text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              Quay lại Đăng nhập
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
