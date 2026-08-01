import { useState, useEffect } from 'react';
import { X, Target, Crosshair, Save, Calendar, Tag, Loader2 } from 'lucide-react';
import { useSavingStore } from '../../../store/savingStore';

interface TargetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialName?: string;
}

export default function TargetFormModal({ isOpen, onClose, mode = 'create', initialName = '' }: TargetFormModalProps) {
  const { addSavingGoal, isLoading } = useSavingStore();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState('gadget');
  const [deadline, setDeadline] = useState('');


  useEffect(() => {
    if (isOpen) {
      setTitle(mode === 'edit' ? initialName : '');
      setTargetAmount('');
      setCategory('gadget');
      setDeadline('');
    }
  }, [isOpen, mode, initialName]);

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

    const numTargetAmount = Number(targetAmount.replace(/\./g, ''));

    if (!title.trim() || !numTargetAmount || !deadline) {
      alert('Nama Target, Budget, dan Deadline wajib diisi dengan benar.');
      return;
    }

    if (mode === 'create') {
      const success = await addSavingGoal({
        title,
        target_amount: numTargetAmount,
        category,
        deadline,
      });

      if (success) {
        onClose();
      } else {
        alert('Gagal menyimpan target baru. Periksa koneksi Anda.');
      }
    }
  };

  const modalTitle = mode === 'create' ? 'Set Target Baru' : `Edit Target: ${initialName}`;

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
              <Target size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate" title={modalTitle}>{modalTitle}</h2>
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
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Nama Target</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Crosshair size={18} />
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Beli Laptop ROG"
                required
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-11 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-normal text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Target Budget (Harga)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <span className="font-semibold text-sm">Rp</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={targetAmount}
                onChange={(e) => setTargetAmount(formatRupiah(e.target.value))}
                placeholder="0"
                required
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-11 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-normal text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">Kategori</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Tag size={16} />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-8 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer text-sm sm:text-base"
                >
                  <option value="gadget">Gadget / Elektronik</option>
                  <option value="kendaraan">Kendaraan</option>
                  <option value="properti">Properti</option>
                  <option value="liburan">Liburan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">Tenggat Waktu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar size={16} />
                </div>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-col-reverse sm:flex-row gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all text-sm sm:text-base disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
            >
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Save size={18} /> Simpan Target</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

const ChevronDown = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);