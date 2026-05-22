import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, AdminToolbar, StatusPill } from '../../shared/admin-ui';
import { transactions } from '../../shared/mock-data';

type TransactionRow = (typeof transactions)[number];

const columns: ColumnDef<TransactionRow>[] = [
  { header: 'Mã GD', render: (tx) => <span className="font-bold text-slate-800">{tx.id}</span> },
  { header: 'Người dùng', render: (tx) => tx.user },
  { header: 'Điểm thu gom', render: (tx) => tx.location },
  { header: 'Rác', render: (tx) => `${tx.waste} · ${tx.amount}` },
  { header: 'Điểm', render: (tx) => tx.points, className: 'text-right font-bold' },
  { header: 'Rủi ro', render: (tx) => <StatusPill status={tx.risk} /> },
  { header: 'Trạng thái', render: (tx) => <StatusPill status={tx.status} /> },
];

export const AdminTransactionsPage: React.FC = () => (
  <div className="space-y-6">
    <AdminPageHeader
      title="Giao dịch thu gom"
      description="Dữ liệu mẫu cho luồng admin kiểm tra giao dịch, điểm thưởng, rủi ro và trạng thái xác nhận."
      action={<button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><ClipboardCheck className="h-4 w-4" />Duyệt hàng loạt</button>}
    />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <AdminStatCard label="Hôm nay" value="384" change="+18%" tone="blue" />
      <AdminStatCard label="Đã duyệt" value="349" change="90.9%" tone="emerald" />
      <AdminStatCard label="Chờ duyệt" value="26" change="pending" tone="amber" />
      <AdminStatCard label="Rủi ro cao" value="9" change="high" tone="rose" />
    </div>
    <AdminToolbar placeholder="Tìm mã giao dịch, người dùng..." />
    <DataTable data={transactions} columns={columns} />
  </div>
);
