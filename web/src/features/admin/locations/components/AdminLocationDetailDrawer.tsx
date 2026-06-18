import { useState, type ReactNode } from 'react';
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Recycle,
  Store,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { IconButton, LoadingState } from '../../../../shared/components';
import { StatusPill } from '../../shared/admin-ui';
import { useAdminCollectionPointDetail } from '../services/queries';
import {
  CAPABILITY_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
} from '../services/constants';
import type { DropoffTransaction } from '../services/types';

type AdminLocationDetailDrawerProps = {
  locationId: string;
  onClose: () => void;
};

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có';

const formatNumber = (value?: number | null) =>
  typeof value === 'number' ? value.toLocaleString('vi-VN') : '0';

export const AdminLocationDetailDrawer = ({
  locationId,
  onClose,
}: AdminLocationDetailDrawerProps) => {
  const { data, isLoading } = useAdminCollectionPointDetail(locationId);
  const [activeTab, setActiveTab] = useState<'info' | 'transactions'>('info');

  if (isLoading || !data) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl sm:w-[720px]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">Chi tiết điểm thu gom</h2>
            <IconButton onClick={onClose} icon={<X />} variant="ghost" size="sm" aria-label="Đóng" />
          </div>
          <LoadingState message="Đang tải chi tiết..." className="py-20" />
        </div>
      </>
    );
  }

  const { location, transactions } = data;
  const status = location.status || 'PENDING';
  const siteType = location.collectionProfile?.siteType || location.type;
  const partnerName = location.partnerProfile?.organizationName || 'Không có đối tác';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl sm:w-[720px]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Chi tiết điểm thu gom</h2>
          <IconButton onClick={onClose} icon={<X />} variant="ghost" size="sm" aria-label="Đóng chi tiết" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pb-0">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MapPin className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-slate-900">{location.name || 'Không tên'}</h3>
                <p className="mt-1 text-sm text-slate-500">{location.address || 'Chưa có địa chỉ'}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill status={status} />
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {siteType ? TYPE_LABEL[siteType] || siteType : 'Chưa phân loại'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryStat label="Giao dịch" value={transactions.length.toLocaleString('vi-VN')} />
              <SummaryStat
                label="Đã xác nhận"
                value={transactions.filter((tx) => tx.status === 'VERIFIED').length.toLocaleString('vi-VN')}
              />
              <SummaryStat
                label="Điểm đã trao"
                value={transactions
                  .reduce((sum, tx) => sum + (tx.pointsAwarded || 0), 0)
                  .toLocaleString('vi-VN')}
              />
              <SummaryStat label="Trạng thái" value={STATUS_LABEL[status] || status} />
            </div>
          </div>

          <div className="mt-6 border-b border-slate-100 px-6">
            <div className="flex gap-4">
              {[
                { id: 'info', label: 'Thông tin chi tiết' },
                { id: 'transactions', label: 'Lịch sử giao dịch' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'info' | 'transactions')}
                  className={`border-b-2 py-3 text-sm font-bold transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'info' ? (
              <div className="space-y-4 text-sm">
                <InfoCard icon={<Store className="h-5 w-5" />} label="Đối tác quản lý" value={partnerName} />
                <InfoCard icon={<Phone className="h-5 w-5" />} label="Số điện thoại" value={location.contactPhone || 'Chưa có'} />
                <InfoCard
                  icon={<MapPin className="h-5 w-5" />}
                  label="Tọa độ"
                  value={
                    location.latitude != null && location.longitude != null
                      ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                      : 'Chưa có tọa độ'
                  }
                />

                <Section title="Năng lực điểm thu gom">
                  <ChipList
                    items={location.capabilities?.map((cap) => CAPABILITY_LABEL[cap.capability] || cap.capability)}
                    emptyText="Chưa cấu hình năng lực"
                  />
                </Section>

                <Section title="Loại rác tiếp nhận">
                  {location.acceptedWasteTypes?.length ? (
                    <div className="space-y-2">
                      {location.acceptedWasteTypes.map((waste) => (
                        <div key={waste.id} className="rounded-lg bg-slate-50 p-3">
                          <p className="font-semibold text-slate-900">{waste.wasteType}</p>
                          {waste.conditionNote && (
                            <p className="mt-1 text-xs text-slate-500">{waste.conditionNote}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">Chưa cấu hình loại rác tiếp nhận</p>
                  )}
                </Section>

                <Section title="Hồ sơ vận hành">
                  <div className="space-y-2 text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">Loại điểm: </span>
                      {siteType ? TYPE_LABEL[siteType] || siteType : 'Chưa có'}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Cần nhân viên xác nhận: </span>
                      {location.collectionProfile?.requiresStaffConfirmation === false ? 'Không' : 'Có'}
                    </p>
                    <p className="whitespace-pre-wrap">
                      <span className="font-semibold text-slate-900">Hướng dẫn: </span>
                      {location.collectionProfile?.instructions || 'Chưa có hướng dẫn'}
                    </p>
                  </div>
                </Section>

                <Section title="Thông tin hệ thống">
                  <div className="space-y-2 text-slate-700">
                    <p><span className="font-semibold text-slate-900">ID: </span>{location.id}</p>
                    <p><span className="font-semibold text-slate-900">Ngày tạo: </span>{formatDateTime(location.createdAt)}</p>
                    <p><span className="font-semibold text-slate-900">Cập nhật: </span>{formatDateTime(location.updatedAt)}</p>
                  </div>
                </Section>
              </div>
            ) : (
              <TransactionsList transactions={transactions} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const SummaryStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
    <p className="text-[10px] font-bold uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-base font-bold text-slate-900">{value}</p>
  </div>
);

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-xl border border-slate-100 p-4">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
        <p className="mt-1 font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="rounded-xl border border-slate-100 p-4">
    <p className="mb-3 font-semibold text-slate-900">{title}</p>
    {children}
  </div>
);

const ChipList = ({ items, emptyText }: { items?: string[]; emptyText: string }) => {
  if (!items?.length) {
    return <p className="text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          {item}
        </span>
      ))}
    </div>
  );
};

const TransactionsList = ({ transactions }: { transactions: DropoffTransaction[] }) => {
  if (!transactions.length) {
    return (
      <div className="rounded-xl border border-slate-100 p-8 text-center text-sm text-slate-500">
        Chưa có giao dịch nào tại điểm thu gom này.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div key={tx.id} className="rounded-xl border border-slate-100 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${transactionTone(tx.status)}`}>
                {transactionIcon(tx.status)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={tx.status || 'PENDING'} />
                  <span className="text-xs text-slate-500">{formatDateTime(tx.createdAt)}</span>
                </div>
                <p className="mt-2 font-semibold text-slate-900">
                  {tx.user?.fullName || tx.user?.email || 'Người dùng ẩn'}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Recycle className="h-3.5 w-3.5" />
                    {tx.acceptedWasteType?.wasteType || 'Chưa rõ loại rác'}
                  </span>
                  <span>
                    Số lượng: {formatNumber(tx.quantityValue)} {tx.quantityUnit || ''}
                  </span>
                  <span>Điểm: {formatNumber(tx.pointsAwarded)}</span>
                </div>
                {tx.verifiedBy && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                    <User className="h-3.5 w-3.5" />
                    Xác nhận bởi {tx.verifiedBy.fullName || tx.verifiedBy.email}
                  </p>
                )}
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{tx.id.slice(0, 8)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const transactionTone = (status?: string) => {
  if (status === 'VERIFIED') return 'bg-emerald-100 text-emerald-600';
  if (status === 'REJECTED') return 'bg-rose-100 text-rose-600';
  return 'bg-amber-100 text-amber-600';
};

const transactionIcon = (status?: string) => {
  if (status === 'VERIFIED') return <CheckCircle className="h-4 w-4" />;
  if (status === 'REJECTED') return <XCircle className="h-4 w-4" />;
  return <Clock className="h-4 w-4" />;
};
