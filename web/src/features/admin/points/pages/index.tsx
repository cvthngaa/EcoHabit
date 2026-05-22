import React from 'react';
import { Trophy } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, AdminToolbar, StatusPill } from '../../shared/admin-ui';
import { pointRules } from '../../shared/mock-data';

type PointRuleRow = (typeof pointRules)[number];

const columns: ColumnDef<PointRuleRow>[] = [
  { header: 'Nguồn điểm', render: (rule) => <span className="font-bold text-slate-800">{rule.source}</span> },
  { header: 'Tỷ lệ', render: (rule) => rule.rate },
  { header: 'Giới hạn', render: (rule) => rule.limit },
  { header: 'Trạng thái', render: (rule) => <StatusPill status={rule.status} /> },
];

export const AdminPointsPage: React.FC = () => (
  <div className="space-y-6">
    <AdminPageHeader
      title="Quy tắc điểm"
      description="Mock cấu hình điểm thưởng theo loại rác, quiz, scan AI và giới hạn chống gian lận."
      action={<button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Trophy className="h-4 w-4" />Tạo quy tắc</button>}
    />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AdminStatCard label="Điểm đã cấp" value="2.8M" change="+11%" tone="blue" />
      <AdminStatCard label="Quy tắc active" value="12" change="ổn định" tone="emerald" />
      <AdminStatCard label="Đang tạm dừng" value="2" change="review" tone="amber" />
    </div>
    <AdminToolbar placeholder="Tìm nguồn điểm hoặc giới hạn..." />
    <DataTable data={pointRules} columns={columns} />
  </div>
);
