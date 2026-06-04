import React from 'react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

export interface ColumnDef<T> {
  header: React.ReactNode;
  render: (item: T, index: number) => React.ReactNode;
  className?: string; // used for custom alignments or widths
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor?: (item: T, index: number) => string | number;
  
  isLoading?: boolean;
  loadingMessage?: string;
  loadingMinHeight?: string;

  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  emptyClassName?: string;
  
  tableClassName?: string; // applies to the <table> element
  containerClassName?: string; // applies to the outermost wrapper
  
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
  };

  enableRowSelection?: boolean;
  selectedRowKeys?: (string | number)[];
  onRowSelectionChange?: (keys: (string | number)[]) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  loadingMessage = 'Đang tải...',
  loadingMinHeight = 'py-16',
  emptyIcon,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription,
  emptyAction,
  emptyClassName = 'py-16',
  tableClassName = '',
  containerClassName = 'bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm',
  pagination,
  enableRowSelection = false,
  selectedRowKeys = [],
  onRowSelectionChange,
}: DataTableProps<T>) {
  return (
    <div className={containerClassName}>
      {isLoading ? (
        <LoadingState message={loadingMessage} className={loadingMinHeight} size="lg" />
      ) : data.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          className={emptyClassName}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className={`w-full text-sm text-left ${tableClassName}`}>
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-100 font-bold tracking-wide">
              <tr>
                {enableRowSelection && (
                  <th className="px-4 py-3 w-12 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4"
                      checked={data.length > 0 && selectedRowKeys.length === data.length}
                      onChange={(e) => {
                        if (!onRowSelectionChange) return;
                        if (e.target.checked) {
                          const allKeys = data.map((item, idx) => {
                            if (keyExtractor) return keyExtractor(item, idx);
                            if (item && typeof item === 'object' && 'id' in item) return (item as any).id;
                            return idx;
                          });
                          onRowSelectionChange(allKeys);
                        } else {
                          onRowSelectionChange([]);
                        }
                      }}
                    />
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-4 py-3 ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.map((item, idx) => {
                // Determine the row key
                let rowKey: string | number;
                if (keyExtractor) {
                  rowKey = keyExtractor(item, idx);
                } else if (item && typeof item === 'object' && 'id' in item) {
                  rowKey = (item as any).id;
                } else {
                  rowKey = idx;
                }

                return (
                  <tr key={rowKey} className="hover:bg-slate-50/50 transition-colors">
                    {enableRowSelection && (
                      <td className="px-4 py-3 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4"
                          checked={selectedRowKeys.includes(rowKey)}
                          onChange={(e) => {
                            if (!onRowSelectionChange) return;
                            if (e.target.checked) {
                              onRowSelectionChange([...selectedRowKeys, rowKey]);
                            } else {
                              onRowSelectionChange(selectedRowKeys.filter(k => k !== rowKey));
                            }
                          }}
                        />
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-4 py-3 ${col.className || ''}`}>
                        {col.render(item, idx)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && data.length > 0 && pagination && pagination.totalPages > 1 && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex justify-end">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            siblingCount={pagination.siblingCount}
          />
        </div>
      )}
    </div>
  );
}
