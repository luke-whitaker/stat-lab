"use client";

import { useState } from "react";
import {
  uploadCSV,
  getDescriptiveStats,
  runStatTest,
  getChart,
  type UploadResult,
  type DescriptiveStat,
  type StatTestResult,
  type PlotlyChart,
} from "@/lib/api";
import FileUpload from "@/components/FileUpload";
import DataTable from "@/components/DataTable";
import PlotlyChartComponent from "@/components/PlotlyChart";

type Tab = "data" | "explore" | "analyze";

const TEST_TYPES = [
  { key: "t_test", label: "T-Test", desc: "Compare 2 group means" },
  { key: "anova", label: "ANOVA", desc: "Compare 3+ group means" },
  { key: "chi_square", label: "Chi-Square", desc: "Categorical association" },
  { key: "correlation", label: "Correlation", desc: "Linear relationship" },
];

export default function HomePage() {
  const [dataset, setDataset] = useState<UploadResult | null>(null);
  const [tab, setTab] = useState<Tab>("data");
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());

  // Explore state
  const [stats, setStats] = useState<DescriptiveStat[]>([]);
  const [charts, setCharts] = useState<{ label: string; chart: PlotlyChart }[]>([]);
  const [loadingExplore, setLoadingExplore] = useState(false);

  // Analyze state
  const [selectedTest, setSelectedTest] = useState("t_test");
  const [testColumns, setTestColumns] = useState<string[]>([]);
  const [groupColumn, setGroupColumn] = useState("");
  const [testResult, setTestResult] = useState<StatTestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [runningTest, setRunningTest] = useState(false);

  async function handleUpload(file: File) {
    const result = await uploadCSV(file);
    setDataset(result);
    setSelectedColumns(new Set(Object.keys(result.columns)));
    setStats([]);
    setCharts([]);
    setTestResult(null);
  }

  function toggleColumn(col: string) {
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) {
        next.delete(col);
      } else {
        next.add(col);
      }
      return next;
    });
  }

  function selectAllColumns() {
    if (dataset) {
      setSelectedColumns(new Set(Object.keys(dataset.columns)));
    }
  }

  function deselectAllColumns() {
    setSelectedColumns(new Set());
  }

  async function handleExplore() {
    if (!dataset) return;
    setLoadingExplore(true);

    const activeCols = Array.from(selectedColumns);
    const { stats: descriptive } = await getDescriptiveStats(dataset.all_data, activeCols);
    setStats(descriptive);

    const numericCols = Object.entries(dataset.columns)
      .filter(([col, info]) => info.type === "quantitative" && selectedColumns.has(col))
      .map(([col]) => col);

    const chartResults: { label: string; chart: PlotlyChart }[] = [];

    for (const col of numericCols.slice(0, 4)) {
      const chart = await getChart("histogram", dataset.all_data, { column: col });
      chartResults.push({ label: col, chart });
    }

    if (numericCols.length >= 2) {
      const heatmap = await getChart("correlation-heatmap", dataset.all_data, {
        columns: numericCols,
      });
      chartResults.push({ label: "Correlation", chart: heatmap });
    }

    setCharts(chartResults);
    setLoadingExplore(false);
  }

  async function handleRunTest() {
    if (!dataset) return;
    setRunningTest(true);
    setTestError(null);
    setTestResult(null);

    try {
      const result = await runStatTest(
        dataset.all_data,
        selectedTest,
        testColumns,
        groupColumn || undefined
      );
      setTestResult(result);
    } catch (e) {
      setTestError(e instanceof Error ? e.message : "Test failed");
    } finally {
      setRunningTest(false);
    }
  }

  const numericCols = dataset
    ? Object.entries(dataset.columns)
        .filter(([col, info]) => info.type === "quantitative" && selectedColumns.has(col))
        .map(([col]) => col)
    : [];
  const categoricalCols = dataset
    ? Object.entries(dataset.columns)
        .filter(([col, info]) => info.type === "qualitative" && selectedColumns.has(col))
        .map(([col]) => col)
    : [];

  const needsGroup = selectedTest === "t_test" || selectedTest === "anova";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1
          className="mb-2 text-2xl"
          style={{ color: "var(--retro-highlight)", letterSpacing: "2px" }}
        >
          StatLab
        </h1>
        <p style={{ color: "var(--retro-text-dim)" }}>
          Data Analysis &amp; Visualization
        </p>
      </div>

      {/* Tab nav */}
      <nav className="mb-6 flex justify-center gap-2">
        {(["data", "explore", "analyze"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === "explore" && dataset && selectedColumns.size > 0) {
                handleExplore();
              }
            }}
            className={`retro-btn ${tab === t ? "" : "retro-btn-alt"}`}
            style={{ fontSize: "9px", padding: "8px 16px" }}
          >
            {t === "data" ? "Data" : t === "explore" ? "Explore" : "Analyze"}
          </button>
        ))}
      </nav>

      {/* DATA TAB */}
      {tab === "data" && (
        <div className="space-y-6">
          {!dataset ? (
            <FileUpload onUpload={handleUpload} />
          ) : (
            <>
              <div className="retro-panel flex items-center justify-between">
                <div>
                  <span style={{ color: "var(--retro-blue)" }}>
                    {dataset.filename}
                  </span>
                  <span className="ml-4" style={{ color: "var(--retro-text-dim)" }}>
                    {dataset.row_count} rows &middot;{" "}
                    {Object.keys(dataset.columns).length} cols
                  </span>
                </div>
                <label className="retro-btn retro-btn-alt cursor-pointer" style={{ fontSize: "9px", padding: "6px 12px" }}>
                  New file
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                  />
                </label>
              </div>

              {/* Column types — clickable toggles */}
              <div className="retro-panel">
                <div className="mb-3 flex items-center justify-between">
                  <h2 style={{ color: "var(--retro-blue)" }}>
                    Columns
                    <span
                      className="ml-2"
                      style={{ color: "var(--retro-text-dim)", fontSize: "9px" }}
                    >
                      ({selectedColumns.size}/{Object.keys(dataset.columns).length} selected)
                    </span>
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllColumns}
                      className="retro-btn-alt"
                      style={{ fontSize: "8px", padding: "4px 8px" }}
                    >
                      All
                    </button>
                    <button
                      onClick={deselectAllColumns}
                      className="retro-btn-alt"
                      style={{ fontSize: "8px", padding: "4px 8px" }}
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dataset.columns).map(([col, info]) => {
                    const isSelected = selectedColumns.has(col);
                    return (
                      <button
                        key={col}
                        onClick={() => toggleColumn(col)}
                        className="inline-flex items-center gap-2 rounded px-3 py-1 transition-opacity"
                        style={{
                          background: "var(--retro-bg)",
                          border: `1px solid ${info.type === "quantitative" ? "var(--retro-blue)" : "var(--retro-success)"}`,
                          fontSize: "9px",
                          opacity: isSelected ? 1 : 0.35,
                          cursor: "pointer",
                        }}
                      >
                        <span>{col}</span>
                        <span
                          style={{
                            color:
                              info.type === "quantitative"
                                ? "var(--retro-blue)"
                                : "var(--retro-success)",
                          }}
                        >
                          {info.type === "quantitative" ? "NUM" : "CAT"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data table with pagination */}
              <DataTable
                columns={Object.keys(dataset.columns).filter((c) => selectedColumns.has(c))}
                rows={dataset.all_data}
                totalRows={dataset.row_count}
              />
            </>
          )}
        </div>
      )}

      {/* EXPLORE TAB */}
      {tab === "explore" && (
        <div className="space-y-6">
          {!dataset ? (
            <div className="retro-panel text-center">
              <p style={{ color: "var(--retro-text-dim)" }}>
                Upload data first to explore.
              </p>
            </div>
          ) : loadingExplore ? (
            <div className="retro-panel text-center">
              <p className="cursor-blink" style={{ color: "var(--retro-blue)" }}>
                Analyzing data
              </p>
            </div>
          ) : (
            <>
              {/* Descriptive stats table */}
              {stats.filter((s) => s.mean !== undefined).length > 0 && (
                <div>
                  <h2
                    className="mb-3"
                    style={{ color: "var(--retro-highlight)" }}
                  >
                    Descriptive Stats
                  </h2>
                  <div className="retro-panel overflow-x-auto !p-0">
                    <table className="retro-table">
                      <thead>
                        <tr>
                          {["Column", "N", "Mean", "SD", "Min", "Mdn", "Max"].map(
                            (h) => (
                              <th key={h}>{h}</th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {stats
                          .filter((s) => s.mean !== undefined)
                          .map((s) => (
                            <tr key={s.column}>
                              <td style={{ color: "var(--retro-blue)" }}>
                                {s.column}
                              </td>
                              <td>{s.count}</td>
                              <td>{s.mean}</td>
                              <td>{s.std}</td>
                              <td>{s.min}</td>
                              <td>{s.median}</td>
                              <td>{s.max}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Categorical stats */}
              {stats.filter((s) => s.unique !== undefined).length > 0 && (
                <div>
                  <h2
                    className="mb-3"
                    style={{ color: "var(--retro-highlight)" }}
                  >
                    Categorical Columns
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {stats
                      .filter((s) => s.unique !== undefined)
                      .map((s) => (
                        <div key={s.column} className="retro-panel-alt">
                          <span style={{ color: "var(--retro-blue)" }}>
                            {s.column}
                          </span>
                          <span
                            className="ml-3"
                            style={{ color: "var(--retro-text-dim)" }}
                          >
                            {s.unique} unique &middot; top: {s.top} ({s.freq})
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Charts */}
              {charts.length > 0 && (
                <div>
                  <h2
                    className="mb-3"
                    style={{ color: "var(--retro-highlight)" }}
                  >
                    Visualizations
                  </h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {charts.map(({ label, chart }) => (
                      <PlotlyChartComponent
                        key={label}
                        data={chart.data}
                        layout={chart.layout}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ANALYZE TAB */}
      {tab === "analyze" && (
        <div className="space-y-6">
          {!dataset ? (
            <div className="retro-panel text-center">
              <p style={{ color: "var(--retro-text-dim)" }}>
                Upload data first to run tests.
              </p>
            </div>
          ) : (
            <>
              {/* Test selection */}
              <div>
                <h2
                  className="mb-3"
                  style={{ color: "var(--retro-highlight)" }}
                >
                  Select Test
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TEST_TYPES.map((test) => (
                    <button
                      key={test.key}
                      onClick={() => {
                        setSelectedTest(test.key);
                        setTestColumns([]);
                        setGroupColumn("");
                        setTestResult(null);
                        setTestError(null);
                      }}
                      className={`retro-panel text-left transition-all ${
                        selectedTest === test.key
                          ? "!border-[var(--retro-blue)]"
                          : ""
                      }`}
                    >
                      <span
                        style={{
                          color:
                            selectedTest === test.key
                              ? "var(--retro-blue)"
                              : "var(--retro-text)",
                        }}
                      >
                        {test.label}
                      </span>
                      <p
                        className="mt-1"
                        style={{ color: "var(--retro-text-dim)", fontSize: "9px" }}
                      >
                        {test.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              <div className="retro-panel space-y-4">
                <h2 style={{ color: "var(--retro-blue)" }}>Configure</h2>

                <div>
                  <label
                    className="mb-2 block"
                    style={{ color: "var(--retro-text-dim)" }}
                  >
                    {needsGroup ? "Value Column (numeric)" : "Columns"}
                  </label>
                  <select
                    multiple={!needsGroup}
                    value={testColumns}
                    onChange={(e) => {
                      if (!needsGroup) {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (o) => o.value
                        );
                        setTestColumns(selected.slice(0, 2));
                      } else {
                        setTestColumns([e.target.value]);
                      }
                    }}
                    className="retro-input w-full"
                  >
                    {(selectedTest === "chi_square"
                      ? categoricalCols
                      : numericCols
                    ).map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                {needsGroup && (
                  <div>
                    <label
                      className="mb-2 block"
                      style={{ color: "var(--retro-text-dim)" }}
                    >
                      Group Column (categorical)
                    </label>
                    <select
                      value={groupColumn}
                      onChange={(e) => setGroupColumn(e.target.value)}
                      className="retro-input w-full"
                    >
                      <option value="">Select...</option>
                      {categoricalCols.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handleRunTest}
                  disabled={runningTest || testColumns.length === 0}
                  className="retro-btn"
                >
                  {runningTest ? "Running..." : "Run Test"}
                </button>
              </div>

              {/* Error */}
              {testError && (
                <div className="retro-panel !border-[var(--retro-highlight)]">
                  <p style={{ color: "var(--retro-highlight)" }}>
                    Error: {testError}
                  </p>
                </div>
              )}

              {/* Results */}
              {testResult && (
                <div className="retro-panel">
                  <h2
                    className="mb-4"
                    style={{ color: "var(--retro-blue)" }}
                  >
                    {testResult.test_name}
                  </h2>
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div>
                      <p
                        style={{
                          color: "var(--retro-text-dim)",
                          fontSize: "8px",
                          textTransform: "uppercase",
                        }}
                      >
                        Statistic
                      </p>
                      <p className="text-lg" style={{ color: "var(--retro-text)" }}>
                        {testResult.statistic}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          color: "var(--retro-text-dim)",
                          fontSize: "8px",
                          textTransform: "uppercase",
                        }}
                      >
                        P-Value
                      </p>
                      <p
                        className="text-lg"
                        style={{
                          color:
                            testResult.p_value < 0.05
                              ? "var(--retro-success)"
                              : "var(--retro-warning)",
                        }}
                      >
                        {testResult.p_value}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          color: "var(--retro-text-dim)",
                          fontSize: "8px",
                          textTransform: "uppercase",
                        }}
                      >
                        Result
                      </p>
                      <p
                        className="text-lg"
                        style={{
                          color:
                            testResult.p_value < 0.05
                              ? "var(--retro-success)"
                              : "var(--retro-warning)",
                        }}
                      >
                        {testResult.p_value < 0.05 ? "SIG" : "N.S."}
                      </p>
                    </div>
                  </div>
                  <p style={{ color: "var(--retro-text-dim)", lineHeight: "2" }}>
                    {testResult.interpretation}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
