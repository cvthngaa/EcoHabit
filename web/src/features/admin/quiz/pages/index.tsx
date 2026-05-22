import React from 'react';
import { BarChart3 } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, AdminToolbar, ProgressBar, StatusPill } from '../../shared/admin-ui';
import { quizQuestions } from '../../shared/mock-data';

type QuizRow = (typeof quizQuestions)[number];

const columns: ColumnDef<QuizRow>[] = [
  { header: 'Chủ đề', render: (quiz) => quiz.topic },
  { header: 'Câu hỏi', render: (quiz) => <span className="font-bold text-slate-800">{quiz.question}</span> },
  { header: 'Tỷ lệ đúng', render: (quiz) => <div className="min-w-32"><div className="mb-1 text-xs font-bold text-slate-600">{quiz.correctRate}%</div><ProgressBar value={quiz.correctRate} color="bg-blue-500" /></div> },
  { header: 'Trạng thái', render: (quiz) => <StatusPill status={quiz.status} /> },
];

export const AdminQuizPage: React.FC = () => (
  <div className="space-y-6">
    <AdminPageHeader
      title="Quiz"
      description="Quản lý câu hỏi quiz, chủ đề hằng ngày và tỷ lệ trả lời đúng bằng dữ liệu mẫu."
      action={<button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><BarChart3 className="h-4 w-4" />Tạo câu hỏi</button>}
    />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AdminStatCard label="Câu hỏi" value="320" change="+18" tone="blue" />
      <AdminStatCard label="Lượt chơi/ngày" value="4,280" change="+21%" tone="emerald" />
      <AdminStatCard label="Điểm đã cấp" value="85.6K" change="quiz" tone="amber" />
    </div>
    <AdminToolbar placeholder="Tìm câu hỏi hoặc chủ đề..." />
    <DataTable data={quizQuestions} columns={columns} />
  </div>
);
