import React, { useState } from 'react';
import {
  User, Lock, Bell, SlidersHorizontal, Palette, TriangleAlert,
  Eye, EyeOff, LogOut, ChevronRight, Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, clearToken } from '../../auth/store/auth.store';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all';

const selectCls =
  'w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer';

// ─── Sub-components ──────────────────────────────────────────────────────────

interface SettingSectionProps {
  id: string;
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({
  id, icon: Icon, title, description, children,
}) => (
  <section id={id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="divide-y divide-slate-100">{children}</div>
  </section>
);

interface FieldRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, hint, children }) => (
  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
    <div className="sm:w-56 flex-shrink-0">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

interface ToggleRowProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  badge?: string;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, hint, checked, onChange, badge }) => (
  <div className="px-6 py-4 flex items-center justify-between gap-4">
    <div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {badge && (
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
            {badge}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-10 h-5.5 flex-shrink-0 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-400 ${
        checked ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 mt-0.5 ml-0.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          checked ? 'translate-x-4.5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

interface SubGroupProps {
  title: string;
  children: React.ReactNode;
}

const SubGroup: React.FC<SubGroupProps> = ({ title, children }) => (
  <div>
    <div className="px-6 py-3 bg-slate-50">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
    </div>
    {children}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
      type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-rose-50 border-rose-200 text-rose-800'
    }`}
  >
    {type === 'success' ? <Check className="w-4 h-4 text-emerald-500" /> : <TriangleAlert className="w-4 h-4 text-rose-500" />}
    {message}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  // ── Read stored user/profile data ────────────────────────────────────────
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as { email?: string; fullName?: string }) : null;
    } catch {
      return null;
    }
  })();

  const storedProfile = (() => {
    try {
      const raw = localStorage.getItem('partnerProfile');
      return raw
        ? (JSON.parse(raw) as { roleTypes?: string[] })
        : null;
    } catch {
      return null;
    }
  })();

  const roleTypes: string[] = storedProfile?.roleTypes ?? ['COLLECTOR', 'REWARD_PROVIDER'];
  const isCollector = roleTypes.includes('COLLECTOR');
  const isRewardProvider = roleTypes.includes('REWARD_PROVIDER');

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Section: Tài khoản ───────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(storedUser?.fullName ?? '');
  const [loginEmail] = useState(storedUser?.email ?? '');

  const handleUpdateAccount = () => {
    showToast('Đã cập nhật thông tin tài khoản');
  };

  const handleLogoutAll = () => {
    if (window.confirm('Đăng xuất khỏi tất cả thiết bị?')) {
      clearToken();
      setIsLoggedIn(false);
      navigate('/login');
    }
  };

  // ── Section: Bảo mật ─────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [alertStrangeLogin, setAlertStrangeLogin] = useState(true);
  const [pwError, setPwError] = useState('');

  const handleChangePassword = () => {
    setPwError('');
    if (!currentPw) { setPwError('Vui lòng nhập mật khẩu hiện tại'); return; }
    if (newPw.length < 8) { setPwError('Mật khẩu mới phải có ít nhất 8 ký tự'); return; }
    if (newPw !== confirmPw) { setPwError('Mật khẩu xác nhận không khớp'); return; }
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    showToast('Đã đổi mật khẩu thành công');
  };

  // ── Section: Thông báo ────────────────────────────────────────────────────
  const [notif, setNotif] = useState({
    newCheckin: true,
    voucherRedeemed: true,
    voucherExpiring: false,
    profileStatusChange: true,
    channelSystem: true,
    channelEmail: false,
  });
  const setNotifKey = (key: keyof typeof notif) => (v: boolean) =>
    setNotif((prev) => ({ ...prev, [key]: v }));

  // ── Section: Vận hành ─────────────────────────────────────────────────────
  const [ops, setOps] = useState({
    autoConfirmCheckin: false,
    alertLocationInactive: true,
    autoActivateVoucher: false,
    alertVoucherLow: true,
  });
  const setOpsKey = (key: keyof typeof ops) => (v: boolean) =>
    setOps((prev) => ({ ...prev, [key]: v }));
  const [weightLimit, setWeightLimit] = useState('50');
  const [voucherDefaultDays, setVoucherDefaultDays] = useState('30');

  // ── Section: Giao diện ────────────────────────────────────────────────────
  const [language, setLanguage] = useState('vi');
  const [theme, setTheme] = useState('system');
  const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');

  // ── Section: Vùng nguy hiểm ───────────────────────────────────────────────
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDisableAccount = () => {
    if (!confirmDisable) { setConfirmDisable(true); return; }
    showToast('Yêu cầu vô hiệu hoá đã được ghi nhận. Đội ngũ hỗ trợ sẽ liên hệ bạn.', 'error');
    setConfirmDisable(false);
  };
  const handleDeleteAccount = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    showToast('Yêu cầu xoá tài khoản đã được ghi nhận. Vui lòng chờ email xác nhận.', 'error');
    setConfirmDelete(false);
  };

  return (
    <div className="space-y-6 max-w-3xl font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cài đặt</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý tài khoản, bảo mật và tuỳ chọn vận hành</p>
      </div>

      {/* ── 1. Tài khoản đăng nhập ──────────────────────────────────────── */}
      <SettingSection
        id="account"
        icon={User}
        title="Tài khoản đăng nhập"
        description="Thông tin xác thực dùng để đăng nhập vào hệ thống"
      >
        <FieldRow label="Email đăng nhập" hint="Không thể thay đổi sau khi đăng ký">
          <input
            type="email"
            value={loginEmail}
            readOnly
            className={`${inputCls} bg-slate-50 text-slate-500 cursor-not-allowed`}
          />
        </FieldRow>

        <FieldRow label="Họ và tên" hint="Tên hiển thị trong hệ thống">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nhập họ tên..."
            className={inputCls}
          />
        </FieldRow>

        <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
          <p className="text-xs text-slate-400">
            Cập nhật thông tin sẽ ảnh hưởng đến tên hiển thị trong toàn bộ hệ thống.
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleLogoutAll}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất tất cả thiết bị
            </button>
            <button
              type="button"
              onClick={handleUpdateAccount}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              Cập nhật tài khoản
            </button>
          </div>
        </div>
      </SettingSection>

      {/* ── 2. Bảo mật ──────────────────────────────────────────────────── */}
      <SettingSection
        id="security"
        icon={Lock}
        title="Bảo mật"
        description="Đổi mật khẩu và cài đặt bảo mật tài khoản"
      >
        <FieldRow label="Mật khẩu hiện tại">
          <div className="relative">
            <input
              type={showCurrentPw ? 'text' : 'password'}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại..."
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FieldRow>

        <FieldRow label="Mật khẩu mới" hint="Tối thiểu 8 ký tự">
          <div className="relative">
            <input
              type={showNewPw ? 'text' : 'password'}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Mật khẩu mới..."
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FieldRow>

        <FieldRow label="Xác nhận mật khẩu mới">
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Nhập lại mật khẩu mới..."
            className={inputCls}
          />
        </FieldRow>

        {pwError && (
          <div className="px-6 pb-2">
            <p className="text-xs text-rose-600 font-medium">{pwError}</p>
          </div>
        )}

        <div className="px-6 py-4 flex justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={handleChangePassword}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Lock className="w-3.5 h-3.5" />
            Đổi mật khẩu
          </button>
        </div>

        <ToggleRow
          label="Cảnh báo đăng nhập lạ"
          hint="Nhận thông báo khi có thiết bị mới đăng nhập"
          checked={alertStrangeLogin}
          onChange={setAlertStrangeLogin}
          badge="Sắp có"
        />
      </SettingSection>

      {/* ── 3. Thông báo ────────────────────────────────────────────────── */}
      <SettingSection
        id="notifications"
        icon={Bell}
        title="Thông báo"
        description="Tuỳ chỉnh loại thông báo và kênh nhận thông báo"
      >
        <SubGroup title="Loại thông báo">
          <ToggleRow
            label="Lượt check-in mới"
            hint="Khi có người dùng gửi rác tại điểm thu gom"
            checked={notif.newCheckin}
            onChange={setNotifKey('newCheckin')}
          />
          <ToggleRow
            label="Voucher được đổi"
            hint="Khi người dùng đổi điểm lấy voucher của bạn"
            checked={notif.voucherRedeemed}
            onChange={setNotifKey('voucherRedeemed')}
          />
          <ToggleRow
            label="Voucher sắp hết hạn"
            hint="Nhắc nhở khi voucher còn dưới 3 ngày hết hạn"
            checked={notif.voucherExpiring}
            onChange={setNotifKey('voucherExpiring')}
          />
          <ToggleRow
            label="Hồ sơ được duyệt / từ chối"
            hint="Cập nhật trạng thái phê duyệt tài khoản đối tác"
            checked={notif.profileStatusChange}
            onChange={setNotifKey('profileStatusChange')}
          />
        </SubGroup>

        <SubGroup title="Kênh nhận thông báo">
          <ToggleRow
            label="Trong hệ thống"
            hint="Hiển thị thông báo khi đang sử dụng EcoPartner"
            checked={notif.channelSystem}
            onChange={setNotifKey('channelSystem')}
          />
          <ToggleRow
            label="Qua Email"
            hint="Gửi email tóm tắt hoạt động định kỳ"
            checked={notif.channelEmail}
            onChange={setNotifKey('channelEmail')}
          />
        </SubGroup>
      </SettingSection>

      {/* ── 4. Tuỳ chọn vận hành ────────────────────────────────────────── */}
      <SettingSection
        id="operations"
        icon={SlidersHorizontal}
        title="Tuỳ chọn vận hành"
        description="Cài đặt riêng theo vai trò đối tác"
      >
        {/* COLLECTOR */}
        {isCollector && (
          <SubGroup title="Đối tác thu gom (COLLECTOR)">
            <ToggleRow
              label="Tự động xác nhận check-in"
              hint="Tự động duyệt khi người dùng quét QR tại điểm hợp lệ"
              checked={ops.autoConfirmCheckin}
              onChange={setOpsKey('autoConfirmCheckin')}
            />
            <FieldRow label="Giới hạn khối lượng mỗi lượt (kg)" hint="Đặt 0 để không giới hạn">
              <input
                type="number"
                min="0"
                value={weightLimit}
                onChange={(e) => setWeightLimit(e.target.value)}
                className={`${inputCls} max-w-[120px]`}
              />
            </FieldRow>
            <ToggleRow
              label="Cảnh báo điểm thu gom ngừng hoạt động"
              hint="Nhận thông báo khi điểm thu gom bị tạm ngưng"
              checked={ops.alertLocationInactive}
              onChange={setOpsKey('alertLocationInactive')}
            />
          </SubGroup>
        )}

        {/* REWARD_PROVIDER */}
        {isRewardProvider && (
          <SubGroup title="Đối tác quà tặng (REWARD PROVIDER)">
            <ToggleRow
              label="Tự động kích hoạt voucher mới"
              hint="Voucher được kích hoạt ngay sau khi tạo"
              checked={ops.autoActivateVoucher}
              onChange={setOpsKey('autoActivateVoucher')}
            />
            <ToggleRow
              label="Cảnh báo voucher gần hết số lượng"
              hint="Nhận cảnh báo khi tồn kho voucher dưới 10%"
              checked={ops.alertVoucherLow}
              onChange={setOpsKey('alertVoucherLow')}
            />
            <FieldRow label="Thời hạn voucher mặc định" hint="Tính từ ngày kích hoạt">
              <div className="flex items-center gap-2 max-w-[200px]">
                <input
                  type="number"
                  min="1"
                  value={voucherDefaultDays}
                  onChange={(e) => setVoucherDefaultDays(e.target.value)}
                  className={`${inputCls} max-w-[80px]`}
                />
                <span className="text-sm text-slate-500 flex-shrink-0">ngày</span>
              </div>
            </FieldRow>
          </SubGroup>
        )}

        {/* Fallback if no roles detected */}
        {!isCollector && !isRewardProvider && (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            Vai trò chưa được xác định. Vui lòng liên hệ quản trị viên.
          </div>
        )}

        <div className="px-6 py-4 flex justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={() => showToast('Đã lưu tuỳ chọn vận hành')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer active:scale-[0.98] shadow-sm shadow-emerald-600/20"
          >
            <Check className="w-3.5 h-3.5" />
            Lưu cài đặt vận hành
          </button>
        </div>
      </SettingSection>

      {/* ── 5. Giao diện ────────────────────────────────────────────────── */}
      <SettingSection
        id="appearance"
        icon={Palette}
        title="Giao diện"
        description="Ngôn ngữ, chủ đề hiển thị và định dạng dữ liệu"
      >
        <FieldRow label="Ngôn ngữ">
          <div className="relative max-w-[220px]">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={selectCls}
            >
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="en">🇺🇸 English</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </FieldRow>

        <FieldRow label="Chủ đề giao diện">
          <div className="relative max-w-[220px]">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className={selectCls}
            >
              <option value="system">⚙️ Theo hệ thống</option>
              <option value="light">☀️ Sáng</option>
              <option value="dark">🌙 Tối</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </FieldRow>

        <FieldRow label="Định dạng ngày giờ">
          <div className="relative max-w-[220px]">
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className={selectCls}
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY (Việt Nam)</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY (Quốc tế)</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD (ISO 8601)</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </FieldRow>

        <div className="px-6 py-4 flex justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={() => showToast('Đã lưu tuỳ chọn giao diện')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer active:scale-[0.98] shadow-sm shadow-emerald-600/20"
          >
            <Check className="w-3.5 h-3.5" />
            Lưu giao diện
          </button>
        </div>
      </SettingSection>

      {/* ── 6. Vùng nguy hiểm ───────────────────────────────────────────── */}
      <section id="danger" className="rounded-2xl border border-rose-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-rose-100 flex items-center gap-3 bg-rose-50">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <TriangleAlert className="w-4.5 h-4.5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-rose-700">Vùng nguy hiểm</h2>
            <p className="text-xs text-rose-400 mt-0.5">Các hành động này không thể hoàn tác hoặc cần xác nhận từ quản trị viên</p>
          </div>
        </div>

        <div className="divide-y divide-rose-100 bg-white">
          {/* Vô hiệu hoá */}
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Vô hiệu hoá tài khoản</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tạm thời khoá quyền truy cập. Tài khoản có thể khôi phục bởi quản trị viên.
              </p>
              {confirmDisable && (
                <p className="text-xs text-rose-600 font-medium mt-1.5">
                  ⚠️ Nhấn lại để xác nhận vô hiệu hoá tài khoản.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleDisableAccount}
              className={`flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer border active:scale-[0.98] ${
                confirmDisable
                  ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                  : 'text-rose-600 border-rose-200 hover:bg-rose-50'
              }`}
            >
              {confirmDisable ? '⚠️ Xác nhận vô hiệu hoá' : 'Vô hiệu hoá tài khoản'}
            </button>
          </div>

          {/* Xoá tài khoản */}
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Yêu cầu xoá tài khoản</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Gửi yêu cầu xoá toàn bộ dữ liệu. Quá trình này mất 7–14 ngày làm việc.
              </p>
              {confirmDelete && (
                <p className="text-xs text-rose-600 font-medium mt-1.5">
                  ⚠️ Nhấn lại để gửi yêu cầu xoá tài khoản vĩnh viễn.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className={`flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer border active:scale-[0.98] ${
                confirmDelete
                  ? 'bg-rose-700 text-white border-rose-700 hover:bg-rose-800'
                  : 'text-rose-700 border-rose-200 hover:bg-rose-50'
              }`}
            >
              {confirmDelete ? '🗑️ Xác nhận yêu cầu xoá' : 'Yêu cầu xoá tài khoản'}
            </button>
          </div>
        </div>
      </section>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};
