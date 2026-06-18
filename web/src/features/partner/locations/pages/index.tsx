import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Eye, Pencil, Loader2, X, Check,
  AlertTriangle, CheckCircle2, Phone, MapPin, Info,
  Shield, Download, SlidersHorizontal, RefreshCw,
  ChevronDown, Package, Recycle, XCircle,
  Map, List, Upload,
} from 'lucide-react';
import { apiClient } from '../../../../shared/services/api-client';
import { useGetLocations } from '../services/use-get-locations';
import { useCreateLocation } from '../services/use-create-location';
import { useUpdateLocation } from '../services/use-update-location';
import { useGetTransactions } from '../services/use-get-transactions';
import {
  STATUS_LABEL,
  STATUS_COLOR,
  TYPE_LABEL,
  WASTE_LABEL,
  CAPABILITY_LABEL,
  SITE_TYPE_LABEL,
  TX_STATUS_LABEL,
  TX_STATUS_COLOR,
  inputCls,
} from '../services/constants';
import type {
  Location,
  LocationType,
  LocationCapabilityType,
  CollectionSiteType,
  WasteType,
  AcceptedWasteType,
  CollectionProfile,
  LocationStatus,
} from '../services/types';
import { locationFormSchema } from '../services/schemas';
import LocationMap from '../components/location-map';
import { Badge, Modal, DataTable, IconButton, SearchFilterBar } from '../../../../shared/components';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_WASTE_TYPES: WasteType[] = ['PLASTIC', 'PAPER', 'BATTERY', 'GLASS', 'METAL', 'E_WASTE', 'TEXTILE', 'OTHER'];
const ALL_CAPABILITY_TYPES: LocationCapabilityType[] = ['COLLECTION', 'REWARD_PICKUP'];
const ALL_LOCATION_TYPES: LocationType[] = ['BIN', 'CENTER', 'COLLECTION_POINT'];
const ALL_LOCATION_STATUSES: LocationStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'INACTIVE'];
const ALL_SITE_TYPES: CollectionSiteType[] = ['MACHINE', 'COUNTER', 'BIN'];

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const selectCls =
  'w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer';


// ─── Form default state ───────────────────────────────────────────────────────

interface LocationFormState {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  type: LocationType;
  contactPhone: string;
  avatarUrl: string;
  capabilities: LocationCapabilityType[];
  acceptedWasteTypes: AcceptedWasteType[];
  collectionProfile: CollectionProfile;
}

const emptyForm = (): LocationFormState => ({
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  type: 'COLLECTION_POINT',
  contactPhone: '',
  avatarUrl: '',
  capabilities: ['COLLECTION'],
  acceptedWasteTypes: [],
  collectionProfile: { siteType: 'COUNTER', requiresStaffConfirmation: false, instructions: '' },
});

const locationToForm = (loc: Location): LocationFormState => ({
  name: loc.name,
  address: loc.address,
  latitude: loc.latitude !== undefined ? String(loc.latitude) : '',
  longitude: loc.longitude !== undefined ? String(loc.longitude) : '',
  type: loc.type,
  contactPhone: loc.contactPhone ?? '',
  avatarUrl: loc.avatarUrl ?? '',
  capabilities: loc.capabilities?.map((c: any) => typeof c === 'string' ? c : c.capability) ?? [],
  acceptedWasteTypes: loc.acceptedWasteTypes ?? [],
  collectionProfile: loc.collectionProfile ?? { siteType: 'COUNTER', requiresStaffConfirmation: false },
});

// ─── Location Form Modal ──────────────────────────────────────────────────────

interface LocationFormModalProps {
  editTarget: Location | null;
  onClose: () => void;
}

const LocationFormModal: React.FC<LocationFormModalProps> = ({ editTarget, onClose }) => {
  const isEdit = !!editTarget;
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState<LocationFormState>(
    editTarget ? locationToForm(editTarget) : emptyForm()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const set = <K extends keyof LocationFormState>(k: K, v: LocationFormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // capabilities toggle
  const toggleCapability = (cap: LocationCapabilityType) => {
    set('capabilities', form.capabilities.includes(cap)
      ? form.capabilities.filter((c) => c !== cap)
      : [...form.capabilities, cap]
    );
  };

  // waste types
  const hasWaste = (wt: WasteType) => form.acceptedWasteTypes.some((a) => a.wasteType === wt);
  const toggleWaste = (wt: WasteType) => {
    if (hasWaste(wt)) {
      set('acceptedWasteTypes', form.acceptedWasteTypes.filter((a) => a.wasteType !== wt));
    } else {
      set('acceptedWasteTypes', [...form.acceptedWasteTypes, { wasteType: wt }]);
    }
  };
  const setWasteNote = (wt: WasteType, note: string) => {
    set('acceptedWasteTypes', form.acceptedWasteTypes.map((a) =>
      a.wasteType === wt ? { ...a, conditionNote: note } : a
    ));
  };

  // collectionProfile
  const setProfile = <K extends keyof CollectionProfile>(k: K, v: CollectionProfile[K]) =>
    set('collectionProfile', { ...form.collectionProfile, [k]: v });

  const [isUploading, setIsUploading] = useState(false);
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setSubmitError('');
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await apiClient.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (res.data.success) {
        set('avatarUrl', res.data.url);
      }
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Có lỗi khi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    setErrors({});
    setSubmitError('');

    // Zod validation for core fields
    const zodResult = locationFormSchema.safeParse({
      name: form.name,
      address: form.address,
      contactPhone: form.contactPhone || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
    });

    if (!zodResult.success) {
      const fieldErrors: Record<string, string> = {};
      zodResult.error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const dto = {
      name: form.name,
      address: form.address,
      type: form.type,
      contactPhone: form.contactPhone || undefined,
      avatarUrl: form.avatarUrl || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      capabilities: form.capabilities.length > 0 ? form.capabilities : undefined,
      acceptedWasteTypes: form.acceptedWasteTypes.length > 0 
        ? form.acceptedWasteTypes.map(({ wasteType, conditionNote }) => ({ wasteType, conditionNote })) 
        : undefined,
      collectionProfile:
        form.collectionProfile.siteType ||
          form.collectionProfile.instructions ||
          form.collectionProfile.requiresStaffConfirmation !== undefined
          ? {
              siteType: form.collectionProfile.siteType,
              instructions: form.collectionProfile.instructions,
              requiresStaffConfirmation: form.collectionProfile.requiresStaffConfirmation,
            }
          : undefined,
    };

    if (isEdit && editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, dto },
        {
          onSuccess: () => onClose(),
          onError: (err: any) =>
            setSubmitError(err?.response?.data?.message || 'Có lỗi khi cập nhật điểm thu gom'),
        }
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => onClose(),
        onError: (err: any) =>
          setSubmitError(err?.response?.data?.message || 'Có lỗi khi tạo điểm thu gom'),
      });
    }
  };

  return (
    <Modal
      title={
        <div>
          <span className="text-base font-bold text-slate-900 block">
            {isEdit ? 'Cập nhật điểm thu gom' : 'Thêm điểm thu gom mới'}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 font-normal block">
            {isEdit ? `Đang sửa: ${editTarget.name}` : 'Điền thông tin để tạo địa điểm mới'}
          </span>
        </div>
      }
      onClose={onClose}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl cursor-pointer active:scale-[0.98] transition-all shadow-sm shadow-emerald-600/20"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Lưu thay đổi' : 'Tạo điểm thu gom'}
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* ── Basic Info ── */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Thông tin cơ bản</p>
          <div className="space-y-4">
            
            {/* Avatar */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-semibold text-slate-600">Ảnh đại diện</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-slate-400" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                    id="avatar-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer transition-colors"
                  >
                    Tải ảnh lên
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1.5">Định dạng JPEG, PNG. Tối đa 5MB.</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Tên điểm thu gom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="VD: Điểm thu gom Q.1 – Nguyễn Huệ"
                className={inputCls}
              />
              {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Địa chỉ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                className={inputCls}
              />
              {errors.address && <p className="text-xs text-rose-500">{errors.address}</p>}
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Vĩ độ (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => set('latitude', e.target.value)}
                  placeholder="VD: 10.7769"
                  className={inputCls}
                />
                {errors.latitude && <p className="text-xs text-rose-500">{errors.latitude}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Kinh độ (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => set('longitude', e.target.value)}
                  placeholder="VD: 106.7009"
                  className={inputCls}
                />
                {errors.longitude && <p className="text-xs text-rose-500">{errors.longitude}</p>}
              </div>
            </div>

            {/* Type + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Loại địa điểm</label>
                <div className="relative">
                  <select
                    value={form.type}
                    onChange={(e) => set('type', e.target.value as LocationType)}
                    className={selectCls}
                  >
                    {ALL_LOCATION_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => set('contactPhone', e.target.value)}
                  placeholder="0912 345 678"
                  className={inputCls}
                />
                {errors.contactPhone && <p className="text-xs text-rose-500">{errors.contactPhone}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Capabilities ── */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Khả năng của điểm</p>
          <div className="flex gap-3 flex-wrap">
            {ALL_CAPABILITY_TYPES.map((cap) => {
              const active = form.capabilities.includes(cap);
              return (
                <button
                  key={cap}
                  type="button"
                  onClick={() => toggleCapability(cap)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${active
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                >
                  {active
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  }
                  {CAPABILITY_LABEL[cap]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Accepted Waste Types ── */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Loại rác chấp nhận</p>
          <div className="space-y-2">
            {ALL_WASTE_TYPES.map((wt) => {
              const active = hasWaste(wt);
              const entry = form.acceptedWasteTypes.find((a) => a.wasteType === wt);
              return (
                <div key={wt} className={`rounded-xl border p-3 transition-all ${active ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleWaste(wt)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${active ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'
                        }`}
                    >
                      {active && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className="text-sm font-medium text-slate-700">{WASTE_LABEL[wt]}</span>
                  </div>
                  {active && (
                    <div className="mt-2 ml-7">
                      <input
                        type="text"
                        value={entry?.conditionNote ?? ''}
                        onChange={(e) => setWasteNote(wt, e.target.value)}
                        placeholder="Điều kiện tiếp nhận (tuỳ chọn)..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 transition-all"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Collection Profile ── */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Hồ sơ điểm thu gom</p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Loại điểm tiếp nhận</label>
              <div className="relative">
                <select
                  value={form.collectionProfile.siteType ?? ''}
                  onChange={(e) => setProfile('siteType', e.target.value as CollectionSiteType || undefined)}
                  className={selectCls}
                >
                  <option value="">-- Chọn loại điểm --</option>
                  {ALL_SITE_TYPES.map((s) => (
                    <option key={s} value={s}>{SITE_TYPE_LABEL[s]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Hướng dẫn gửi rác</label>
              <textarea
                value={form.collectionProfile.instructions ?? ''}
                onChange={(e) => setProfile('instructions', e.target.value)}
                rows={3}
                placeholder="Hướng dẫn cụ thể cho người dùng khi đến gửi rác..."
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.collectionProfile.requiresStaffConfirmation}
                onClick={() => setProfile('requiresStaffConfirmation', !form.collectionProfile.requiresStaffConfirmation)}
                className={`relative inline-flex w-10 h-5.5 rounded-full transition-colors cursor-pointer ${form.collectionProfile.requiresStaffConfirmation ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
              >
                <span className={`inline-block w-4 h-4 mt-0.5 ml-0.5 rounded-full bg-white shadow-sm transform transition-transform ${form.collectionProfile.requiresStaffConfirmation ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
              </button>
              <span className="text-sm text-slate-700">Yêu cầu nhân viên xác nhận khi nhận rác</span>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {submitError}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  location: Location;
  onClose: () => void;
  onEdit: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ location, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{location.name}</h3>
            <Badge label={STATUS_LABEL[location.status]} className={STATUS_COLOR[location.status]} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              Sửa
            </button>
            <IconButton
              onClick={onClose}
              icon={<X />}
              variant="ghost"
              size="sm"
              aria-label="Đóng chi tiết"
              className="text-slate-400 hover:text-slate-600 ml-1"
            />
          </div>
        </div>

        <div className="flex-1 p-5 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông tin cơ bản</p>
            {location.avatarUrl && (
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 border border-slate-200">
                <img src={location.avatarUrl} alt={location.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex gap-2 items-start">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{location.address}</span>
              </div>
              {location.contactPhone && (
                <div className="flex gap-2 items-center">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-700">{location.contactPhone}</span>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">{TYPE_LABEL[location.type]}</span>
              </div>
              {(location.latitude || location.longitude) && (
                <div className="flex gap-2 items-center">
                  <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-500 text-xs">
                    {location.latitude}, {location.longitude}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Capabilities */}
          {location.capabilities && location.capabilities.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khả năng</p>
              <div className="flex flex-wrap gap-2">
                {location.capabilities.map((cap) => {
                  const capStr = typeof cap === 'string' ? cap : (cap as any).capability;
                  return (
                    <Badge
                      key={capStr}
                      label={CAPABILITY_LABEL[capStr as LocationCapabilityType]}
                      className={capStr === 'COLLECTION' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Accepted waste types */}
          {location.acceptedWasteTypes && location.acceptedWasteTypes.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Loại rác chấp nhận</p>
              <div className="space-y-1.5">
                {location.acceptedWasteTypes.map(({ wasteType, conditionNote }) => (
                  <div key={wasteType} className="flex items-start gap-2">
                    <Recycle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-slate-700 font-medium">{WASTE_LABEL[wasteType]}</span>
                      {conditionNote && (
                        <p className="text-xs text-slate-400 mt-0.5">{conditionNote}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collection Profile */}
          {location.collectionProfile && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hồ sơ điểm thu gom</p>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm text-slate-700">
                {location.collectionProfile.siteType && (
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Loại điểm: <strong>{SITE_TYPE_LABEL[location.collectionProfile.siteType]}</strong></span>
                  </div>
                )}
                {location.collectionProfile.instructions && (
                  <div className="flex gap-2 items-start">
                    <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{location.collectionProfile.instructions}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>
                    {location.collectionProfile.requiresStaffConfirmation
                      ? 'Cần nhân viên xác nhận'
                      : 'Không cần nhân viên xác nhận'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Transactions Panel ───────────────────────────────────────────────────────

const TransactionsPanel: React.FC = () => {
  const { data: transactions = [], isLoading, refetch } = useGetTransactions();

  const [searchTx, setSearchTx] = useState('');
  const [txTab, setTxTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => txTab === 'ALL' || t.status === txTab)
      .filter((t) => {
        const q = searchTx.toLowerCase();
        return (
          (t.user?.fullName ?? t.user?.displayName ?? '').toLowerCase().includes(q) ||
          (t.user?.email ?? '').toLowerCase().includes(q) ||
          (t.location?.name ?? '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }, [transactions, txTab, searchTx]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(['PENDING', 'VERIFIED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTxTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${txTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab === 'ALL' ? 'Tất cả' : TX_STATUS_LABEL[tab]}
              {tab !== 'ALL' && (
                <span className="ml-1 text-[10px] font-bold">
                  ({transactions.filter((t) => t.status === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên người dùng, điểm thu..."
              value={searchTx}
              onChange={(e) => setSearchTx(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all w-56"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filtered}
        isLoading={isLoading}
        loadingMessage="Đang tải giao dịch..."
        emptyIcon={<XCircle className="w-8 h-8" />}
        emptyTitle="Không có giao dịch nào"
        emptyClassName="py-16"
        columns={[
          {
            header: 'Người gửi',
            render: (tx) => (
              <>
                <p className="font-medium text-slate-900">{tx.user?.fullName ?? tx.user?.displayName ?? 'Ẩn danh'}</p>
                <p className="text-xs text-slate-400">{tx.user?.email ?? ''}</p>
              </>
            ),
          },
          {
            header: 'Điểm thu gom',
            render: (tx) => (
              <>
                <p className="text-slate-700">{tx.location?.name ?? '—'}</p>
                <p className="text-xs text-slate-400 truncate max-w-[160px]">{tx.location?.address ?? ''}</p>
              </>
            ),
          },
          {
            header: 'Rác / Khối lượng',
            render: (tx) => (
              <>
                <p className="font-medium">{tx.acceptedWasteType?.wasteType ? WASTE_LABEL[tx.acceptedWasteType.wasteType as WasteType] : 'Chưa phân loại'}</p>
                {tx.quantityValue != null && (
                  <p className="text-xs text-slate-400">
                    {tx.quantityValue} {tx.quantityUnit}
                  </p>
                )}
              </>
            ),
          },
          {
            header: 'Khoảng cách',
            className: 'text-xs text-slate-500',
            render: (tx) => tx.distanceKm != null ? `${tx.distanceKm.toFixed(2)} km` : '—',
          },
          {
            header: 'Điểm thưởng',
            render: (tx) => tx.status === 'VERIFIED' && tx.pointsAwarded != null ? (
              <span className="font-bold text-emerald-600">+{tx.pointsAwarded}</span>
            ) : tx.status === 'REJECTED' ? (
              <span className="text-xs text-rose-500 italic">{tx.rejectionReason ?? 'Từ chối'}</span>
            ) : '—',
          },
          {
            header: 'Trạng thái',
            render: (tx) => (
              <Badge label={TX_STATUS_LABEL[tx.status]} className={TX_STATUS_COLOR[tx.status]} />
            ),
          },
        ]}
      />
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type ActiveTab = 'locations' | 'transactions';

export const Locations: React.FC = () => {
  const { data: locations = [], isLoading, refetch } = useGetLocations();

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<LocationStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<LocationType | 'ALL'>('ALL');
  const [filterWaste, setFilterWaste] = useState<WasteType | 'ALL'>('ALL');

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('locations');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [detailTarget, setDetailTarget] = useState<Location | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredLocations = useMemo(() => {
    return locations
      .filter((loc) => {
        const q = search.toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.address.toLowerCase().includes(q)
        );
      })
      .filter((loc) => filterStatus === 'ALL' || loc.status === filterStatus)
      .filter((loc) => filterType === 'ALL' || loc.type === filterType)
      .filter((loc) => {
        if (filterWaste === 'ALL') return true;
        return loc.acceptedWasteTypes?.some((a) => a.wasteType === filterWaste);
      });
  }, [locations, search, filterStatus, filterType, filterWaste]);

  const openCreate = () => { setEditTarget(null); setShowForm(true); };
  const openEdit = (loc: Location) => { setEditTarget(loc); setShowForm(true); setDetailTarget(null); };
  const closeForm = () => { setShowForm(false); setEditTarget(null); refetch(); };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Điểm thu gom</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý các địa điểm người dùng có thể gửi rác và check-in.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 cursor-pointer active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Thêm điểm thu gom
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {([['locations', 'Điểm thu gom'], ['transactions', 'Giao dịch chờ duyệt']] as [ActiveTab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-all ${activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Locations Tab ── */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          {/* Filters */}
          <SearchFilterBar
            searchPlaceholder="Tìm theo tên hoặc địa chỉ..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                key: 'status',
                value: filterStatus,
                onChange: (v) => setFilterStatus(v as LocationStatus | 'ALL'),
                placeholder: 'Tất cả trạng thái',
                options: ALL_LOCATION_STATUSES.map(s => ({ value: s, label: STATUS_LABEL[s] })),
              },
              {
                key: 'type',
                value: filterType,
                onChange: (v) => setFilterType(v as LocationType | 'ALL'),
                placeholder: 'Tất cả loại',
                options: ALL_LOCATION_TYPES.map(t => ({ value: t, label: TYPE_LABEL[t] })),
              },
              {
                key: 'waste',
                value: filterWaste,
                onChange: (v) => setFilterWaste(v as WasteType | 'ALL'),
                placeholder: 'Tất cả loại rác',
                options: ALL_WASTE_TYPES.map(w => ({ value: w, label: WASTE_LABEL[w] })),
              }
            ]}
            actions={
              <>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-auto">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{filteredLocations.length} / {locations.length} điểm</span>
                </div>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg ml-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${viewMode === 'list'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    Danh sách
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${viewMode === 'map'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    Bản đồ
                  </button>
                </div>
                <button
                  onClick={() => refetch()}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer ml-1"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            }
          />

          {/* Locations Content: Map or List */}
          {viewMode === 'map' ? (
            <LocationMap
              locations={filteredLocations}
              onViewDetail={(loc) => setDetailTarget(loc as any)}
            />
          ) : (
            <DataTable
              data={filteredLocations}
              isLoading={isLoading}
              loadingMessage="Đang tải danh sách điểm thu gom..."
              emptyIcon={<MapPin className="w-10 h-10" />}
              emptyTitle="Không có điểm thu gom nào"
              emptyDescription="Thêm điểm mới hoặc thay đổi bộ lọc"
              emptyClassName="py-20"
              emptyAction={
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm điểm thu gom
                </button>
              }
              columns={[
                {
                  header: 'Tên / Địa chỉ',
                  className: 'max-w-[240px]',
                  render: (loc) => (
                    <>
                      <p className="font-semibold text-slate-900 truncate">{loc.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {loc.address}
                      </p>
                      {(loc.latitude || loc.longitude) && (
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          {loc.latitude}, {loc.longitude}
                        </p>
                      )}
                    </>
                  ),
                },
                {
                  header: 'Loại',
                  render: (loc) => (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-medium">
                      {TYPE_LABEL[loc.type]}
                    </span>
                  ),
                },
                {
                  header: 'Liên hệ',
                  render: (loc) => loc.contactPhone ? (
                    <span className="text-xs flex items-center gap-1 text-slate-600">
                      <Phone className="w-3 h-3" />
                      {loc.contactPhone}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  ),
                },
                {
                  header: 'Loại rác',
                  render: (loc) => (
                    <div className="flex flex-wrap gap-1">
                      {loc.acceptedWasteTypes && loc.acceptedWasteTypes.length > 0 ? (
                        loc.acceptedWasteTypes.slice(0, 3).map(({ wasteType }) => (
                          <span
                            key={wasteType}
                            className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md font-medium"
                          >
                            {WASTE_LABEL[wasteType]}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                      {loc.acceptedWasteTypes && loc.acceptedWasteTypes.length > 3 && (
                        <span className="text-[10px] text-slate-400">
                          +{loc.acceptedWasteTypes.length - 3}
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  header: 'Khả năng',
                  render: (loc) => (
                    <div className="flex flex-col gap-1 items-start">
                      {loc.capabilities && loc.capabilities.length > 0 ? (
                        loc.capabilities.map((cap) => {
                          const capStr = typeof cap === 'string' ? cap : (cap as any).capability;
                          return (
                            <Badge
                              key={capStr}
                              label={CAPABILITY_LABEL[capStr as LocationCapabilityType]}
                              className={capStr === 'COLLECTION' ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700'}
                            />
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>
                  ),
                },
                {
                  header: 'Trạng thái',
                  render: (loc) => (
                    <Badge label={STATUS_LABEL[loc.status]} className={STATUS_COLOR[loc.status]} />
                  ),
                },
                {
                  header: 'Thao tác',
                  className: 'text-right',
                  render: (loc) => (
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => setDetailTarget(loc)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() => openEdit(loc)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Sửa
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
      )}

      {/* ── Transactions Tab ── */}
      {activeTab === 'transactions' && <TransactionsPanel />}

      {/* ── Modals / Panels ── */}
      {showForm && (
        <LocationFormModal
          editTarget={editTarget}
          onClose={closeForm}
        />
      )}

      {detailTarget && (
        <DetailPanel
          location={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => openEdit(detailTarget)}
        />
      )}
    </div>
  );
};
