import React from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'No hay datos',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-sm font-semibold text-gray-400 text-${col.align || 'left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row[keyField as string] || idx}
              className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`px-4 py-3 text-sm text-gray-200 text-${col.align || 'left'}`}
                >
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
