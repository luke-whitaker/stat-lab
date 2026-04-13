"use client";

import { useState } from "react";

const PAGE_SIZE = 50;

interface DataTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

export default function DataTable({ columns, rows, totalRows }: DataTableProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  if (columns.length === 0) {
    return (
      <div className="retro-panel text-center">
        <p style={{ color: "var(--retro-text-dim)" }}>
          Select at least one column to view data.
        </p>
      </div>
    );
  }

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
            {pageRows.map((row, i) => (
              <tr key={start + i}>
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

      {/* Pagination controls */}
      <div className="mt-2 flex items-center justify-between">
        <p style={{ color: "var(--retro-text-dim)", fontSize: "9px" }}>
          Rows {start + 1}–{Math.min(start + PAGE_SIZE, rows.length)} of {totalRows}
        </p>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="retro-btn-alt"
              style={{ fontSize: "8px", padding: "4px 10px", opacity: page === 0 ? 0.35 : 1 }}
            >
              Prev
            </button>
            <span style={{ color: "var(--retro-text-dim)", fontSize: "9px", lineHeight: "24px" }}>
              {page + 1}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="retro-btn-alt"
              style={{ fontSize: "8px", padding: "4px 10px", opacity: page >= totalPages - 1 ? 0.35 : 1 }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
