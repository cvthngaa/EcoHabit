import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
}

export interface SearchFilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterConfig[];
  actions?: React.ReactNode;
  containerClassName?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchPlaceholder = 'Tìm kiếm...',
  searchValue,
  onSearchChange,
  filters = [],
  actions,
  containerClassName = 'bg-white rounded-2xl border border-slate-200 p-4',
}) => {
  return (
    <div className={containerClassName}>
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Filters */}
          {filters.map((filter) => (
            <div key={filter.key} className={`relative ${filter.className || ''}`}>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 appearance-none cursor-pointer"
              >
                {filter.placeholder && <option value="ALL">{filter.placeholder}</option>}
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
