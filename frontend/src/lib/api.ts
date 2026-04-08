const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Upload a CSV, get back parsed data
export async function uploadCSV(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/data/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail);
  }
  return res.json();
}

// Get descriptive stats
export async function getDescriptiveStats(
  data: Record<string, unknown>[],
  columns?: string[]
): Promise<{ stats: DescriptiveStat[] }> {
  const res = await fetch(`${API_BASE}/analysis/descriptive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, columns }),
  });
  return res.json();
}

// Run a statistical test
export async function runStatTest(
  data: Record<string, unknown>[],
  testType: string,
  columns: string[],
  groupColumn?: string
): Promise<StatTestResult> {
  const res = await fetch(`${API_BASE}/analysis/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data,
      test_type: testType,
      columns,
      group_column: groupColumn,
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Test failed" }));
    throw new Error(error.detail);
  }
  return res.json();
}

// Get a chart
export async function getChart(
  type: "histogram" | "box-plot" | "scatter" | "bar-chart" | "correlation-heatmap",
  data: Record<string, unknown>[],
  options: {
    column?: string;
    x_column?: string;
    y_column?: string;
    group_column?: string;
    columns?: string[];
  }
): Promise<PlotlyChart> {
  const res = await fetch(`${API_BASE}/visualizations/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, ...options }),
  });
  return res.json();
}

// Types
export interface UploadResult {
  filename: string;
  row_count: number;
  columns: Record<
    string,
    { dtype: string; type: string; null_count: number }
  >;
  preview: Record<string, unknown>[];
  all_data: Record<string, unknown>[];
}

export interface DescriptiveStat {
  column: string;
  count: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  median?: number;
  q25?: number;
  q75?: number;
  unique?: number;
  top?: string;
  freq?: number;
}

export interface StatTestResult {
  test_type: string;
  test_name: string;
  statistic: number;
  p_value: number;
  interpretation: string;
  details: Record<string, unknown> | null;
}

export interface PlotlyChart {
  data: Record<string, unknown>[];
  layout: Record<string, unknown>;
}
