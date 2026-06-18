import React, { useState } from 'react';
import {
  History, Search, Calendar, User, CheckCircle2,
  XCircle, Clock, ArrowUpRight, BarChart3,
  RefreshCw, FileText
} from 'lucide-react';
import { useGetTransactions } from '../services/use-get-transactions';
import {
  WASTE_LABEL,
  TX_STATUS_LABEL,
  TX_STATUS_COLOR,
} from '../../../../shared/domain';
import type { WasteType } from '../../../../shared/domain';
import { Badge } from '../../../../shared/components/Badge';
import { DataTable } from '../../../../shared/components/DataTable';

// ─── Main Component ───────────────────────────────────────────────────────────

export const TransactionsHistory: React.FC = () => {
  const { data: transactions = [], isLoading, refetch } = useGetTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');

  // Statistics calculation
  const totalCount = transactions.length;
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const verifiedCount = transactions.filter(t => t.status === 'VERIFIED').length;
  const rejectedCount = transactions.filter(t => t.status === 'REJECTED').length;

  const totalPointsAwarded = transactions
    .filter(t => t.status === 'VERIFIED')
    .reduce((sum, t) => sum + (t.pointsAwarded || 0), 0);

  // Approximate total weight (KG) - simplified
  const totalWeight = transactions
    .filter(t => t.status === 'VERIFIED')
    .reduce((sum, t) => {
      let weight = t.quantityValue || 0;
      if (t.quantityUnit === 'GRAM') {
        weight = weight / 1000;
      }
      return sum + weight;
    }, 0);

  // Filter & Search Logic
  const filteredTransactions = transactions
    .filter((tx) => {
      // Tab filter
      if (activeTab === 'PENDING') return tx.status === 'PENDING';
      if (activeTab === 'VERIFIED') return tx.status === 'VERIFIED';
      if (activeTab === 'REJECTED') return tx.status === 'REJECTED';
      return true;
    })
    .filter((tx) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const userName = tx.user?.fullName || tx.user?.displayName || '';
      const userEmail = tx.user?.email || '';
      const locationName = tx.location?.name || '';
      const wasteLabel = tx.acceptedWasteType?.wasteType ? WASTE_LABEL[tx.acceptedWasteType.wasteType as WasteType] : '';

      return (
        userName.toLowerCase().includes(searchLower) ||
        userEmail.toLowerCase().includes(searchLower) ||
        locationName.toLowerCase().includes(searchLower) ||
        wasteLabel.toLowerCase().includes(searchLower)
      );
    })
    // Sort descending by date
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lịch sử thu gom rác thải</h1>
          <p className="text-slate-500 text-sm mt-0.5">Theo dõi lịch sử tiếp nhận rác phân loại và tổng số điểm thưởng đã phát ra</p>
        </div>
        <button
          onClick={() => refetch()}
          title="Tải lại dữ liệu"
          className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer transition-all active:scale-95"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng rác đã thu gom</p>
            <h3 className="text-xl font-extrabold text-slate-950 mt-0.5">{totalWeight.toFixed(1)} KG</h3>
          </div>
        </div> */}

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng điểm thưởng phát ra</p>
            <h3 className="text-xl font-extrabold text-slate-950 mt-0.5">{totalPointsAwarded} Điểm</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng số lượt thu gom</p>
            <h3 className="text-xl font-extrabold text-slate-950 mt-0.5">{totalCount} lượt</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ duyệt thành công</p>
            <h3 className="text-xl font-extrabold text-slate-950 mt-0.5">
              {totalCount > 0 ? ((verifiedCount / totalCount) * 100).toFixed(0) : '0'}%
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and search menu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        {/* <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${activeTab === 'PENDING' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-750'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Chờ duyệt ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${activeTab === 'VERIFIED' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-750'
              }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã duyệt ({verifiedCount})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${activeTab === 'REJECTED' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-750'
              }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Từ chối ({rejectedCount})
          </button>
        </div> */}

        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo khách hàng, điểm thu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
      </div>

      <DataTable
        data={filteredTransactions}
        isLoading={isLoading}
        loadingMessage="Đang tải lịch sử thu gom..."
        emptyIcon={<FileText className="w-8 h-8" />}
        emptyTitle="Không tìm thấy lịch sử giao dịch nào."
        containerClassName="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        columns={[
          {
            header: 'Người gửi',
            render: (tx) => (
              <>
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {tx.user?.fullName || tx.user?.displayName || 'Ẩn danh'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{tx.user?.email || 'N/A'}</div>
              </>
            ),
          },
          {
            header: 'Điểm thu gom',
            render: (tx) => (
              <>
                <div className="text-slate-800 font-medium text-xs">{tx.location?.name || 'N/A'}</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">{tx.location?.address}</div>
              </>
            ),
          },
          // {
          //   header: 'Rác tiếp nhận',
          //   render: (tx) => (
          //     <>
          //       <div className="font-semibold text-slate-950 flex items-center gap-1.5">
          //         <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          //         {tx.acceptedWasteType?.wasteType ? WASTE_LABEL[tx.acceptedWasteType.wasteType as WasteType] : 'Chưa phân loại'}
          //       </div>
          //       <div className="text-xs text-slate-500 mt-0.5">
          //         Lượng: <span className="font-semibold text-slate-700">{tx.quantityValue} {tx.quantityUnit}</span>
          //       </div>
          //     </>
          //   ),
          // },
          {
            header: 'Trạng thái',
            render: (tx) => (
              <div className="text-xs">
                <Badge
                  className={`text-[10px] uppercase py-1 ${TX_STATUS_COLOR[tx.status]}`}
                  label={TX_STATUS_LABEL[tx.status]}
                />
                {tx.status === 'VERIFIED' && (
                  <div className="mt-1.5">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-bold">
                      +{tx.pointsAwarded} điểm
                    </span>
                  </div>
                )}
                {tx.status === 'REJECTED' && (
                  <div className="text-[10px] text-rose-600 italic mt-1.5 max-w-[150px] leading-tight">
                    Lý do: {tx.rejectionReason || 'Không có lý do'}
                  </div>
                )}
              </div>
            ),
          },
          {
            header: 'Thời gian',
            render: (tx) => (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'N/A'}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
