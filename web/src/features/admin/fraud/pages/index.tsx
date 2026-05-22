import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, AdminToolbar, StatusPill } from '../../shared/admin-ui';
import { fraudAlerts } from '../../shared/mock-data';

type FraudRow = (typeof fraudAlerts)[number];

const columns: ColumnDef<FraudRow>[] = [
  { header: 'Mã cảnh báo', render: (alert) => <span className="font-bold text-slate-800">{alert.id}</span> },
  { header: 'Người dùng', render: (alert) => alert.user },
  { header: 'Lý do', render: (alert) => alert.reason },
  { header: 'Mức độ', render: (alert) => <StatusPill status={alert.severity} /> },
  { header: 'Trạng thái', render: (alert) => <StatusPill status={alert.status} /> },
];

export const AdminFraudPage: React.FC = () => (
  <div className="space-y-6">
    <AdminPageHeader
      title="Cảnh báo gian lận"
      description="Bảng mock cho các tín hiệu bất thường: QR lặp, GPS sai lệch, tần suất gửi rác và hành vi đổi quà đáng nghi."
      action={<button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><ShieldAlert className="h-4 w-4" />Xuất báo cáo</button>}
    />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <AdminStatCard label="Đang mở" value="18" change="open" tone="rose" />
      <AdminStatCard label="Rủi ro cao" value="7" change="high" tone="rose" />
      <AdminStatCard label="Đang rà soát" value="9" change="review" tone="amber" />
      <AdminStatCard label="Đã đóng" value="126" change="tháng này" tone="emerald" />
    </div>
    <AdminToolbar placeholder="Tìm cảnh báo, người dùng, lý do..." />
    <DataTable data={fraudAlerts} columns={columns} />
  </div>
);
