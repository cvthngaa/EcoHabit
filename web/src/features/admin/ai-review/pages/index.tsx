import React from 'react';
import { Bot } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, AdminToolbar, ProgressBar, StatusPill } from '../../shared/admin-ui';
import { aiReviews } from '../../shared/mock-data';

type AiReviewRow = (typeof aiReviews)[number];

const columns: ColumnDef<AiReviewRow>[] = [
  { header: 'Ảnh', render: (item) => <span className="font-bold text-slate-800">{item.image}</span> },
  { header: 'AI dự đoán', render: (item) => item.predicted },
  { header: 'Confidence', render: (item) => <div className="min-w-32"><div className="mb-1 text-xs font-bold text-slate-600">{Math.round(item.confidence * 100)}%</div><ProgressBar value={item.confidence * 100} color={item.confidence < 0.7 ? 'bg-amber-500' : 'bg-emerald-500'} /></div> },
  { header: 'Feedback', render: (item) => item.feedback },
  { header: 'Trạng thái', render: (item) => <StatusPill status={item.status} /> },
];

export const AdminAiReviewPage: React.FC = () => (
  <div className="space-y-6">
    <AdminPageHeader
      title="Kiểm duyệt AI"
      description="Mock data cho các lượt phân loại cần kiểm duyệt, đặc biệt ảnh confidence thấp hoặc người dùng phản hồi sai nhãn."
      action={<button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Bot className="h-4 w-4" />Duyệt mẫu</button>}
    />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <AdminStatCard label="Ảnh hôm nay" value="1,248" change="+9%" tone="blue" />
      <AdminStatCard label="Confidence thấp" value="39" change="<70%" tone="amber" />
      <AdminStatCard label="Sai nhãn" value="11" change="feedback" tone="rose" />
      <AdminStatCard label="Đã duyệt" value="982" change="78.7%" tone="emerald" />
    </div>
    <AdminToolbar placeholder="Tìm ảnh, nhãn AI, feedback..." />
    <DataTable data={aiReviews} columns={columns} />
  </div>
);
