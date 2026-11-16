import React, { useState } from 'react';
import type { DailyChartPoint } from '../../types/index.ts';
import { formatKes } from '../../utils/format.ts';

interface ProductionSalesChartProps {
  data: DailyChartPoint[];
}

export function ProductionSalesChart({ data }: ProductionSalesChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[#6D5649]">
        No 30-day data available yet.
      </div>
    );
  }

  const width = 820;
  const height = 270;
  const padLeft = 52;
  const padRight = 56;
  const padTop = 20;
  const padBottom = 38;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxLitres = Math.max(100, ...data.map((d) => d.milkLitres)) * 1.15;
  const maxSales = Math.max(2000, ...data.map((d) => d.salesKes)) * 1.15;

  const barStep = chartW / data.length;
  const barWidth = Math.max(6, barStep * 0.52);

  const linePoints = data
    .map((d, idx) => {
      const x = padLeft + idx * barStep + barStep / 2;
      const y = padTop + chartH - (d.milkLitres / maxLitres) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const activePoint = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5 text-xs font-medium text-[#4E3B31]">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#2E7D32] inline-block" aria-hidden="true" />
            Milk Collected (Litres)
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#D4A373]/75 inline-block" aria-hidden="true" />
            Shop Sales (KES)
          </span>
        </div>

        <div className="text-xs font-mono tabular-nums text-[#2C1E16] min-h-[18px]">
          {activePoint ? (
            <span>
              {activePoint.label}: <strong>{activePoint.milkLitres.toFixed(1)} L</strong> ·{' '}
              <strong>{formatKes(activePoint.salesKes)}</strong>
            </span>
          ) : (
            <span className="text-[#6D5649]">Hover a day to inspect figures</span>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[600px] h-auto select-none"
          role="img"
          aria-label="30-day milk production versus shop sales chart"
        >
          {/* Horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = padTop + chartH - frac * chartH;
            const litreTick = Math.round(maxLitres * frac);
            const salesTick = Math.round(maxSales * frac);
            return (
              <g key={frac}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#EFE8D5"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#6D5649] text-[10px] font-mono"
                >
                  {litreTick}L
                </text>
                <text
                  x={width - padRight + 8}
                  y={y + 3}
                  textAnchor="start"
                  className="fill-[#8D6E63] text-[10px] font-mono"
                >
                  {salesTick >= 1000 ? `${(salesTick / 1000).toFixed(1)}k` : salesTick}
                </text>
              </g>
            );
          })}

          {/* Sales Bars */}
          {data.map((d, idx) => {
            const barH = (d.salesKes / maxSales) * chartH;
            const x = padLeft + idx * barStep + (barStep - barWidth) / 2;
            const y = padTop + chartH - barH;
            const isHovered = hoverIdx === idx;

            return (
              <g key={d.date}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(1, barH)}
                  rx={2}
                  fill={isHovered ? '#B07D4F' : '#D4A373'}
                  opacity={isHovered ? 0.95 : 0.65}
                />
                {/* Invisible wider hover target */}
                <rect
                  x={padLeft + idx * barStep}
                  y={padTop}
                  width={barStep}
                  height={chartH}
                  fill="transparent"
                  onMouseEnter={() => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                  className="cursor-crosshair"
                />
                {(idx === 0 || idx === 7 || idx === 14 || idx === 21 || idx === data.length - 1) && (
                  <text
                    x={padLeft + idx * barStep + barStep / 2}
                    y={height - 12}
                    textAnchor="middle"
                    className="fill-[#6D5649] text-[10px] font-mono"
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Milk Production Line */}
          <polyline
            fill="none"
            stroke="#2E7D32"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={linePoints}
            className="pointer-events-none"
          />

          {/* Line Nodes */}
          {data.map((d, idx) => {
            const x = padLeft + idx * barStep + barStep / 2;
            const y = padTop + chartH - (d.milkLitres / maxLitres) * chartH;
            const isHovered = hoverIdx === idx;
            return (
              <circle
                key={`pt-${d.date}`}
                cx={x}
                cy={y}
                r={isHovered ? 4.5 : 2.3}
                fill={isHovered ? '#1B5E20' : '#2E7D32'}
                stroke="#FFFFFF"
                strokeWidth="1.2"
                className="pointer-events-none"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
