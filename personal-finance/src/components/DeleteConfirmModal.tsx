import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans sm:p-0">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-start border-b border-red-100 bg-red-50/50 shrink-0">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-red-100/80 rounded-xl text-red-600 shrink-0 mt-0.5">
              <AlertTriangle size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{description}</p>
              {itemName && (
                <p className="text-xs sm:text-sm font-semibold text-red-600 mt-2 break-words">
                  "{itemName}"
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 rounded-full transition-all focus:outline-none disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-5 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 sm:py-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white font-semibold py-2.5 sm:py-3 rounded-xl hover:bg-red-700 active:scale-[0.98] shadow-sm shadow-red-600/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              'Hapus Permanen'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
