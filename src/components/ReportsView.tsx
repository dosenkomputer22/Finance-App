import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Calendar, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Database,
  Download,
  FileSpreadsheet,
  ExternalLink,
  X
} from 'lucide-react';
import { Transaction } from '../types';

interface ReportsViewProps {
  transactions: Transaction[];
  formatRupiah: (angka: number) => string;
}

const INDONESIAN_MONTHS = [
  'Semua Bulan',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export default function ReportsView({ transactions, formatRupiah }: ReportsViewProps) {
  // --- States for monthly and yearly filter ---
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Semua, 1-12 = Jan-Des
  const [selectedYear, setSelectedYear] = useState<string>('semua'); // 'semua' or year string
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // --- Parse unique years from transactions safely ---
  const availableYears = useMemo(() => {
    const years = transactions.map(t => {
      if (!t.tanggal) return '';
      const parts = t.tanggal.split('-');
      return parts[0]; // YYYY
    }).filter(y => y && y.length === 4);
    
    // Add current year as option if empty
    const currentYearStr = new Date().getFullYear().toString();
    if (years.length === 0 || !years.includes(currentYearStr)) {
      years.push(currentYearStr);
    }
    
    // Remove duplicates and sort descending
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // --- Filter transactions based on local state ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.tanggal) return true;
      const parts = t.tanggal.split('-'); // string "YYYY-MM-DD"
      if (parts.length < 2) return true;
      
      const txYear = parts[0];
      const txMonth = parseInt(parts[1], 10);
      
      const matchesYear = selectedYear === 'semua' || txYear === selectedYear;
      const matchesMonth = selectedMonth === 0 || txMonth === selectedMonth;
      
      return matchesYear && matchesMonth;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // --- Calculations based on filtered dataset ---
  const totalIn = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.jenis === 'pemasukan')
      .reduce((sum, t) => sum + t.jumlah, 0);
  }, [filteredTransactions]);

  const totalOut = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.jenis === 'pengeluaran')
      .reduce((sum, t) => sum + t.jumlah, 0);
  }, [filteredTransactions]);

  const netBalance = totalIn - totalOut;
  const ratio = totalIn > 0 ? Math.round((totalOut / totalIn) * 100) : 0;

  // --- Expenses breakdown for high ranking categories ---
  const categoryExpenses = useMemo(() => {
    const group: { [cat: string]: number } = {};
    filteredTransactions
      .filter((t) => t.jenis === 'pengeluaran')
      .forEach((t) => {
        const cat = t.kategori || 'Lainnya';
        group[cat] = (group[cat] || 0) + t.jumlah;
      });

    return Object.keys(group).map((c) => ({
      name: c,
      value: group[c],
      percent: totalOut > 0 ? Math.round((group[c] / totalOut) * 100) : 0
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions, totalOut]);

  // --- Handlers ---
  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error(e);
    }
  };

  // --- Generate Standalone Off-line Printable HTML ---
  const handleDownloadHTMLReport = () => {
    const tableRowsHtml = filteredTransactions.length > 0 
      ? filteredTransactions.map((tx, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}">
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; white-space: nowrap;">${formatIndonesianDateStr(tx.tanggal)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: 500;">${tx.keterangan}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">
            <span style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold;">
              ${tx.kategori || 'Umum'}
            </span>
          </td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">
            <span style="color: ${tx.jenis === 'pemasukan' ? '#16a34a' : '#dc2626'}">
              ${tx.jenis === 'pemasukan' ? 'MASUK' : 'KELUAR'}
            </span>
          </td>
          <td style="text-align: right; border: 1px solid #cbd5e1; padding: 8px; font-family: monospace; font-weight: bold; color: ${tx.jenis === 'pemasukan' ? '#16a34a' : '#dc2626'}">
            ${tx.jenis === 'pemasukan' ? '+' : '-'}${formatRupiah(tx.jumlah)}
          </td>
        </tr>
      `).join('')
      : `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #64748b; border: 1px solid #cbd5e1; font-style: italic;">Tidak ada catatan transaksi untuk periode filter ${periodLabel}</td></tr>`;

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Keuangan KeuanganKu - ${periodLabel}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      padding: 40px;
      max-width: 950px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .no-print-bar {
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 35px;
    }
    .print-btn {
      background-color: #2563eb;
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
      transition: background-color 0.2s;
    }
    .print-btn:hover {
      background-color: #1d4ed8;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 5px 0;
      font-size: 24px;
      letter-spacing: 1px;
    }
    .header p {
      margin: 0;
      font-size: 13px;
      color: #475569;
      font-style: italic;
    }
    .divider {
      border-bottom: 3px double #111111;
      margin-top: 10px;
      margin-bottom: 25px;
    }
    .meta-table {
      width: 100%;
      margin-bottom: 25px;
      font-size: 13px;
    }
    .meta-table td {
      padding: 4px 0;
    }
    .cards-container {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }
    .card {
      flex: 1;
      padding: 15px;
      border: 1px solid #94a3b8;
      border-radius: 8px;
      background-color: #f8fafc;
    }
    .card-title {
      font-size: 10px;
      font-weight: bold;
      color: #475569;
      text-transform: uppercase;
      display: block;
    }
    .card-value {
      font-size: 18px;
      font-weight: bold;
      display: block;
      margin-top: 5px;
      font-family: monospace;
    }
    .card-subtext {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
      display: block;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 35px;
      font-size: 12px;
    }
    table.data-table th {
      background-color: #f1f5f9;
      border: 1px solid #1e293b;
      padding: 10px;
      font-weight: bold;
      text-align: left;
      text-transform: uppercase;
    }
    table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 10px;
    }
    .total-row {
      font-weight: bold;
      background-color: #f8fafc;
    }
    .grand-total-row {
      font-weight: bold;
      background-color: #e2e8f0;
    }
    .signature-container {
      margin-top: 60px;
      display: flex;
      justify-content: flex-end;
      font-size: 13px;
      page-break-inside: avoid;
    }
    .signature-box {
      text-align: center;
      width: 250px;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <button class="print-btn" onclick="window.print()">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
      CETAK / SIMPAN KE PDF SEKARANG
    </button>
    <p style="font-size: 12px; margin: 8px 0 0 0; color: #475569; font-weight: 500;">
      Laporan ini siap diprint. Klik tombol di atas untuk memicu pencetakan resmi browser Anda. (Tombol ini otomatis disembunyikan saat dicetak).
    </p>
  </div>

  <div class="header">
    <h1 style="font-weight: 800; text-transform: uppercase; margin: 0;">LAPORAN IKHTISAR ARUS KAS KEUANGANKU</h1>
    <p style="margin-top: 4px;">Sistem Informasi Aliran Kas Mandiri &amp; Portable HTML</p>
    <div class="divider"></div>
  </div>

  <table class="meta-table">
    <tr>
      <td style="width: 50%;"><strong>PERIODE FILTER LAPORAN:</strong> ${periodLabel.toUpperCase()}</td>
      <td style="width: 50%; text-align: right;"><strong>TANGGAL PENYUSUNAN:</strong> ${getTodayFormattedIndo()}</td>
    </tr>
    <tr>
      <td><strong>STATUS DOKUMEN:</strong> Standalone Portable File</td>
      <td style="text-align: right;"><strong>SUMBER DATA:</strong> Penyimpanan Lokal Aplikasi KeuanganKu</td>
    </tr>
  </table>

  <div class="cards-container">
    <div class="card">
      <span class="card-title">Total Pemasukan (Debit)</span>
      <span class="card-value" style="color: #16a34a;">${formatRupiah(totalIn)}</span>
      <span class="card-subtext">Dari ${filteredTransactions.filter(t => t.jenis === 'pemasukan').length} Transaksi Terpilih</span>
    </div>
    <div class="card">
      <span class="card-title">Total Pengeluaran (Kredit)</span>
      <span class="card-value" style="color: #dc2626;">${formatRupiah(totalOut)}</span>
      <span class="card-subtext">Dari ${filteredTransactions.filter(t => t.jenis === 'pengeluaran').length} Transaksi Terpilih</span>
    </div>
    <div class="card" style="background-color: ${netBalance >= 0 ? '#f0fdf4' : '#fef2f2'}; border-color: ${netBalance >= 0 ? '#bbf7d0' : '#fecaca'};">
      <span class="card-title">Saldo Bersih Periode</span>
      <span class="card-value" style="color: ${netBalance >= 0 ? '#2563eb' : '#d97706'};">${netBalance < 0 ? '-' : ''}${formatRupiah(Math.abs(netBalance))}</span>
      <span class="card-subtext">Status: <strong>${netBalance >= 0 ? 'Surplus Aliran Kas' : 'Defisit Aliran Kas'}</strong></span>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 5%; text-align: center; border: 1px solid #1e293b;">No</th>
        <th style="width: 15%; border: 1px solid #1e293b;">Tanggal</th>
        <th style="width: 40%; border: 1px solid #1e293b;">Keterangan / Pos Aliran</th>
        <th style="width: 15%; border: 1px solid #1e293b;">Kategori</th>
        <th style="width: 10%; text-align: center; border: 1px solid #1e293b;">Jenis</th>
        <th style="width: 15%; text-align: right; border: 1px solid #1e293b;">Jumlah Nominal</th>
      </tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
      <tr class="total-row">
        <td colspan="5" style="text-align: right; border: 1px solid #cbd5e1; padding: 10px;">TOTAL PEMASUKAN (DEBIT)</td>
        <td style="text-align: right; color: #16a34a; font-family: monospace; border: 1px solid #cbd5e1; padding: 10px; font-weight: bold;">${formatRupiah(totalIn)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="5" style="text-align: right; border: 1px solid #cbd5e1; padding: 10px;">TOTAL PENGELUARAN (KREDIT)</td>
        <td style="text-align: right; color: #dc2626; font-family: monospace; border: 1px solid #cbd5e1; padding: 10px; font-weight: bold;">${formatRupiah(totalOut)}</td>
      </tr>
      <tr class="grand-total-row">
        <td colspan="5" style="text-align: right; border: 1px solid #cbd5e1; padding: 10px;">SALDO BERSIH AKHIR PERIODE INI</td>
        <td style="text-align: right; font-family: monospace; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px; color: ${netBalance >= 0 ? '#1d4ed8' : '#b91c1c'};">
          ${netBalance < 0 ? '-' : ''}${formatRupiah(Math.abs(netBalance))}
        </td>
      </tr>
    </tbody>
  </table>

  <div class="signature-container">
    <div class="signature-box">
      <p style="margin: 0 0 65px 0;">
        Pengesahan Laporan,<br>
        Disusun &amp; Diaudit Pada Tanggal <strong>${getTodayFormattedIndo()}</strong>
      </p>
      <p style="margin: 0; border-bottom: 1.5px solid #0f172a; font-weight: bold; font-size: 14px; padding-bottom: 2px;">
        ( Bendahara KeuanganKu )
      </p>
      <p style="margin: 5px 0 0 0; text-transform: uppercase; font-size: 10px; color: #475569; font-weight: bold; letter-spacing: 0.5px;">
        SISTEM KEUANGAN AUTO-GENERATED
      </p>
    </div>
  </div>

</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // clean filename of any spacing or weird characters
    const monthLabel = selectedMonth > 0 ? INDONESIAN_MONTHS[selectedMonth].replace(/\s/g, '_') : 'Semua';
    const yearLabel = selectedYear !== 'semua' ? selectedYear : 'Semua';
    link.setAttribute('download', `Laporan_Keuangan_${monthLabel}_Tahun_${yearLabel}.html`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Export Filtered Dataset to clean Comma Separated CSV ---
  const handleExportCSV = () => {
    // UTF-8 BOM to prevent Excel messing up Indonesian symbols or numbers
    let csvContent = '\uFEFF'; 
    
    const rows = [
      ['No', 'Tanggal', 'Keterangan / Pos Aliran', 'Kategori', 'Jenis', 'Nominal Angka (IDR)', 'Format Visual']
    ];

    filteredTransactions.forEach((tx, idx) => {
      rows.push([
        (idx + 1).toString(),
        tx.tanggal || '',
        `"${(tx.keterangan || '').replace(/"/g, '""')}"`,
        tx.kategori || 'Umum',
        (tx.jenis || '').toUpperCase(),
        tx.jumlah.toString(),
        `"${tx.jenis === 'pemasukan' ? '+' : '-'}${formatRupiah(tx.jumlah).replace(/\s/g, ' ')}"`
      ]);
    });

    // append blank line
    rows.push([]);
    rows.push(['', '', 'TOTAL INFLOW (PEMASUKAN)', '', '', totalIn.toString(), `"${formatRupiah(totalIn)}"`]);
    rows.push(['', '', 'TOTAL OUTFLOW (PENGELUARAN)', '', '', totalOut.toString(), `"${formatRupiah(totalOut)}"`]);
    rows.push(['', '', 'NET CASHFLOW (SALDO BERSIH)', '', '', netBalance.toString(), `"${netBalance < 0 ? '-' : ''}${formatRupiah(Math.abs(netBalance))}"`]);

    csvContent += rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const monthLabel = selectedMonth > 0 ? INDONESIAN_MONTHS[selectedMonth].replace(/\s/g, '_') : 'Semua';
    const yearLabel = selectedYear !== 'semua' ? selectedYear : 'Semua';
    link.setAttribute('download', `Ledger_Keuangan_${monthLabel}_Tahun_${yearLabel}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Format Indonesian Date helper ---
  const formatIndonesianDateStr = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length < 3) return dateString;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    return `${day} ${months[monthIdx]} ${year}`;
  };

  // --- Current date format for official reports ---
  const getTodayFormattedIndo = () => {
    const d = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const periodLabel = `${selectedMonth > 0 ? INDONESIAN_MONTHS[selectedMonth] : 'Seluruh Bulan'} ${selectedYear !== 'semua' ? selectedYear : 'Seluruh Tahun'}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 
        Scoped css style injection for beautiful print mode.
        Using visibility: hidden on the body, but forcing our specific print container
        to display cleanly at the very top of print page boundaries!
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide standard elements */
          body * {
            visibility: hidden !important;
          }
          /* Override body styling for standard white output page */
          body {
            background-color: #ffffff !important;
            background-image: none !important;
            color: #111111 !important;
          }
          /* Show print page elements specifically */
          #printable-report, #printable-report * {
            visibility: visible !important;
          }
          #printable-report {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15px;
            font-family: 'Times New Roman', Times, serif, system-ui, sans-serif !important;
          }
          /* Form tables print margins */
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 15px !important;
            margin-bottom: 25px !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            color: #000000 !important;
            border: 1px solid #334155 !important;
            font-weight: bold !important;
            padding: 7px 10px !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
          }
          .print-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 7px 10px !important;
            font-size: 11px !important;
            color: #1e293b !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* NO-PRINT CONTAINER: Interactive dashboard interface on screen */}
      <div className="no-print space-y-6">
        
        {/* Banner with controls */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-blue-50 text-blue-600 rounded-xl p-2.5 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base font-sans">
                Laporan Keuangan Elektronik
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Filter berkala, kaji rasio cash flow, dan cetak ke format fisik/PDF.</p>
            </div>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" />
            Cetak / Ekspor Laporan
          </button>
        </div>

        {/* Filter Selection Panel */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4.5 h-4.5 text-blue-600" />
            <h4 className="font-bold text-slate-800 text-sm font-sans">Rentang Filter Laporan</h4>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold ml-auto font-mono">
              {filteredTransactions.length} Data Terpilih
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                Bulan Transaksi
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-450 pointer-events-none" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {INDONESIAN_MONTHS.map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                Tahun Transaksi
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-450 pointer-events-none" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="semua">Semua Tahun</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Filtered Financial Metrics Real-Time Display Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Card Total Pemasukan Terfilter */}
          <div className="bg-white border border-gray-150/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Pemasukan Periode Ini</span>
              <p className="text-lg md:text-xl font-black text-emerald-600 font-mono">{formatRupiah(totalIn)}</p>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md mt-0.5 border border-emerald-100">
                <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" />
                Uang Masuk
              </span>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-center text-emerald-600 w-12 h-12 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card Total Pengeluaran Terfilter */}
          <div className="bg-white border border-gray-150/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Pengeluaran Periode Ini</span>
              <p className="text-lg md:text-xl font-black text-rose-600 font-mono">{formatRupiah(totalOut)}</p>
              <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-md mt-0.5 border border-rose-100">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                Uang Keluar
              </span>
            </div>
            <div className="bg-rose-50 rounded-xl p-3 flex items-center justify-center text-rose-600 w-12 h-12 shrink-0">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

          {/* Card Saldo Bersih Terfilter */}
          <div className={`bg-white border rounded-2xl p-5 shadow-xs flex items-center justify-between ${netBalance >= 0 ? 'border-gray-150/80' : 'border-amber-200'}`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Saldo Bersih Terfilter</span>
              <p className={`text-lg md:text-xl font-black font-mono ${netBalance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                {netBalance < 0 ? '-' : ''}{formatRupiah(Math.abs(netBalance))}
              </p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5 border ${
                netBalance >= 0 
                  ? 'bg-blue-50 text-blue-700 border-blue-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {netBalance >= 0 ? 'Surplus Anggaran' : 'Defisit Anggaran'}
              </span>
            </div>
            <div className={`rounded-xl p-3 flex items-center justify-center w-12 h-12 shrink-0 ${
              netBalance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Database className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Analytics grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ratio Progress Card */}
          <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-xs">
            <h4 className="font-bold text-slate-800 text-xs mb-4 uppercase tracking-wider text-slate-400">Rasio Pengeluaran Periode</h4>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-650 mb-1">
                  <span>Rasio Alokasi (Pengeluaran vs Pemasukan)</span>
                  <span>{ratio}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      ratio > 80 ? 'bg-red-500' : ratio > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(ratio, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-450 mt-2 leading-relaxed">
                  {totalIn === 0 && totalOut > 0 ? (
                    '💡 Tidak ada pemasukan tercatat dalam periode filter ini. Statistik rasio tidak dapat ditampilkan.'
                  ) : ratio > 80 ? (
                    '⚠️ Rasio kritis! Konsumsi kas hampir menghabiskan seluruh pemasukan pada periode ini. Harap lakukan penyesuaian belanja.'
                  ) : ratio > 50 ? (
                    '👉 Efisiensi standar. Untuk kebebasan finansial jangka panjang, cobalah menekan alokasi agar rasio turun di bawah 50%.'
                  ) : totalIn > 0 ? (
                    '🌿 Sangat Prima! Anda berhasil mempertahankan pengeluaran bulanan di kisaran yang sangat sehat (di bawah 50%).'
                  ) : (
                    'Belum ada data masuk atau keluar untuk dianalisa di periode filter.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Margin Sisa</span>
                  <p className="text-base font-black text-slate-700 font-mono mt-0.5">{formatRupiah(netBalance >= 0 ? netBalance : 0)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Efisiensi Tabungan</span>
                  <p className="text-base font-black text-emerald-600 mt-0.5 font-sans">
                    {totalIn > 0 ? Math.round(((totalIn - totalOut) / totalIn) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Chart Card */}
          <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-xs">
            <h4 className="font-bold text-slate-800 text-xs mb-4 uppercase tracking-wider text-slate-400">Distribusi Kategori Pengeluaran</h4>
            {categoryExpenses.length > 0 ? (
              <div className="space-y-3.5">
                {categoryExpenses.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {item.name}
                      </span>
                      <span>{formatRupiah(item.value)} <span className="text-slate-400 text-[10px]">({item.percent}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-slate-700 h-full rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                <Info className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                Tidak ada data pengeluaran dicatat untuk dinalisa pada periode filter {periodLabel}.
              </div>
            )}
          </div>
        </div>

        {/* Interactive Period Ledger Table Preview (shows precisely what will print) */}
        <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-sm font-sans flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Pratinjau Data yang Dicetak ({filteredTransactions.length} Data)
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">
              Periode: {periodLabel}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-5 py-2.5 text-center" style={{ width: '60px' }}>No</th>
                  <th className="px-4 py-2.5">Tanggal</th>
                  <th className="px-4 py-2.5">Keterangan</th>
                  <th className="px-3 py-2.5">Kategori</th>
                  <th className="px-3 py-2.5 text-center">Jenis</th>
                  <th className="px-5 py-2.5 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, index) => (
                    <tr key={tx.id} className="hover:bg-slate-55/20 transition-colors">
                      <td className="px-5 py-2.5 text-center text-slate-400 font-bold">{index + 1}</td>
                      <td className="px-4 py-2.5 font-bold whitespace-nowrap">{formatIndonesianDateStr(tx.tanggal)}</td>
                      <td className="px-4 py-2.5 font-semibold">{tx.keterangan}</td>
                      <td className="px-3 py-2.5">
                        <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          {tx.kategori || 'Umum'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {tx.jenis === 'pemasukan' ? (
                          <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">MASUK</span>
                        ) : (
                          <span className="text-rose-700 font-bold text-[10px] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">KELUAR</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 text-right font-bold font-mono">
                        {tx.jenis === 'pemasukan' ? (
                          <span className="text-emerald-600">+{formatRupiah(tx.jumlah)}</span>
                        ) : (
                          <span className="text-rose-600">-{formatRupiah(tx.jumlah)}</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      <AlertTriangle className="w-7 h-7 mx-auto text-slate-350 mb-1" />
                      <p className="font-bold text-slate-500 text-xs">Kosong</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada data transaksi yang cocok dengan filter ({periodLabel})</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 
        MODAL & FLOATING DIALOG EXPORT & CETAK LAPORAN 
      */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setShowExportModal(false)}
          />
          
          {/* Card dialog contents with animation look */}
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 z-10 overflow-hidden transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-800 text-sm font-sans">
                  Opsi Cetak &amp; Ekspor Keuangan
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Description, including the precise Iframe Sandbox disclaimer! */}
            <div className="space-y-5 text-xs">
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 text-slate-700 rounded-xl leading-relaxed space-y-1.5">
                <span className="font-bold text-blue-800 flex items-center gap-1.5 text-[11px]">
                  <Info className="w-4 h-4 shrink-0 text-blue-700" />
                  Pemberitahuan Sistem Pratayang
                </span>
                <p>
                  Sistem keamanan browser membatasi fungsionalitas cetak langsung (<code className="font-mono bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-bold">window.print()</code>) secara langsung dari dalam window iframe.
                </p>
                <p className="font-semibold text-slate-800">
                  Gunakan opsi-opsi terverifikasi di bawah ini untuk mengunduh laporan PDF atau tabel Excel Anda secara akurat sesuai kebutuhan:
                </p>
              </div>

              {/* Two Main Columns/Sections: PDF and EXCEL */}
              <div className="space-y-4">
                
                {/* SECTION 1: PDF & PRINT */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block font-sans">
                    A. PILIHAN OUTPUT PDF &amp; CETAK LAPORAN
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Method 1: HTML Portable Document */}
                    <button
                      onClick={() => {
                        handleDownloadHTMLReport();
                        setShowExportModal(false);
                      }}
                      className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="bg-red-50 text-red-650 rounded-xl p-2.5 transition-colors group-hover:bg-red-600 group-hover:text-white shrink-0 mt-0.5">
                        <Download className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 flex-wrap">
                          Unduh Laporan Keuangan Portabel (.html)
                          <span className="bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">Terpopuler</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                          Mengotomatiskan cetakan PDF yang rapi dengan mendownload file HTML mandiri. Cukup buka file ini pada komputer Anda dan simpan ke PDF.
                        </p>
                      </div>
                    </button>

                    {/* Method 2: Direct local print */}
                    <button
                      onClick={() => {
                        handlePrint();
                      }}
                      className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="bg-slate-250 text-slate-700 rounded-xl p-2.5 transition-colors group-hover:bg-slate-900 group-hover:text-white shrink-0 mt-0.5">
                        <Printer className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="font-bold text-slate-800 text-xs">
                          Cetak Langsung dari Browser (Cetak / Simpan PDF)
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Membuka printer dialog bawaan browser. <strong className="text-amber-700">Catatan:</strong> Hanya bekerja lancar bila Anda telah membuka aplikasi ini pada <strong>"Tab Baru"</strong> di luar frame.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* SECTION 2: EXCEL & SPREADSHEET */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block font-sans">
                    B. PILIHAN EXPORT DATA &amp; EXCEL
                  </span>

                  {/* Excel spreadsheets button */}
                  <button
                    onClick={() => {
                      handleExportCSV();
                      setShowExportModal(false);
                    }}
                    className="w-full flex items-start gap-3 p-3 bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-150 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="bg-emerald-100 text-emerald-700 rounded-xl p-2.5 transition-colors group-hover:bg-emerald-600 group-hover:text-white shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 flex-wrap">
                        Ekspor Buku Kas ke Excel Spreadsheet (.csv)
                        <span className="bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">Excel Ready</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-normal">
                        Mendownload ledger harian ke format file CSV yang kompatibel penuh dengan <strong>Microsoft Excel, Google Sheets,</strong> dan WPS Office.
                      </p>
                    </div>
                  </button>
                </div>

              </div>
            </div>

            {/* Modal Footer disclaimer */}
            <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-450 leading-relaxed font-sans font-semibold">
              * Filter saat ini: <strong className="text-slate-600">{periodLabel}</strong> ({filteredTransactions.length} transaksi terfilter). Seluruh laporan yang diekspor otomatis menyesuaikan filter aktif di panel utama.
            </div>

          </div>
        </div>
      )}

      {/* PRINT-ONLY MARKUP CONTAINER (completely hidden on screen but visible for printer) */}
      <div id="printable-report" className="hidden">
        
        {/* Main Document Header Title block */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            LAPORAN IKHTISAR ARUS KAS KEUANGANKU
          </h1>
          <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#475569', fontStyle: 'italic' }}>
            Sistem Informasi Pencatatan Aliran Keuangan Native & cPanel Ready
          </p>
          <div style={{ borderBottom: '3px double #111111', width: '100%', height: '2px' }} />
        </div>

        {/* Secondary section: Metadata block info */}
        <table style={{ width: '100%', border: 'none', marginBottom: '15px', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ width: '45%', border: 'none', padding: '2px 0' }}>
                <strong>PERIODE LAPORAN:</strong> {periodLabel.toUpperCase()}
              </td>
              <td style={{ width: '10%', border: 'none', padding: '2px 0' }}></td>
              <td style={{ width: '45%', border: 'none', padding: '2px 0', textAlign: 'right' }}>
                <strong>TANGGAL CETAK:</strong> {getTodayFormattedIndo()}
              </td>
            </tr>
            <tr>
              <td style={{ border: 'none', padding: '2px 0' }}>
                <strong>STATUS AUDIT:</strong> Simulasi Akurat
              </td>
              <td style={{ border: 'none', padding: '2px 0' }}></td>
              <td style={{ border: 'none', padding: '2px 0', textAlign: 'right' }}>
                <strong>DIHASILKAN OLEH:</strong> Sistem Aplikasi KeuanganKu
              </td>
            </tr>
          </tbody>
        </table>

        {/* Abstract Metrics Summary cards */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '20px' }}>
          
          <div style={{ flex: 1, padding: '10px', border: '1px solid #94a3b8', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#475569', display: 'block', textTransform: 'uppercase' }}>
              Total Pemasukan (Debit)
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a', display: 'block', marginTop: '3px', fontFamily: 'monospace' }}>
              {formatRupiah(totalIn)}
            </span>
            <span style={{ fontSize: '9px', color: '#64748b' }}>Dari {filteredTransactions.filter(t => t.jenis === 'pemasukan').length} Transaksi</span>
          </div>

          <div style={{ flex: 1, padding: '10px', border: '1px solid #94a3b8', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#475569', display: 'block', textTransform: 'uppercase' }}>
              Total Pengeluaran (Kredit)
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc2626', display: 'block', marginTop: '3px', fontFamily: 'monospace' }}>
              {formatRupiah(totalOut)}
            </span>
            <span style={{ fontSize: '9px', color: '#64748b' }}>Dari {filteredTransactions.filter(t => t.jenis === 'pengeluaran').length} Transaksi</span>
          </div>

          <div style={{ flex: 1, padding: '10px', border: '1px solid #94a3b8', borderRadius: '6px', backgroundColor: netBalance >= 0 ? '#f0fdf4' : '#fef2f2' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#475569', display: 'block', textTransform: 'uppercase' }}>
              Saldo Bersih (Surplus/Defisit)
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: netBalance >= 0 ? '#2563eb' : '#d97706', display: 'block', marginTop: '3px', fontFamily: 'monospace' }}>
              {netBalance < 0 ? '-' : ''}{formatRupiah(Math.abs(netBalance))}
            </span>
            <span style={{ fontSize: '9px', color: '#64748b' }}>
              Status: {netBalance >= 0 ? 'Surplus Kas' : 'Defisit Kas'}
            </span>
          </div>

        </div>

        {/* Detailed Transactions Print Table Ledger */}
        <h3 style={{ margin: '15px 0 5px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Ledger Rincian Aliran Dana Kas
        </h3>
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: '5%' }}>No</th>
              <th style={{ width: '15%' }}>Tanggal</th>
              <th style={{ width: '38%' }}>Keterangan / Pos Aliran</th>
              <th style={{ width: '15%' }}>Kategori</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Jenis</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Jumlah Nominal</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx, index) => (
                <tr key={tx.id}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td>{formatIndonesianDateStr(tx.tanggal)}</td>
                  <td>{tx.keterangan}</td>
                  <td>{tx.kategori || 'Umum'}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {tx.jenis === 'pemasukan' ? 'PEMASUKAN' : 'PENGELUARAN'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {tx.jenis === 'pemasukan' ? '+' : '-'}{formatRupiah(tx.jumlah)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  Tidak ada catatan transaksi yang ditemukan untuk filter waktu yang dipilih.
                </td>
              </tr>
            )}
            
            {/* Table bottom summarizers */}
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
              <td colSpan={5} style={{ textAlign: 'right', padding: '8px 10px', border: '1px solid #cbd5e1' }}>TOTAL PEMASUKAN</td>
              <td style={{ textAlign: 'right', padding: '8px 10px', color: '#16a34a', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>
                {formatRupiah(totalIn)}
              </td>
            </tr>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
              <td colSpan={5} style={{ textAlign: 'right', padding: '8px 10px', border: '1px solid #cbd5e1' }}>TOTAL PENGELUARAN</td>
              <td style={{ textAlign: 'right', padding: '8px 10px', color: '#dc2626', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>
                {formatRupiah(totalOut)}
              </td>
            </tr>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#0f172a' }}>
              <td colSpan={5} style={{ textAlign: 'right', padding: '8px 10px', border: '1px solid #cbd5e1' }}>SALDO BERSIH (SURPLUS / SISA)</td>
              <td style={{ textAlign: 'right', padding: '8px 10px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>
                {netBalance < 0 ? '-' : ''}{formatRupiah(Math.abs(netBalance))}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signature & Authentication Spot Block */}
        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end', width: '100%', fontSize: '11px', pageBreakInside: 'avoid' }}>
          <div style={{ textAlign: 'center', width: '220px' }}>
            <p style={{ margin: '0 0 60px 0' }}>
              Disetujui &amp; Disahkan pada,<br />
              <strong>{getTodayFormattedIndo()}</strong>
            </p>
            <p style={{ margin: '0', borderBottom: '1px solid #111111', fontWeight: 'bold' }}>
              ( Pengelola Keuangan )
            </p>
            <p style={{ margin: '4px 0 0 0', textTransform: 'uppercase', fontSize: '9px', color: '#64748b' }}>
              Bendahara KeuanganKu
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
