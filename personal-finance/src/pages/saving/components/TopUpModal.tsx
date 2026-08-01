import { useState, useEffect } from 'react';
import { X, PiggyBank, AlignLeft, Save, Loader2 } from 'lucide-react';
import { useSavingStore } from '../../../store/savingStore';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  savingId: string | null;
}

export default function TopUpModal({ isOpen, onClose, title, savingId }: TopUpModalProps) {
  const { topUpSaving, isLoading } = useSavingStore();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatRupiah = (value: string) => {
    const rawValue = value.replace(/\D/g, '');
    if (!rawValue) return '';
    return parseInt(rawValue, 10)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!savingId) {
      alert("Error Sistem: Target tabungan tidak valid.");
      return;
    }

    const numericAmount = Number(amount.replace(/\./g, ''));

    if (!numericAmount || numericAmount <= 0) {
      alert("Nominal top up tidak valid.");
      return;
    }

    const success = await topUpSaving(savingId, numericAmount, note || 'Setoran Tabungan');

    if (success) {
      onClose();
    } else {
      alert('Gagal memproses setoran tabungan. Periksa koneksi Anda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans sm:p-0">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        <div className="px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-center border-b border-indigo-100 bg-indigo-50/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-indigo-100/80 rounded-xl text-indigo-600 shrink-0">
              <PiggyBank size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate" title={title}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 -mr-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 shrink-0 disabled:opacity-50"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 overflow-y-auto">

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Nominal Top Up</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <span className="font-semibold text-sm">Rp</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatRupiah(e.target.value))}
                placeholder="0"
                required
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-11 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-normal text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Catatan Sumber Dana (Opsional)</label>
            <div className="relative">
              <div className="absolute top-3.5 left-0 pl-3.5 pointer-events-none text-slate-400">
                <AlignLeft size={18} />
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Misal: Sisa uang jajan minggu ini..."
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none text-sm sm:text-base"
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
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Memproses...</>
              ) : (
                <><Save size={18} /> Simpan Dana</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}