import React, { useState, useRef } from 'react';
import {
  Sparkles, Plus, Trash2, Check, X, Eye, Upload, ChevronDown,
  Loader2, AlertTriangle, CheckCircle2, Clock, FileText, Users,
  Calendar, Award, BookOpen, BarChart2, RefreshCcw, Filter, Search,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, StatusPill } from '../../shared/admin-ui';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminQuizQuestions, useAdminQuizStats, useUpdateQuizQuestionStatus,
  useDeleteQuizQuestion, useBulkUpdateQuizStatus,
  useAdminQuizAttempts, useAdminQuizAttemptDetail,
  useAdminQuizSnapshots, useAdminQuizSnapshotDetail,
  useAdminQuizCoverage, useImportQuizQuestions,
} from '../services/queries';
import { AdminQuizQuestionDrawer } from '../components/AdminQuizQuestionDrawer';
import { GenerateQuizModal } from '../components/GenerateQuizModal';
import type {
  QuizQuestion, QuizQuestionStatus, QuizAttempt, QuizSnapshot,
} from '../services/types';
import { DIFFICULTY_BADGE } from '../services/types';

// ─── shared helpers ───────────────────────────────────────────

type TabId = 'bank' | 'pending' | 'snapshots' | 'attempts' | 'import';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'bank', label: 'Ngân hàng câu hỏi', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'pending', label: 'Chờ duyệt', icon: <Clock className="h-4 w-4" /> },
  { id: 'snapshots', label: 'Daily Snapshot', icon: <Calendar className="h-4 w-4" /> },
  { id: 'attempts', label: 'Lượt làm quiz', icon: <Users className="h-4 w-4" /> },
  { id: 'import', label: 'Import file', icon: <Upload className="h-4 w-4" /> },
];

const SOURCE_BADGE: Record<string, string> = {
  AI: 'bg-purple-100 text-purple-700',
  IMPORT: 'bg-blue-100 text-blue-700',
  MANUAL: 'bg-slate-100 text-slate-600',
  SEED: 'bg-teal-100 text-teal-700',
  FALLBACK: 'bg-rose-100 text-rose-600',
};

const COVERAGE_COLOR = (status: string) =>
  status === 'good' ? 'bg-emerald-500' : status === 'low' ? 'bg-amber-500' : 'bg-rose-500';

function FilterInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}

function SelectFilter({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full py-2 pl-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-slate-400 appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
      <FileText className="h-10 w-10 text-slate-200" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── TAB 1 & 2: Question Bank (shared for bank + pending) ─────

function QuestionBankTab({ statusFilter }: { statusFilter?: QuizQuestionStatus }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<string>(statusFilter ?? '');
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  const { data: questionsData, isLoading } = useAdminQuizQuestions({
    page, limit: 15, search: search || undefined, topic: topic || undefined,
    difficulty: (difficulty as any) || undefined,
    status: (status as QuizQuestionStatus) || undefined,
    source: (source as any) || undefined,
  });

  const { mutate: updateStatus } = useUpdateQuizQuestionStatus();
  const { mutateAsync: deleteAsync } = useDeleteQuizQuestion();
  const { mutateAsync: bulkUpdateAsync, isPending: isBulkPending } = useBulkUpdateQuizStatus();

  const handleQuickStatus = (id: string, s: QuizQuestionStatus) => updateStatus({ id, dto: { status: s } });

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRowKeys.length === 0) return;
    if (bulkAction === 'delete') {
      if (!window.confirm(`Xóa ${selectedRowKeys.length} câu hỏi?`)) return;
      await Promise.all(selectedRowKeys.map(id => deleteAsync(String(id))));
    } else {
      await bulkUpdateAsync({ ids: selectedRowKeys.map(String), status: bulkAction as QuizQuestionStatus });
    }
    setSelectedRowKeys([]);
    setBulkAction('');
  };

  const columns: ColumnDef<QuizQuestion>[] = [
    {
      header: 'Chủ đề / Nguồn',
      render: q => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-slate-800 text-xs">{q.topic}</span>
          <span className={`inline-flex w-fit px-1.5 py-0.5 rounded text-[10px] font-bold ${SOURCE_BADGE[q.source] ?? 'bg-slate-100 text-slate-500'}`}>
            {q.source}
          </span>
        </div>
      ),
    },
    {
      header: 'Câu hỏi',
      render: q => (
        <button
          onClick={() => setSelectedQuestion(q)}
          className="text-left text-sm text-slate-800 line-clamp-2 hover:text-emerald-600 hover:underline transition-colors"
        >
          {q.content}
        </button>
      ),
    },
    {
      header: 'Khó',
      render: q => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${DIFFICULTY_BADGE[q.difficulty] ?? 'bg-slate-100 text-slate-600'}`}>
          {q.difficulty}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      render: q => <StatusPill status={q.status} />,
    },
    {
      header: 'Thao tác',
      render: q => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => setSelectedQuestion(q)} title="Sửa" className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
            <Eye className="h-3.5 w-3.5" />
          </button>
          {q.status === 'PENDING_REVIEW' && (
            <>
              <button onClick={() => handleQuickStatus(q.id, 'ACTIVE')} title="Duyệt" className="p-1 rounded hover:bg-emerald-50 text-emerald-600 transition-colors">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleQuickStatus(q.id, 'REJECTED')} title="Từ chối" className="p-1 rounded hover:bg-rose-50 text-rose-500 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {q.status === 'ACTIVE' && (
            <button onClick={() => handleQuickStatus(q.id, 'INACTIVE')} title="Tắt" className="p-1 rounded hover:bg-amber-50 text-amber-500 transition-colors">
              <AlertTriangle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[180px]">
          <FilterInput placeholder="Tìm nội dung câu hỏi..." value={search} onChange={v => { setSearch(v); setPage(1); }} />
        </div>
        <div className="w-32">
          <FilterInput placeholder="Chủ đề" value={topic} onChange={v => { setTopic(v); setPage(1); }} />
        </div>
        <div className="w-32">
          <SelectFilter value={difficulty} onChange={v => { setDifficulty(v); setPage(1); }} placeholder="Độ khó" options={[
            { value: 'easy', label: 'Dễ' }, { value: 'medium', label: 'TB' }, { value: 'hard', label: 'Khó' }, { value: 'mixed', label: 'Hỗn hợp' },
          ]} />
        </div>
        {!statusFilter && (
          <div className="w-36">
            <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} placeholder="Trạng thái" options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'REJECTED', label: 'Từ chối' },
            ]} />
          </div>
        )}
        <div className="w-28">
          <SelectFilter value={source} onChange={v => { setSource(v); setPage(1); }} placeholder="Nguồn" options={[
            { value: 'AI', label: 'AI' }, { value: 'MANUAL', label: 'Thủ công' },
            { value: 'IMPORT', label: 'Import' },
          ]} />
        </div>
        {!statusFilter && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" /> Sinh AI
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Tạo
            </button>
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedRowKeys.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 text-white text-sm">
          <span className="font-semibold">Đã chọn {selectedRowKeys.length}</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => { setBulkAction('ACTIVE'); handleBulkAction(); }} disabled={isBulkPending}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold transition-colors disabled:opacity-50">
              <Check className="h-3 w-3" /> Duyệt
            </button>
            <button onClick={() => { setBulkAction('REJECTED'); handleBulkAction(); }} disabled={isBulkPending}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold transition-colors disabled:opacity-50">
              <X className="h-3 w-3" /> Từ chối
            </button>
            <button onClick={() => { setBulkAction('INACTIVE'); handleBulkAction(); }} disabled={isBulkPending}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-xs font-bold transition-colors disabled:opacity-50">
              <AlertTriangle className="h-3 w-3" /> Inactive
            </button>
            <button onClick={() => { setBulkAction('delete'); handleBulkAction(); }} disabled={isBulkPending}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-xs font-bold transition-colors disabled:opacity-50">
              <Trash2 className="h-3 w-3" /> Xóa
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
      ) : questionsData?.data.length === 0 ? (
        <EmptyState message="Không có câu hỏi nào phù hợp" />
      ) : (
        <DataTable
          data={questionsData?.data ?? []}
          columns={columns}
          enableRowSelection
          selectedRowKeys={selectedRowKeys}
          onRowSelectionChange={setSelectedRowKeys}
          pagination={{
            currentPage: questionsData?.meta.page ?? 1,
            totalPages: questionsData?.meta.totalPages ?? 1,
            onPageChange: setPage,
          }}
        />
      )}

      {selectedQuestion && <AdminQuizQuestionDrawer question={selectedQuestion} onClose={() => setSelectedQuestion(null)} />}
      {isGenerateModalOpen && <GenerateQuizModal onClose={() => setIsGenerateModalOpen(false)} />}
    </div>
  );
}

// ─── TAB 3: Daily Snapshot ────────────────────────────────────

function SnapshotsTab() {
  const [page, setPage] = useState(1);
  const [date, setDate] = useState('');
  const [topicId, setTopicId] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useAdminQuizSnapshots({ page, limit: 15, date: date || undefined, topicId: topicId || undefined });
  const { data: detail, isLoading: isDetailLoading } = useAdminQuizSnapshotDetail(selectedId);

  const columns: ColumnDef<QuizSnapshot>[] = [
    { header: 'Ngày', render: s => <span className="font-mono text-sm text-slate-700">{s.quizDate}</span> },
    { header: 'Chủ đề', render: s => <span className="text-sm font-semibold text-slate-800">{s.topicId}</span> },
    {
      header: 'Độ khó', render: s => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${DIFFICULTY_BADGE[s.difficulty] ?? 'bg-slate-100 text-slate-600'}`}>
          {s.difficulty}
        </span>
      ),
    },
    {
      header: 'Câu / Lượt chơi',
      render: s => (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className={`font-bold ${s.questionCount < 5 ? 'text-rose-600' : 'text-emerald-600'}`}>{s.questionCount} câu</span>
          <span className="text-slate-400">·</span>
          <span>{s.attemptsCount} lượt</span>
        </div>
      ),
    },
    {
      header: '',
      render: s => (
        <button onClick={() => setSelectedId(s.id)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors">
          <Eye className="h-3 w-3" /> Xem
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1); }}
          className="py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-slate-400" />
        <div className="w-40">
          <FilterInput placeholder="Lọc chủ đề" value={topicId} onChange={v => { setTopicId(v); setPage(1); }} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
      ) : data?.data.length === 0 ? (
        <EmptyState message="Chưa có Daily Snapshot nào" />
      ) : (
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          pagination={{ currentPage: data?.meta.page ?? 1, totalPages: data?.meta.totalPages ?? 1, onPageChange: setPage }}
        />
      )}

      {/* Snapshot detail drawer */}
      {selectedId && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Chi tiết Snapshot</h2>
                {detail && <p className="text-xs text-slate-500 mt-0.5">{detail.quizDate} · {detail.topicId}</p>}
              </div>
              <button onClick={() => setSelectedId(null)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {isDetailLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
              ) : !detail ? null : (
                <div className="space-y-4">
                  <div className="flex gap-4 text-sm">
                    <div className="bg-slate-50 rounded-xl p-3 flex-1 text-center">
                      <p className="text-2xl font-bold text-slate-900">{detail.questionCount}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Câu hỏi</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 flex-1 text-center">
                      <p className="text-2xl font-bold text-slate-900">{detail.attemptsCount}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Lượt chơi</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {detail.questions?.map((sq, i) => (
                      <div key={i} className="border border-slate-100 rounded-xl p-4 bg-white">
                        <p className="text-xs font-bold text-slate-400 mb-1.5">CÂU {i + 1}</p>
                        {sq.question ? (
                          <>
                            <p className="text-sm font-semibold text-slate-800 mb-2">{sq.question.content}</p>
                            <div className="space-y-1">
                              {sq.question.options?.map((o, oi) => (
                                <div key={oi} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${o.isCorrect ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}>
                                  {o.isCorrect && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                                  <span>{String.fromCharCode(65 + oi)}. {o.content}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : <p className="text-sm text-rose-500 italic">Câu hỏi đã bị xóa</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── TAB 4: Attempts ─────────────────────────────────────────

function AttemptsTab() {
  const [page, setPage] = useState(1);
  const [topicId, setTopicId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [rewarded, setRewarded] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useAdminQuizAttempts({
    page, limit: 15, topicId: topicId || undefined, userSearch: userSearch || undefined,
    dateFrom: dateFrom || undefined, dateTo: dateTo || undefined,
    rewarded: rewarded === '' ? undefined : rewarded === 'true',
  });
  const { data: detail, isLoading: isDetailLoading } = useAdminQuizAttemptDetail(selectedId);

  const columns: ColumnDef<QuizAttempt>[] = [
    {
      header: 'Người dùng',
      render: a => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 text-xs">{a.userName ?? '—'}</span>
          <span className="text-[11px] text-slate-500">{a.userEmail ?? a.userId.slice(0, 8)}</span>
        </div>
      ),
    },
    { header: 'Ngày', render: a => <span className="font-mono text-xs text-slate-600">{a.quizDate}</span> },
    { header: 'Chủ đề', render: a => <span className="text-xs text-slate-700">{a.topic}</span> },
    {
      header: 'Điểm',
      render: a => (
        <span className="font-bold text-sm text-slate-800">{a.score}<span className="font-normal text-slate-400 text-xs">/{a.totalQuestions}</span></span>
      ),
    },
    {
      header: 'Thưởng',
      render: a => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-emerald-600 text-xs">+{a.pointsEarned} pts</span>
          <StatusPill status={a.isRewarded ? 'ACTIVE' : 'INACTIVE'} label={a.isRewarded ? 'Đã thưởng' : 'Chưa'} />
        </div>
      ),
    },
    {
      header: '',
      render: a => (
        <button onClick={() => setSelectedId(a.id)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors">
          <Eye className="h-3 w-3" /> Chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="w-44"><FilterInput placeholder="Email / Tên user" value={userSearch} onChange={v => { setUserSearch(v); setPage(1); }} /></div>
        <div className="w-36"><FilterInput placeholder="Lọc chủ đề" value={topicId} onChange={v => { setTopicId(v); setPage(1); }} /></div>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
          className="py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-slate-400" placeholder="Từ ngày" />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
          className="py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-slate-400" placeholder="Đến ngày" />
        <div className="w-32">
          <SelectFilter value={rewarded} onChange={v => { setRewarded(v); setPage(1); }} placeholder="Thưởng" options={[
            { value: 'true', label: 'Đã thưởng' }, { value: 'false', label: 'Chưa thưởng' },
          ]} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
      ) : data?.data.length === 0 ? (
        <EmptyState message="Chưa có lượt làm quiz nào" />
      ) : (
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          pagination={{ currentPage: data?.meta.page ?? 1, totalPages: data?.meta.totalPages ?? 1, onPageChange: setPage }}
        />
      )}

      {/* Attempt detail drawer */}
      {selectedId && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Chi tiết lượt làm</h2>
                {detail && <p className="text-xs text-slate-500 mt-0.5">{detail.userEmail} · {detail.quizDate}</p>}
              </div>
              <button onClick={() => setSelectedId(null)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isDetailLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
              ) : !detail ? null : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Điểm số', value: `${detail.score}/${detail.totalQuestions}` },
                      { label: 'Points nhận', value: `+${detail.pointsEarned}` },
                      { label: 'Chủ đề', value: detail.topic },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-base font-bold text-slate-900">{s.value}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {detail.answers?.map((a, i) => {
                      const snap = a.questionSnapshot;
                      return (
                        <div key={a.id} className={`border rounded-xl p-4 ${a.isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                          <div className="flex items-start gap-2 mb-2">
                            {a.isCorrect
                              ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                              : <X className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />}
                            <p className="text-sm font-semibold text-slate-800">{snap?.question ?? `Câu ${i + 1}`}</p>
                          </div>
                          {snap?.options && (
                            <div className="space-y-1 mb-2">
                              {snap.options.map((o, oi) => (
                                <div key={oi} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${oi === a.correctOptionIndex ? 'bg-emerald-100 text-emerald-700 font-bold' : oi === a.selectedOptionIndex && !a.isCorrect ? 'bg-rose-100 text-rose-600' : 'text-slate-600'}`}>
                                  {String.fromCharCode(65 + oi)}. {o}
                                </div>
                              ))}
                            </div>
                          )}
                          {a.explanation && (
                            <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-2 mt-2">{a.explanation}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── TAB 5: Import File ───────────────────────────────────────

function ImportTab() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ totalRows: number; created: number; skipped: number; errors: any[] } | null>(null);
  const { mutateAsync: importAsync, isPending } = useImportQuizQuestions();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importAsync(file);
      setResult(res);
    } catch (err: any) {
      alert('Lỗi import: ' + (err?.response?.data?.message ?? err.message));
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Định dạng file CSV/XLSX</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="text-[11px] text-slate-600 font-mono w-full">
            <thead className="bg-slate-100">
              <tr>{['topic', 'difficulty', 'content', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'explanation'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-bold text-slate-700">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                {['recycling', 'easy', 'Câu hỏi mẫu?', 'A', 'B', 'C', 'D', 'A hoặc 0', 'Giải thích'].map((v, i) => (
                  <td key={i} className="px-3 py-1.5 text-slate-500">{v}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          <strong>correctAnswer</strong>: Chấp nhận A/B/C/D hoặc 0/1/2/3 (index). Câu hỏi trùng sẽ bị bỏ qua. Tất cả câu import sẽ ở trạng thái <span className="font-bold text-amber-600">PENDING_REVIEW</span> để chờ duyệt.
        </p>
      </div>

      <div
        className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-slate-400" />
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Kéo thả hoặc click để chọn file</p>
          <p className="text-xs text-slate-500 mt-1">Hỗ trợ .xlsx, .csv</p>
        </div>
        {isPending && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
      </div>
      <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFile} />

      {result && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Kết quả Import
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tổng dòng', value: result.totalRows, color: 'text-slate-800' },
              { label: 'Đã tạo', value: result.created, color: 'text-emerald-600' },
              { label: 'Bỏ qua', value: result.skipped, color: 'text-rose-500' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
          {result.errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wide">Lỗi chi tiết</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex gap-2 text-xs text-slate-600 bg-rose-50 px-3 py-1.5 rounded-lg">
                    <span className="font-mono text-rose-500">Dòng {e.row}</span>
                    <span>{e.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Coverage Panel ───────────────────────────────────────────

function CoveragePanel() {
  const { data: coverage, isLoading } = useAdminQuizCoverage();

  if (isLoading) return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-center h-24">
      <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
    </div>
  );

  if (!coverage?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-800">Độ phủ câu hỏi theo chủ đề</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />≥20 tốt</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />5-19 thấp</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />&lt;5 thiếu</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {coverage.map(c => (
          <div key={c.topic} className="rounded-xl border border-slate-100 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[80%]">{c.topic}</span>
              <span className={`text-xs font-bold ${c.status === 'good' ? 'text-emerald-600' : c.status === 'low' ? 'text-amber-600' : 'text-rose-600'}`}>
                {c.active}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${COVERAGE_COLOR(c.status)} transition-all`}
                style={{ width: `${Math.min(100, (c.active / 20) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>{c.pending} chờ</span>
              <span>/{c.total} tổng</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export const AdminQuizPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('bank');
  const queryClient = useQueryClient();
  const { data: statsData, isLoading: isLoadingStats, isFetching: isFetchingStats } = useAdminQuizStats();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-quiz-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-quiz-attempts'] });
    queryClient.invalidateQueries({ queryKey: ['admin-quiz-snapshots'] });
    queryClient.invalidateQueries({ queryKey: ['admin-quiz-coverage'] });
    queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quiz & Học tập"
        description="Quản lý ngân hàng câu hỏi, theo dõi tiến độ người dùng và kiểm soát nội dung học tập hằng ngày."
        action={
          <button
            onClick={handleRefresh}
            disabled={isFetchingStats}
            title="Làm mới dữ liệu"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${isFetchingStats ? 'animate-spin' : ''}`} />
            {isFetchingStats ? 'Đang tải...' : 'Làm mới'}
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {isLoadingStats ? (
          <div className="col-span-4 flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
        ) : (
          <>
            <AdminStatCard label="Tổng câu hỏi" value={statsData?.totalQuestions ?? 0} tone="slate" />
            <AdminStatCard label="Active" value={statsData?.activeQuestions ?? 0} tone="blue" />
            <AdminStatCard label="Chờ duyệt" value={statsData?.pendingReviewQuestions ?? 0} tone="amber" />
            <AdminStatCard label="Lượt chơi hôm nay" value={statsData?.attemptsToday ?? 0} tone="emerald" />
          </>
        )}
      </div>

      {/* Coverage panel */}
      <CoveragePanel />

      {/* Tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                ? 'border-slate-900 text-slate-900 bg-slate-50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'pending' && (statsData?.pendingReviewQuestions ?? 0) > 0 && (
                <span className="ml-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold px-1">
                  {statsData?.pendingReviewQuestions}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === 'bank' && <QuestionBankTab />}
          {activeTab === 'pending' && <QuestionBankTab statusFilter="PENDING_REVIEW" />}
          {activeTab === 'snapshots' && <SnapshotsTab />}
          {activeTab === 'attempts' && <AttemptsTab />}
          {activeTab === 'import' && <ImportTab />}
        </div>
      </div>
    </div>
  );
};
