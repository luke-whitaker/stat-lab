"use client";

interface DataTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

export default function DataTable({ columns, rows, totalRows }: DataTableProps) {
  return (
    <div>
      <div className="retro-panel overflow-x-auto !p-0">
        <table className="retro-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap">
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2" style={{ color: "var(--retro-text-dim)", fontSize: "9px" }}>
        Showing {rows.length} of {totalRows} rows
      </p>
    </div>
  );
}
