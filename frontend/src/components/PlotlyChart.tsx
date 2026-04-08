"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface PlotlyChartProps {
  data: Record<string, unknown>[];
  layout: Record<string, unknown>;
}

export default function PlotlyChart({ data, layout }: PlotlyChartProps) {
  return (
    <div className="retro-panel !p-2">
      <Plot
        data={data as Plotly.Data[]}
        layout={
          {
            ...layout,
            autosize: true,
            margin: { t: 40, r: 20, b: 40, l: 60 },
            paper_bgcolor: "#16213e",
            plot_bgcolor: "#1a1a2e",
            font: {
              family: "'Press Start 2P', monospace",
              size: 8,
              color: "#eaeaea",
            },
            xaxis: {
              ...(layout.xaxis || {}),
              gridcolor: "#0f3460",
              zerolinecolor: "#0f3460",
            },
            yaxis: {
              ...(layout.yaxis || {}),
              gridcolor: "#0f3460",
              zerolinecolor: "#0f3460",
            },
            colorway: [
              "#e94560",
              "#53c0f0",
              "#4ade80",
              "#fbbf24",
              "#a78bfa",
              "#fb923c",
            ],
          } as Plotly.Layout
        }
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
        useResizeHandler
        style={{ width: "100%", height: "350px" }}
      />
    </div>
  );
}
