import React, { useState, useEffect } from 'react';
import { 
  Building2, User, Phone, Mail, FileText, MapPin, 
  Edit3, Save, Loader2, CheckCircle2, ShieldCheck, 
  AlertTriangle, Clock
} from 'lucide-react';
import { useGetProfile } from '../../auth/services/use-get-profile';
import { useUpdateProfile } from '../../auth/services/use-update-profile';
import { LoadingState } from '../../../shared/components/LoadingState';
import { inputCls } from '../../locations/services/constants';

export const Profile: React.FC = () => {
  const { data: profile, isLoading, refetch } = useGetProfile();
  const updateMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields state
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [address, setAddress] = useState('');
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setOrganizationName(profile.organizationName || '');
      setOrganizationType(profile.organizationType || '');
      setContactName(profile.contactName || '');
      setContactPhone(profile.contactPhone || '');
      setContactEmail(profile.contactEmail || '');
      setTaxCode(profile.taxCode || '');
      setAddress(profile.address || '');
      setBusinessLicenseUrl(profile.businessLicenseUrl || '');
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!organizationName.trim()) {
      setErrorMsg('Tên tổ chức/doanh nghiệp không được để trống');
      return;
    }

    updateMutation.mutate(
      {
        organizationName,
        organizationType: organizationType || undefined,
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
        taxCode: taxCode || undefined,
        address: address || undefined,
        businessLicenseUrl: businessLicenseUrl || undefined,
      },
      {
        onSuccess: () => {
          setSuccessMsg('Hồ sơ doanh nghiệp đã được cập nhật thành công!');
          setIsEditing(false);
          refetch();
          setTimeout(() => setSuccessMsg(''), 5000);
        },
        onError: (err: any) => {
          setErrorMsg(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
        }
      }
    );
  };

  const handleCancel = () => {
    if (profile) {
      setOrganizationName(profile.organizationName || '');
      setOrganizationType(profile.organizationType || '');
      setContactName(profile.contactName || '');
      setContactPhone(profile.contactPhone || '');
      setContactEmail(profile.contactEmail || '');
      setTaxCode(profile.taxCode || '');
      setAddress(profile.address || '');
      setBusinessLicenseUrl(profile.businessLicenseUrl || '');
    }
    setIsEditing(false);
    setErrorMsg('');
  };

  if (isLoading) {
    return <LoadingState message="Đang tải hồ sơ doanh nghiệp..." className="min-h-[50vh]" size="lg" />;
  }

  const approvalStatus = profile?.approvalStatus || 'PENDING';
  
  const statusConfig = {
    APPROVED: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      badgeBg: 'bg-emerald-500 text-white',
      label: 'Đã phê duyệt',
      icon: ShieldCheck,
      desc: 'Doanh nghiệp của bạn đã được xác thực và hoạt động đầy đủ trong mạng lưới EcoHabit.',
    },
    PENDING: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      badgeBg: 'bg-amber-500 text-white',
      label: 'Đang chờ duyệt',
      icon: Clock,
      desc: 'Hồ sơ doanh nghiệp đang được Ban quản trị phê duyệt. Một số tính năng có thể bị giới hạn.',
    },
    REJECTED: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      badgeBg: 'bg-rose-500 text-white',
      label: 'Đã bị từ chối',
      icon: AlertTriangle,
      desc: 'Hồ sơ doanh nghiệp không được chấp nhận. Vui lòng liên hệ hỗ trợ hoặc cập nhật lại thông tin.',
    },
  }[approvalStatus];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hồ sơ doanh nghiệp</h1>
          <p className="text-slate-500 text-sm mt-0.5">Quản lý thông tin tổ chức đối tác và trạng thái phê duyệt</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10 active:scale-[0.98] transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Chỉnh sửa hồ sơ
          </button>
        )}
      </div>

      {/* Success/Error Toast */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Status Warning Card */}
      <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row gap-4 items-start ${statusConfig.bg}`}>
        <div className={`p-3 rounded-2xl flex-shrink-0 ${statusConfig.badgeBg}`}>
          <StatusIcon className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight">Trạng thái: {statusConfig.label}</span>
          </div>
          <p className="text-sm leading-relaxed opacity-90">{statusConfig.desc}</p>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Chi tiết doanh nghiệp</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Organization Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                Tên tổ chức / Doanh nghiệp <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className={inputCls}
                  placeholder="Nhập tên doanh nghiệp..."
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-800">
                  {organizationName || 'Chưa thiết lập'}
                </div>
              )}
            </div>

            {/* Organization Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                Loại hình tổ chức
              </label>
              {isEditing ? (
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Chọn loại hình...</option>
                  <option value="Môi trường / Thu gom rác">Môi trường / Thu gom rác</option>
                  <option value="Cửa hàng tiện lợi / Siêu thị">Cửa hàng tiện lợi / Siêu thị</option>
                  <option value="Trường học / Trung tâm giáo dục">Trường học / Trung tâm giáo dục</option>
                  <option value="Doanh nghiệp xã hội / NGO">Doanh nghiệp xã hội / NGO</option>
                  <option value="Doanh nghiệp sản xuất">Doanh nghiệp sản xuất</option>
                  <option value="Khác">Khác</option>
                </select>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700">
                  {organizationType || 'Chưa xác định'}
                </div>
              )}
            </div>

            {/* Tax Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                Mã số thuế doanh nghiệp
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  className={inputCls}
                  placeholder="Mã số thuế..."
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700">
                  {taxCode || 'Chưa thiết lập'}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                Địa chỉ trụ sở chính
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputCls}
                  placeholder="Nhập địa chỉ..."
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 leading-relaxed flex gap-2 items-start">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{address || 'Chưa thiết lập'}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2 border-b border-slate-100 pb-1 mt-2">
              <div className="flex items-center gap-2 text-slate-500">
                <User className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Thông tin người liên hệ đại diện</span>
              </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                Tên người đại diện liên hệ
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className={inputCls}
                  placeholder="Tên người đại diện..."
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700">
                  {contactName || 'Chưa thiết lập'}
                </div>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                Số điện thoại liên hệ
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={inputCls}
                  placeholder="Số điện thoại..."
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 flex gap-2 items-center">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{contactPhone || 'Chưa thiết lập'}</span>
                </div>
              )}
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                Email liên hệ chính thức
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={inputCls}
                  placeholder="Email liên hệ..."
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 flex gap-2 items-center">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{contactEmail || 'Chưa thiết lập'}</span>
                </div>
              )}
            </div>

            {/* Business License Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                Giấy phép đăng ký kinh doanh (URL)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={businessLicenseUrl}
                  onChange={(e) => setBusinessLicenseUrl(e.target.value)}
                  className={inputCls}
                  placeholder="Đường dẫn tài liệu hoặc giấy phép..."
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 flex gap-2 items-center truncate">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {businessLicenseUrl ? (
                    <a 
                      href={businessLicenseUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-emerald-600 hover:text-emerald-700 font-semibold underline truncate"
                    >
                      Xem tài liệu giấy phép
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Chưa cung cấp</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {isEditing && (
            <div className="flex gap-3 justify-end border-t border-slate-100 pt-5 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium cursor-pointer"
              >
                Hủy thay đổi
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/10 cursor-pointer active:scale-[0.98] transition-all"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Lưu hồ sơ
              </button>
            </div>
          )}
        </form>
      </div>

    </div>
  );
};
