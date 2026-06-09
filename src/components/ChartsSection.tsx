import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Info } from 'lucide-react';
import { Transaction } from '../types';

interface ChartsSectionProps {
  transactions: Transaction[];
  formatRupiah: (angka: number) => string;
}

export default function ChartsSection({ transactions, formatRupiah }: ChartsSectionProps) {
  // State for hovered bar in double-bar chart
  const [hoveredBar, setHoveredBar] = useState<{
    month: string;
    type: 'pemasukan' | 'pengeluaran';
    value: number;
    x: number;
    y: number;
  } | null>(null);

  // --- Chart 1: double bar chart calculations ---
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
  const chartData = months.map((m, i) => ({
    name: m,
    pemasukan: 0,
    pengeluaran: 0
  }));

  transactions.forEach((t) => {
    const date = new Date(t.tanggal);
    if (!isNaN(date.getTime())) {
      const monthIdx = date.getMonth(); // 0..11
      // Map to Jan-Jun:
      const idx = monthIdx >= 0 && monthIdx <= 5 ? monthIdx : monthIdx % 6;
      if (t.jenis === 'pemasukan') {
        chartData[idx].pemasukan += t.jumlah;
      } else {
        chartData[idx].pengeluaran += t.jumlah;
      }
    }
  });

  // Find max value to scale heights
  const maxBarValue = Math.max(
    ...chartData.map((d) => Math.max(d.pemasukan, d.pengeluaran)),
    100000 // default min peak
  );

  const formatCompact = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
  };

  // --- Chart 2: Donut Chart calculations ---
  const pengeluaranTxs = transactions.filter((t) => t.jenis === 'pengeluaran');
  const totalPengeluaran = pengeluaranTxs.reduce((sum, t) => sum + t.jumlah, 0);

  const group: { [cat: string]: number } = {};
  pengeluaranTxs.forEach((t) => {
    const cat = t.kategori || 'Lainnya';
    group[cat] = (group[cat] || 0) + t.jumlah;
  });

  const categoryListRaw = Object.keys(group).map((cat) => {
    const val = group[cat];
    const pct = totalPengeluaran > 0 ? Math.round((val / totalPengeluaran) * 100) : 0;
    return {
      name: cat,
      value: val,
      percentage: pct
    };
  });

  // Sort by cost descending
  categoryListRaw.sort((a, b) => b.value - a.value);

  // Default color list matches
  const colors: { [key: string]: string } = {
    'Gaji': '#10b981',
    'Freelance': '#06b6d4',
    'Belanja': '#f59e0b',
    'Transportasi': '#10b981',
    'Makan & Minum': '#1c64f2',
    'Tagihan': '#8b5cf6',
    'Lainnya': '#94a3b8'
  };
  const fallbackColors = ['#1c64f2', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#f43f5e', '#64748b'];

  const categoryData = categoryListRaw.length > 0 
    ? categoryListRaw.map((c, i) => ({
        ...c,
        color: colors[c.name] || fallbackColors[i % fallbackColors.length]
      }))
    : [
        { name: 'Makan & Minum', value: 350000, percentage: 35, color: '#1c64f2' },
        { name: 'Transportasi', value: 200000, percentage: 20, color: '#10b981' },
        { name: 'Belanja', value: 200000, percentage: 20, color: '#f59e0b' },
        { name: 'Tagihan', value: 150000, percentage: 15, color: '#8b5cf6' },
        { name: 'Lainnya', value: 100000, percentage: 10, color: '#6b7280' }
      ];

  // Sum of percentages might slightly vary, let's normalize or use them directly
  let cumulativePercentage = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. DOUBLE BAR CHART (7 cols) */}
      <div className="lg:col-span-7 bg-white p-5 md:p-6 border border-gray-100 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base font-sans">
              Grafik Aliran Kas Masuk & Keluar
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
              <span className="text-slate-500">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-500 rounded-sm"></span>
              <span className="text-slate-500">Pengeluaran</span>
            </div>
          </div>
        </div>

        {/* Custom Responsive SVG Double-Bar Chart */}
        <div className="relative h-[220px] w-full">
          <svg className="w-full h-full" viewBox="0 0 540 220" preserveAspectRatio="none">
            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = 20 + (1 - ratio) * 160;
              const valueLabel = formatCompact(maxBarValue * ratio);
              return (
                <g key={idx}>
                  {/* Dashline */}
                  <line 
                    x1="45" 
                    y1={y} 
                    x2="520" 
                    y2={y} 
                    stroke="#eaeaea" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                  {/* Y-axis Label */}
                  <text 
                    x="40" 
                    y={y + 4} 
                    fill="#94a3b8" 
                    fontSize="10" 
                    fontWeight="bold" 
                    fontFamily="sans-serif" 
                    textAnchor="end"
                  >
                    {valueLabel}
                  </text>
                </g>
              );
            })}

            {/* Render Bars Side-by-Side for each of 6 Months */}
            {chartData.map((d, mIdx) => {
              const colWidth = 65;
              const spacing = 75;
              const xStart = 65 + mIdx * spacing;
              
              // Heights scale
              const pemHeight = (d.pemasukan / maxBarValue) * 160;
              const pengHeight = (d.pengeluaran / maxBarValue) * 160;

              const yBase = 180;
              const yPem = yBase - pemHeight;
              const yPeng = yBase - pengHeight;

              const barWidth = 14;

              return (
                <g key={mIdx} className="group/bar">
                  {/* 1. Green bar - Pemasukan */}
                  <rect
                    x={xStart}
                    y={yPem}
                    width={barWidth}
                    height={Math.max(pemHeight, 2)}
                    rx="3"
                    fill="#10b981"
                    className="hover:fill-emerald-400 transition-all cursor-pointer duration-150"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredBar({
                        month: d.name,
                        type: 'pemasukan',
                        value: d.pemasukan,
                        x: xStart + barWidth / 2,
                        y: yPem - 10
                      });
                    }}
                    onMouseLeave={() => setHoveredBar(null)}
                  />

                  {/* 2. Red bar - Pengeluaran */}
                  <rect
                    x={xStart + barWidth + 3}
                    y={yPeng}
                    width={barWidth}
                    height={Math.max(pengHeight, 2)}
                    rx="3"
                    fill="#ef4444"
                    className="hover:fill-rose-400 transition-all cursor-pointer duration-150"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredBar({
                        month: d.name,
                        type: 'pengeluaran',
                        value: d.pengeluaran,
                        x: xStart + barWidth + 4,
                        y: yPeng - 10
                      });
                    }}
                    onMouseLeave={() => setHoveredBar(null)}
                  />

                  {/* Bottom Text Axis representing Month Name */}
                  <text
                    x={xStart + barWidth}
                    y="200"
                    fill="#64748b"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                  >
                    {d.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Popover */}
          {hoveredBar && (
            <div 
              className="absolute bg-slate-900/95 text-white text-[11px] p-2 rounded-xl shadow-xl border border-slate-700/50 pointer-events-none z-30 flex flex-col items-center shrink-0"
              style={{
                left: `${(hoveredBar.x / 540) * 100}%`,
                top: `${(hoveredBar.y / 220) * 100}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <span className="font-bold uppercase text-[9px] tracking-widest text-slate-400">
                {hoveredBar.month} - {hoveredBar.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
              </span>
              <span className="font-mono font-bold text-sm mt-0.5 text-white">
                {formatRupiah(hoveredBar.value)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. DONUT RING CHART (5 cols) */}
      <div className="lg:col-span-5 bg-white p-5 md:p-6 border border-gray-100 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base font-sans">
            Alokasi Pengeluaran per Kategori
          </h3>
        </div>

        {/* Representation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-full lg:min-h-[190px]">
          {/* Donut SVG using math strokeDasharray loop trick */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="4.2"
              />
              {categoryData.map((c, idx) => {
                const percentage = c.percentage;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = 100 - cumulativePercentage + 25;
                cumulativePercentage += percentage;

                if (percentage === 0) return null;

                return (
                  <circle
                    key={idx}
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={c.color}
                    strokeWidth="4.2"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Text at center representing sum */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 bg-transparent pointer-events-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Belanja
              </span>
              <span className="text-xs sm:text-[13px] font-extrabold text-slate-700 mt-1 truncate max-w-[100px] leading-tight font-sans">
                {formatRupiah(totalPengeluaran)}
              </span>
            </div>
          </div>

          {/* Color-coded Legends List */}
          <div className="grow space-y-2.5 w-full sm:max-w-[200px]">
            {categoryData.slice(0, 5).map((c, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 max-w-[110px] truncate">
                  <span 
                    className="w-2.5 h-2.5 shrink-0 rounded-full" 
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-slate-600 truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-slate-450 text-[10px]/none">({c.percentage}%)</span>
                  <span className="text-slate-800 text-xs font-bold">{formatCompact(c.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
