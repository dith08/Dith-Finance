import { useState } from 'react';
import { X, Wallet, Tag, CalendarDays, AlignLeft, Loader2 } from 'lucide-react';
import { useTransactionStore } from '../../../store/transactionStore';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IncomeModal({ isOpen, onClose }: IncomeModalProps) {
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const isLoading = useTransactionStore((state) => state.isLoading);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('gaji');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');

    if (!rawValue) {
      setAmount('');
      return;
    }

    const formatted = parseInt(rawValue, 10)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    setAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount.replace(/\./g, ''));

    if (!numericAmount || !date) {
      alert('Nominal dan Tanggal wajib diisi dengan benar.');
      return;
    }

    const success = await addTransaction({
      amount: numericAmount,
      category,
      date,
      note,
      type: 'income'
    });

    if (success) {
      setAmount('');
      setCategory('gaji');
      setDate('');
      setNote('');
      onClose();
    } else {
      alert('Gagal menyimpan data. Cek koneksi Supabase Anda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans sm:p-0">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        <div className="px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-center border-b border-slate-100/60 bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Tambah Pemasukan</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Catat sumber pendapatan baru Anda.</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 -mr-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 overflow-y-auto">

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Nominal</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <span className="font-semibold text-sm">Rp</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                required
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-11 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 placeholder:font-normal text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">Kategori</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Tag size={18} />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-8 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer text-sm sm:text-base"
                >
                  <option value="gaji">Gaji</option>
                  <option value="freelance">Freelance</option>
                  <option value="bisnis">Pendapatan Bisnis</option>
                  <option value="lainnya">Lainnya</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">Tanggal</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CalendarDays size={18} />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Catatan (Opsional)</label>
            <div className="relative">
              <div className="absolute top-3.5 left-0 pl-3.5 pointer-events-none text-slate-400">
                <AlignLeft size={18} />
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Detail pemasukan tambahan..."
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 resize-none text-sm sm:text-base"
              ></textarea>
            </div>
          </div>

          <div className="mt-2 flex flex-col-reverse sm:flex-row gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all text-sm sm:text-base disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 active:scale-[0.98] shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Wallet size={18} />
                  Simpan Data
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}