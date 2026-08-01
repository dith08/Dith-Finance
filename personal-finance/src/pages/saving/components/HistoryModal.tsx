import { useEffect } from 'react';
import { X, Calendar, History, Inbox, ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { useSavingStore } from '../../../store/savingStore';
interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  savingId: string | null;
}

export default function HistoryModal({ isOpen, onClose, title, savingId }: HistoryModalProps) {
  const { currentHistory, fetchSavingHistory, isLoading } = useSavingStore();

  useEffect(() => {
    if (isOpen && savingId) {
      fetchSavingHistory(savingId);
    }
  }, [isOpen, savingId, fetchSavingHistory]);

  if (!isOpen) return null;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans sm:p-0">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        <div className="px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-slate-200/50 rounded-xl text-slate-600 shrink-0">
              <History size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate" title={title}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 shrink-0"
            aria-label="Tutup modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 flex flex-col gap-3 min-h-[250px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full py-12">
              <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          ) : currentHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
              <div className="p-4 bg-slate-50 rounded-full mb-3 text-slate-400">
                <Inbox size={40} strokeWidth={1.5} />
              </div>
              <p className="text-slate-800 font-semibold text-sm sm:text-base">Belum Ada Riwayat</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Rekam jejak pengisian tabungan Anda akan muncul di sini.</p>
            </div>
          ) : (
            currentHistory.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center gap-3 p-3.5 sm:p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all group"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className={`p-2.5 rounded-xl shrink-0 ${item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {item.type === 'income' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate" title={item.note || 'Transaksi'}>{item.note || 'Transaksi'}</p>
                    <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5 mt-1 truncate">
                      <Calendar size={12} className="text-slate-400 shrink-0" /> {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>

                <span className={`font-bold text-sm sm:text-base shrink-0 whitespace-nowrap ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.type === 'income' ? '+' : '-'}{formatRupiah(item.amount)}
                </span>
              </div>
            ))
          )}
        </div>

        {currentHistory.length > 0 && !isLoading && (
          <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-center text-xs text-slate-500 font-medium">
            Menampilkan {currentHistory.length} data riwayat
          </div>
        )}

      </div>
    </div>
  );
}