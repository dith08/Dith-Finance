import { useState, useEffect } from 'react';
import { X, TrendingUp, Activity, Wallet, AlignLeft, BarChart3, Save, Loader2, CalendarDays, Flame } from 'lucide-react';
import { useBusinessStore } from '../../../store/businessStore';

interface BusinessDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  editingId?: string | null;
  editingData?: {
    id: string;
    business_id: string;
    user_id: string;
    record_date: string;
    gross_revenue: number;
    operational_cost: number;
    burn_rate: number;
    cash_balance: number;
    evaluation_note: string | null;
    created_at?: string;
  };
}

export default function BusinessDataModal({ isOpen, onClose, title, editingId, editingData }: BusinessDataModalProps) {
  const addMetric = useBusinessStore((state) => state.addMetric);
  const updateMetric = useBusinessStore((state) => state.updateMetric);
  const selectedBusinessId = useBusinessStore((state) => state.selectedBusinessId);
  const isLoading = useBusinessStore((state) => state.isLoading);

  const currentMetrics = useBusinessStore((state) => state.currentMetrics);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    grossRevenue: '',
    operationalCost: '',
    burnRate: '',
    cashBalance: '',
    evaluationNote: '',
    recordDate: getTodayDate()
  });

  const formatRupiahInput = (value: string) => {
    const rawValue = value.replace(/\D/g, '');
    if (!rawValue) return '';
    return parseInt(rawValue, 10)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  useEffect(() => {
    if (isOpen) {
      if (editingId && editingData) {
        setFormData({
          grossRevenue: formatRupiahInput(editingData.gross_revenue.toString()),
          operationalCost: formatRupiahInput(editingData.operational_cost.toString()),
          burnRate: formatRupiahInput(editingData.burn_rate.toString()),
          cashBalance: formatRupiahInput(editingData.cash_balance.toString()),
          evaluationNote: editingData.evaluation_note || '',
          recordDate: editingData.record_date.split('T')[0]
        });
      } else {
        const latest = currentMetrics.length > 0 ? currentMetrics[0] : null;

        if (latest) {
          setFormData({
            grossRevenue: formatRupiahInput(latest.gross_revenue.toString()),
            operationalCost: formatRupiahInput(latest.operational_cost.toString()),
            burnRate: formatRupiahInput(latest.burn_rate.toString()),
            cashBalance: formatRupiahInput(latest.cash_balance.toString()),
            evaluationNote: '',
            recordDate: getTodayDate()
          });
        } else {
          setFormData({
            grossRevenue: '',
            operationalCost: '',
            burnRate: '',
            cashBalance: '',
            evaluationNote: '',
            recordDate: getTodayDate()
          });
        }
      }
    }
  }, [editingId, editingData, isOpen, currentMetrics]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedBusinessId && !editingId) {
      alert('Error: Tidak ada bisnis yang dipilih. Silakan pilih bisnis dari menu dropdown terlebih dahulu.');
      return;
    }

    const numGross = Number(formData.grossRevenue.replace(/\./g, ''));
    const numOpCost = Number(formData.operationalCost.replace(/\./g, ''));
    const numBurn = Number(formData.burnRate.replace(/\./g, ''));
    const numCash = Number(formData.cashBalance.replace(/\./g, ''));

    if (isNaN(numGross) || isNaN(numOpCost) || isNaN(numBurn) || isNaN(numCash) || !formData.recordDate) {
      alert('Semua kolom angka dan tanggal wajib diisi dengan format yang benar.');
      return;
    }

    const metricData = {
      business_id: editingId ? editingData!.business_id : selectedBusinessId!,
      record_date: formData.recordDate,
      gross_revenue: numGross,
      operational_cost: numOpCost,
      burn_rate: numBurn,
      cash_balance: numCash,
      evaluation_note: formData.evaluationNote || null
    };

    let success = false;
    if (editingId) {
      success = await updateMetric(editingId, metricData);
    } else {
      success = await addMetric(metricData);
    }

    if (success) {
      onClose();
    } else {
      alert('Gagal menyimpan data metrik. Periksa koneksi Anda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans sm:p-0">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        <div className="px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-center border-b border-blue-100 bg-blue-50/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100/80 rounded-xl text-blue-600">
              <BarChart3 size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">{editingId ? 'Edit Data Metrik' : title}</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Evaluasi dan catat performa metrik bisnis.</p>
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 overflow-y-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">Pendapatan Kotor</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <TrendingUp size={18} className="text-emerald-500" />
                  <span className="font-semibold text-sm ml-2 text-slate-700">Rp</span>
                </div>
                <input
                  type="text" inputMode="numeric"
                  value={formData.grossRevenue}
                  onChange={(e) => setFormData({ ...formData, grossRevenue: formatRupiahInput(e.target.value) })}
                  placeholder="0" required
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-16 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">Operasional</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Activity size={18} className="text-rose-500" />
                  <span className="font-semibold text-sm ml-2 text-slate-700">Rp</span>
                </div>
                <input
                  type="text" inputMode="numeric"
                  value={formData.operationalCost}
                  onChange={(e) => setFormData({ ...formData, operationalCost: formatRupiahInput(e.target.value) })}
                  placeholder="0" required
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-16 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">Burn Rate / Hari</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Flame size={18} className="text-orange-500" />
                  <span className="font-semibold text-sm ml-2 text-slate-700">Rp</span>
                </div>
                <input
                  type="text" inputMode="numeric"
                  value={formData.burnRate}
                  onChange={(e) => setFormData({ ...formData, burnRate: formatRupiahInput(e.target.value) })}
                  placeholder="0" required
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-16 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">Cash Balance (Kas Tersedia)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Wallet size={18} className="text-blue-500" />
                  <span className="font-semibold text-sm ml-2 text-slate-700">Rp</span>
                </div>
                <input
                  type="text" inputMode="numeric"
                  value={formData.cashBalance}
                  onChange={(e) => setFormData({ ...formData, cashBalance: formatRupiahInput(e.target.value) })}
                  placeholder="0" required
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-16 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-normal text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 my-1" />

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Tanggal Rekam</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CalendarDays size={18} />
              </div>
              <input
                type="date"
                max={getTodayDate()}
                value={formData.recordDate}
                onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                required
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700">Catatan Evaluasi</label>
            <div className="relative">
              <div className="absolute top-3.5 left-0 pl-3.5 pointer-events-none text-slate-400">
                <AlignLeft size={18} />
              </div>
              <textarea
                rows={3}
                value={formData.evaluationNote}
                onChange={(e) => setFormData({ ...formData, evaluationNote: e.target.value })}
                placeholder="Tuliskan evaluasi performa bulan ini..."
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none text-sm sm:text-base"
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
              className="flex-1 bg-[#1a8cd8] text-white font-semibold py-3 rounded-xl hover:bg-blue-600 active:scale-[0.98] shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {editingId ? 'Update Data' : 'Simpan Data'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}