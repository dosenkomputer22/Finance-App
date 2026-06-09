import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  PlusCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
  categories: string[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string, keterangan: string) => void;
  onAddClick: () => void;
  formatRupiah: (angka: number) => string;
  isDashboardView?: boolean; // If true, only shows top 5 and simplifies bar triggers
  onTabChange?: (tab: 'dashboard' | 'transactions') => void;
}

export default function TransactionsTable({
  transactions,
  categories,
  onEdit,
  onDelete,
  onAddClick,
  formatRupiah,
  isDashboardView = false,
  onTabChange
}: TransactionsTableProps) {
  // Filters and Searching State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');
  const [filterKategori, setFilterKategori] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isDashboardView ? 5 : 8;

  // Group, Filter & Search pipeline
  const filteredTransactions = transactions.filter((tx) => {
    const isKeywordMatch = 
      tx.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.kategori || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const isTypeMatch = 
      filterJenis === 'semua' || tx.jenis === filterJenis;

    const isCategoryMatch = 
      filterKategori === 'semua' || tx.kategori === filterKategori;

    return isKeywordMatch && isTypeMatch && isCategoryMatch;
  });

  // Calculate pages
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150/90 shadow-xs overflow-hidden">
      {/* Table Header Section */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base font-sans">
            {isDashboardView ? 'Transaksi Terbaru' : 'Riwayat Catatan Keuangan'}
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {isDashboardView ? Math.min(transactions.length, 5) : filteredTransactions.length} dari {transactions.length} Data
          </span>
        </div>
        
        {isDashboardView ? (
          <button
            onClick={() => onTabChange && onTabChange('transactions')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer pb-1 border-b border-transparent hover:border-blue-500"
          >
            Lihat semua data &gt;
          </button>
        ) : (
          <button
            onClick={onAddClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            Tambah Transaksi Baru
          </button>
        )}
      </div>

      {/* Filter and Search controls (We hide detailed filters on Dashboard mode or shrink them) */}
      {!isDashboardView && (
        <div className="p-4 md:p-5 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          {/* Main search bar element */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari keterangan atau kategori..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Selector Type filter */}
          <div className="sm:col-span-3">
            <select
              value={filterJenis}
              onChange={(e) => {
                setFilterJenis(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-slate-700 text-xs sm:text-sm font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="semua">Semua Jenis Aliran</option>
              <option value="pemasukan">Hanya Pemasukan</option>
              <option value="pengeluaran">Hanya Pengeluaran</option>
            </select>
          </div>

          {/* Category Dropdown filter */}
          <div className="sm:col-span-4">
            <select
              value={filterKategori}
              onChange={(e) => {
                setFilterKategori(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-slate-700 text-xs sm:text-sm font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="semua">Semua Kategori</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Responsive HTML Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse align-middle">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-250/50 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">
              <th className="px-5 py-3 text-center" style={{ width: '60px' }}>No</th>
              <th className="px-4 py-3" style={{ width: '130px' }}>Tanggal</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3" style={{ width: '120px' }}>Kategori</th>
              <th className="px-4 py-3 text-center" style={{ width: '110px' }}>Jenis</th>
              <th className="px-5 py-3 text-right" style={{ width: '160px' }}>Jumlah Nominal</th>
              <th className="px-5 py-3 text-center" style={{ width: '110px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx, index) => {
                const dateObj = new Date(tx.tanggal);
                let dateFormatted = tx.tanggal;
                if (!isNaN(dateObj.getTime())) {
                  const monthsInIndoShort = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
                  ];
                  dateFormatted = `${dateObj.getDate()} ${monthsInIndoShort[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
                }

                const transactionOrder = startIndex + index + 1;

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Index row */}
                    <td className="px-5 py-3 text-center font-bold text-slate-400">
                      {transactionOrder}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      {dateFormatted}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3 text-slate-700 font-semibold max-w-[200px] truncate">
                      {tx.keterangan}
                    </td>

                    {/* Kategori Badge */}
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-lg text-[10px] md:text-xs border border-slate-200">
                        {tx.kategori || 'Umum'}
                      </span>
                    </td>

                    {/* Type badge */}
                    <td className="px-4 py-3 text-center">
                      {tx.jenis === 'pemasukan' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] md:text-xs font-bold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                          <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" />
                          Pemasukan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] md:text-xs font-bold bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                          Pengeluaran
                        </span>
                      )}
                    </td>

                    {/* Nominal */}
                    <td className="px-5 py-3 text-right font-black font-mono whitespace-nowrap text-xs md:text-sm">
                      {tx.jenis === 'pemasukan' ? (
                        <span className="text-emerald-600">+ {formatRupiah(tx.jumlah)}</span>
                      ) : (
                        <span className="text-rose-600">- {formatRupiah(tx.jumlah)}</span>
                      )}
                    </td>

                    {/* Action buttons (Styled with nice custom squares) */}
                    <td className="px-5 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all border border-blue-200 hover:border-blue-600 cursor-pointer shadow-xs"
                          title="Ubah Transaksi"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(tx.id, tx.keterangan)}
                          className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg transition-all border border-rose-100 hover:border-rose-500 cursor-pointer shadow-xs"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 px-4 text-slate-400">
                  <AlertTriangle className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                  <p className="font-bold text-slate-600 text-sm">Tidak ada transaksi ditemukan</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Data tidak tersedia atau tidak ada yang sesuai dengan filter pencarian Anda di atas.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control footer bar */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-gray-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-semibold font-sans">
            Menampilkan data {startIndex + 1} hingga {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} dari {filteredTransactions.length} catatan
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-250 rounded-lg font-bold text-slate-600 hover:bg-white transition-colors cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-xs">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-7 h-7 font-bold rounded-lg ${
                    currentPage === i + 1 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'border border-gray-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-250 rounded-lg font-bold text-slate-600 hover:bg-white transition-colors cursor-pointer disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
