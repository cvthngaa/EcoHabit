import React from 'react';

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
};

export const AdminPlaceholderPage: React.FC<AdminPlaceholderPageProps> = ({
  title,
  description,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-700">Trang quản trị đang được dựng khung</p>
        <p className="mt-1 text-sm text-slate-500">
          Module này đã có route và vị trí thư mục riêng để nối API, bảng dữ liệu và form quản lý.
        </p>
      </div>
    </div>
  );
};
