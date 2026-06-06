import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, AdminSection, StatusPill } from '../../shared/admin-ui';
import { SearchFilterBar } from '../../../../shared/components/SearchFilterBar';
import { usePointRules, usePointTransactions, useUpdatePointRule } from '../services/queries';
import type { PointRule, AdminPointTransaction } from '../services/types';

const EVENT_TYPE_LABEL: Record<string, string> = {
  CLASSIFICATION_CORRECT: 'Phân loại AI đúng',
  DROPOFF_CONFIRMED: 'Xác nhận thu gom',
  REDEMPTION: 'Đổi quà',
  MANUAL_ADJUST: 'Điều chỉnh thủ công',
};

const SOURCE_TYPE_LABEL: Record<string, string> = {
  TRASH_CLASSIFICATION: 'Scan AI',
  DROPOFF_TRANSACTION: 'Thu gom rác',
  REDEMPTION: 'Đổi quà',
  ADMIN: 'Admin',
  QUIZ: 'Quiz',
};

export const AdminPointsPage: React.FC = () => {
  const [tab, setTab] = useState<'rules' | 'transactions'>('rules');
  const [rulesSearch, setRulesSearch] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [txPage, setTxPage] = useState(1);

  const { data: rules = [], isLoading: rulesLoading } = usePointRules();
  const { data: txData, isLoading: txLoading } = usePointTransactions({ page: txPage, limit: 20 });
  const { mutate: toggleRule, isPending: isToggling } = useUpdatePointRule();

  const filteredRules = rules.filter((r) =>
    !rulesSearch || r.name.toLowerCase().includes(rulesSearch.toLowerCase()) ||
    r.code.toLowerCase().includes(rulesSearch.toLowerCase()) ||
    EVENT_TYPE_LABEL[r.eventType]?.toLowerCase().includes(rulesSearch.toLowerCase())
  );

  const ruleColumns: ColumnDef<PointRule>[] = [
    {
      header: 'Mã / Tên',
      render: (r) => (
        <div>
          <p className="font-bold text-sm text-slate-800">{r.name}</p>
          <p className="font-mono text-[11px] text-slate-400">{r.code}</p>
        </div>
      ),
    },
    {
      header: 'Sự kiện',
      render: (r) => (
        <span className="text-sm text-slate-600">{EVENT_TYPE_LABEL[r.eventType] ?? r.eventType}</span>
      ),
    },
    {
      header: 'Điểm thưởng',
      render: (r) => (
        <span className="font-bold text-emerald-600">+{r.points.toLocaleString('vi-VN')}</span>
      ),
      className: 'text-right',
    },
    {
      header: 'Trạng thái',
      render: (r) => <StatusPill status={r.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      header: '',
      render: (r) => (
        <button
          onClick={() => toggleRule({ id: r.id, dto: { isActive: !r.isActive } })}
          disabled={isToggling}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors disabled:opacity-50 ${
            r.isActive
              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          {r.isActive ? 'Tắt' : 'Bật'}
        </button>
      ),
    },
  ];

  const txColumns: ColumnDef<AdminPointTransaction>[] = [
    {
      header: 'Người dùng',
      render: (tx) => (
        <div>
          <p className="font-semibold text-sm text-slate-800">{tx.user?.fullName ?? '—'}</p>
          <p className="text-xs text-slate-400">{tx.user?.email}</p>
        </div>
      ),
    },
    {
      header: 'Loại',
      render: (tx) => (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
          tx.type === 'EARN' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {tx.type === 'EARN' ? 'Cộng' : 'Trừ'}
        </span>
      ),
    },
    {
      header: 'Điểm',
      render: (tx) => (
        <span className={`font-bold text-sm ${tx.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString('vi-VN')}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Số dư sau',
      render: (tx) => <span className="text-sm text-slate-600">{tx.balanceAfter.toLocaleString('vi-VN')}</span>,
      className: 'text-right',
    },
    {
      header: 'Nguồn',
      render: (tx) => (
        <span className="text-xs text-slate-500">{tx.sourceType ? SOURCE_TYPE_LABEL[tx.sourceType] ?? tx.sourceType : '—'}</span>
      ),
    },
    {
      header: 'Ngày',
      render: (tx) => (
        <span className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</span>
      ),
    },
  ];

  const activeRules = rules.filter((r) => r.isActive).length;
  const inactiveRules = rules.filter((r) => !r.isActive).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quy tắc điểm"
        description="Cấu hình điểm thưởng theo từng sự kiện và xem lịch sử giao dịch điểm của toàn hệ thống."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
            <Plus className="h-4 w-4" />Tạo quy tắc
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatCard label="Tổng quy tắc" value={rules.length.toString()} change="hiện có" tone="blue" />
        <AdminStatCard label="Đang bật" value={activeRules.toString()} change="đang áp dụng" tone="emerald" />
        <AdminStatCard label="Đang tắt" value={inactiveRules.toString()} change="tạm dừng" tone="amber" />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {(['rules', 'transactions'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === t
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t === 'rules' ? '⚙️ Quy tắc điểm' : '📋 Lịch sử điểm'}
          </button>
        ))}
      </div>

      {tab === 'rules' && (
        <AdminSection title="">
          <SearchFilterBar
            searchPlaceholder="Tìm mã, tên quy tắc..."
            searchValue={rulesSearch}
            onSearchChange={setRulesSearch}
          />
          <div className="mt-4">
            <DataTable
              data={filteredRules}
              columns={ruleColumns}
              isLoading={rulesLoading}
              emptyTitle="Chưa có quy tắc điểm nào"
              emptyDescription="Hãy tạo quy tắc đầu tiên bằng nút bên trên."
            />
          </div>
        </AdminSection>
      )}

      {tab === 'transactions' && (
        <AdminSection title="">
          <SearchFilterBar
            searchPlaceholder="Tìm người dùng..."
            searchValue={txSearch}
            onSearchChange={setTxSearch}
          />
          <div className="mt-4">
            <DataTable
              data={txData?.data ?? []}
              columns={txColumns}
              isLoading={txLoading}
              emptyTitle="Chưa có giao dịch điểm nào"
              pagination={
                txData && txData.meta.totalPages > 1
                  ? {
                      currentPage: txData.meta.page,
                      totalPages: txData.meta.totalPages,
                      onPageChange: (p) => setTxPage(p),
                    }
                  : undefined
              }
            />
          </div>
        </AdminSection>
      )}
    </div>
  );
};
