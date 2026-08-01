import { useState, useEffect } from 'react';
import { X, UploadCloud, Briefcase, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useBusinessStore } from '../../../store/businessStore';

interface BusinessEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  businessId?: string | null;
  initialName?: string;
}

export default function BusinessEntityModal({ isOpen, onClose, mode, businessId, initialName }: BusinessEntityModalProps) {
  const { addBusiness, updateBusiness, isLoading } = useBusinessStore();

  const [name, setName] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialName) {
        setName(initialName);
      } else {
        setName('');
      }
      setSelectedFileName(null);
    }
  }, [isOpen, mode, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Nama bisnis wajib diisi.');
      return;
    }

    let success = false;

    if (mode === 'add') {
      success = await addBusiness(name, '');
    } else if (mode === 'edit' && businessId) {
      success = await updateBusiness(businessId, name, '');
    }

    if (success) {
      onClose();
    } else {
      alert(`Gagal ${mode === 'add' ? 'menyimpan' : 'memperbarui'} entitas bisnis. Periksa koneksi Anda.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFileName(e.target.files[0].name);
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

        <div className="px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-center border-b border-blue-100 bg-blue-50/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100/80 rounded-xl text-blue-600">
              <Briefcase size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {mode === 'add' ? 'Tambah Bisnis Baru' : 'Edit Nama Bisnis'}
              </h2>
            </div>
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 overflow-y-auto">

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Nama Bisnis</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Briefcase size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Toko Kopi Nusantara"
                required
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-11 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-normal text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Logo Bisnis</label>

            <label className={`relative flex flex-col items-center justify-center w-full p-5 sm:p-6 mt-1 border-2 border-dashed rounded-2xl transition-all cursor-pointer group ${selectedFileName ? 'border-blue-400 bg-blue-50/50' : 'border-slate-300 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-300'}`}>
              <div className="flex flex-col items-center justify-center gap-2 text-slate-500 group-hover:text-blue-600 transition-colors">

                {selectedFileName ? (
                  <>
                    <div className="p-3 bg-blue-100 rounded-full shadow-sm border border-blue-200">
                      <CheckCircle2 size={24} className="text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-semibold text-blue-700 truncate max-w-[200px]">{selectedFileName}</p>
                      <p className="text-[11px] sm:text-xs text-blue-500/70 mt-1">Klik untuk mengganti logo</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100 group-hover:border-blue-200">
                      <UploadCloud size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-semibold">Klik untuk unggah logo</p>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-1">SVG, PNG, atau JPG (Maks. 2MB)</p>
                    </div>
                  </>
                )}

              </div>
              <input
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
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
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}