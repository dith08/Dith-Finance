import { useState, useEffect } from 'react';
import { Download, Plus, ArrowUpRight, ArrowDownLeft, Calendar, FileSpreadsheet, Wallet, Loader2, Edit2, Trash2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import IncomeModal from './components/IncomeModal';
import ExpenseModal from './components/ExpenseModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { useTransactionStore, type Transaction } from '../../store/transactionStore';

export default function Transactions() {
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: '',
  });

  const { transactions, fetchTransactions, isLoading, deleteTransaction } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const incomeData = transactions.filter(t => t.type === 'income');
  const expenseData = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + Number(item.amount), 0);
  const currentBalance = totalIncome - totalExpense;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const handleExport = async (type: 'all' | 'income' | 'expense') => {
    let dataToExport = transactions;
    if (type !== 'all') {
      dataToExport = transactions.filter(t => t.type === type);
    }

    if (dataToExport.length === 0) {
      alert(`Tidak ada data untuk diekspor`);
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Transaksi');

    worksheet.columns = [
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Tipe', key: 'type', width: 15 },
      { header: 'Kategori', key: 'category', width: 25 },
      { header: 'Nominal', key: 'amount', width: 20 },
      { header: 'Catatan', key: 'note', width: 40 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    dataToExport.forEach((t) => {
      const row = worksheet.addRow({
        date: formatDate(t.date),
        type: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        category: t.category,
        amount: Number(t.amount),
        note: t.note || '-'
      });

      const amountCell = row.getCell('amount');
      amountCell.numFmt = '"Rp"#,##0;[Red]-"Rp"#,##0';

      const typeCell = row.getCell('type');
      typeCell.font = {
        color: { argb: t.type === 'income' ? 'FF059669' : 'FFE11D48' },
        bold: true
      };
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const dateStr = new Date().toISOString().split('T')[0];
    saveAs(blob, `Laporan_Transaksi_${type.toUpperCase()}_${dateStr}.xlsx`);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    if (transaction.type === 'income') {
      setIsIncomeModalOpen(true);
    } else {
      setIsExpenseModalOpen(true);
    }
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setDeleteConfirm({
      isOpen: true,
      id: transaction.id,
      name: `${transaction.category} - ${formatRupiah(Number(transaction.amount))}`,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteTransaction(deleteConfirm.id);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-8 font-sans">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Transaksi</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau arus kas dan kelola data finansial Anda.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200/80 flex items-center gap-4">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 shadow-sm">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Saldo</p>
              <p className="text-slate-900 text-lg sm:text-xl font-bold mt-0.5">
                {isLoading && transactions.length === 0 ? 'Menghitung...' : formatRupiah(currentBalance)}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleExport('all')}
            className="bg-slate-800 text-white px-5 py-3.5 sm:py-0 h-full sm:min-h-14 rounded-2xl font-semibold hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <FileSpreadsheet size={18} />
            <span>Export All</span>
          </button>
        </div>
      </div>

      {isLoading && transactions.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-120 sm:h-135">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100/80 rounded-xl text-emerald-600">
                <ArrowDownLeft size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-base font-bold text-slate-800">Riwayat Pemasukan</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {incomeData.length === 0 && !isLoading ? (
              <div className="text-center text-slate-400 py-10 text-sm font-medium">Belum ada data pemasukan.</div>
            ) : (
              incomeData.map((item) => (
                <div key={item.id} className="p-3.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 flex justify-between items-center gap-3 rounded-2xl transition-all group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate" title={item.category}>{item.category}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate" title={item.note}>{item.note || '-'}</p>
                    <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                      <Calendar size={12} /> {formatDate(item.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-emerald-600 text-sm sm:text-base">+{formatRupiah(Number(item.amount))}</span>
                    <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-all">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all focus:outline-none"
                        title="Edit transaksi"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all focus:outline-none"
                        title="Hapus transaksi"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-100 space-y-3 bg-emerald-50/50">
            {incomeData.length > 0 && (
              <div className="flex justify-between items-center px-2 py-2 bg-white rounded-xl border border-emerald-200/50">
                <p className="text-xs font-semibold text-slate-600">Total Pemasukan</p>
                <p className="text-sm font-bold text-emerald-600">{formatRupiah(totalIncome)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setIsIncomeModalOpen(true)} className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm shadow-emerald-600/20">
                <Plus size={18} strokeWidth={2.5} /> Tambah
              </button>
              <button
                onClick={() => handleExport('income')}
                className="px-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Download size={16} /> Excel
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-120 sm:h-135">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100/80 rounded-xl text-rose-600">
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-base font-bold text-slate-800">Riwayat Pengeluaran</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {expenseData.length === 0 && !isLoading ? (
              <div className="text-center text-slate-400 py-10 text-sm font-medium">Belum ada data pengeluaran.</div>
            ) : (
              expenseData.map((item) => (
                <div key={item.id} className="p-3.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 flex justify-between items-center gap-3 rounded-2xl transition-all group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate" title={item.category}>{item.category}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate" title={item.note}>{item.note || '-'}</p>
                    <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                      <Calendar size={12} /> {formatDate(item.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-rose-600 text-sm sm:text-base">-{formatRupiah(Number(item.amount))}</span>
                    <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-all">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all focus:outline-none"
                        title="Edit transaksi"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all focus:outline-none"
                        title="Hapus transaksi"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-100 space-y-3 bg-rose-50/50">
            {expenseData.length > 0 && (
              <div className="flex justify-between items-center px-2 py-2 bg-white rounded-xl border border-rose-200/50">
                <p className="text-xs font-semibold text-slate-600">Total Pengeluaran</p>
                <p className="text-sm font-bold text-rose-600">{formatRupiah(totalExpense)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setIsExpenseModalOpen(true)} className="flex-1 bg-rose-600 text-white py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-rose-700 active:scale-[0.98] transition-all shadow-sm shadow-rose-600/20">
                <Plus size={18} strokeWidth={2.5} /> Tambah
              </button>
              <button
                onClick={() => handleExport('expense')}
                className="px-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Download size={16} /> Excel
              </button>
            </div>
          </div>
        </div>

      </div>

      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false);
          setEditingId(null);
        }}
      />
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingId(null);
        }}
        editingId={editingId}
        editingData={transactions.find(t => t.id === editingId)}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        title="Hapus Transaksi?"
        description="Transaksi yang dihapus tidak dapat dipulihkan. Pastikan Anda yakin ingin menghapus data ini."
        itemName={deleteConfirm.name}
        isLoading={isLoading}
      />

    </div>
  );
}