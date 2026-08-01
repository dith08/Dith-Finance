import { useState, useEffect } from 'react';
import { PiggyBank, Target, Plus, List, Trash2, Loader2, Inbox } from 'lucide-react';

import TopUpModal from './components/TopUpModal';
import HistoryModal from './components/HistoryModal';
import TargetFormModal from './components/TargetFormModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { useSavingStore } from '../../store/savingStore';

export default function Saving() {
  const [activeModal, setActiveModal] = useState<'topUp' | 'history' | 'targetForm' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedSavingId, setSelectedSavingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; savingId: string | null; targetName: string }>({
    isOpen: false,
    savingId: null,
    targetName: '',
  });

  const { savings, fetchSavings, deleteSavingGoal, isLoading } = useSavingStore();

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  const openModal = (type: 'topUp' | 'history' | 'targetForm', savingId: string | null = null, title: string = '') => {
    setModalTitle(title);
    setSelectedSavingId(savingId);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalTitle('');
    setSelectedSavingId(null);
  };

  const handleDelete = async (id: string, targetName: string) => {
    setDeleteConfirm({
      isOpen: true,
      savingId: id,
      targetName: targetName,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.savingId) {
      await deleteSavingGoal(deleteConfirm.savingId);
    }
  };

  const totalAllSavings = savings.reduce((sum, item) => sum + Number(item.current_amount), 0);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-8 font-sans">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Tabungan</h1>
          <p className="text-sm text-slate-500 mt-1">Alokasikan dana darurat dan pantau target impian Anda.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-blue-50 px-5 py-3.5 rounded-2xl border border-blue-100 flex items-center gap-4">
            <div className="p-2.5 bg-white rounded-xl border border-blue-100 text-blue-600 shadow-sm">
              {isLoading && savings.length === 0 ? <Loader2 size={24} className="animate-spin" /> : <PiggyBank size={24} />}
            </div>
            <div>
              <p className="text-blue-600/70 text-xs font-bold uppercase tracking-wider mb-0.5">Total Terkumpul</p>
              <p className="text-blue-900 text-lg sm:text-xl font-extrabold">
                {formatRupiah(totalAllSavings)}
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal('targetForm', null, 'Set Target Baru')}
            className="bg-indigo-600 text-white px-5 py-3.5 sm:py-0 h-full sm:min-h-[64px] rounded-2xl font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 whitespace-nowrap focus:outline-none"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Target Baru</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {savings.length === 0 && !isLoading && (
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="p-6 bg-slate-50 rounded-full mb-4 text-slate-400">
              <Inbox size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Belum Ada Target Tabungan</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">Mulai buat target finansial atau dana darurat Anda sekarang.</p>
            <button
              onClick={() => openModal('targetForm', null, 'Set Target Baru')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Plus size={18} /> Buat Target Pertama
            </button>
          </div>
        )}

        {savings.map((saving) => {
          const current = Number(saving.current_amount);
          const target = Number(saving.target_amount);
          const progressPersen = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
          const isCompleted = current >= target;

          return (
            <div key={saving.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col justify-between h-full transition-all hover:shadow-md">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-3 rounded-2xl border shadow-sm shrink-0 ${isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                      <Target size={24} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider capitalize">{saving.category}</h2>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 truncate" title={saving.title}>{saving.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(saving.id, saving.title)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-slate-200 hover:border-rose-100 shadow-sm shrink-0"
                    title="Hapus Target"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                    <span className={isCompleted ? "text-emerald-600" : "text-indigo-600"}>Progres {progressPersen}%</span>
                    <span className="text-slate-400">100%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${progressPersen}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-400 font-medium">Terkumpul</span>
                      <span className={`font-bold mt-0.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-900'}`}>{formatRupiah(current)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-slate-400 font-medium">Target Harga</span>
                      <span className="font-bold text-slate-900 mt-0.5">{formatRupiah(target)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                  onClick={() => openModal('topUp', saving.id, `Top Up: ${saving.title}`)}
                  disabled={isCompleted}
                  className="flex-1 bg-indigo-600 text-white py-3.5 px-6 rounded-2xl font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} strokeWidth={2.5} /> {isCompleted ? 'Target Tercapai' : 'Top Up'}
                </button>
                <button
                  onClick={() => openModal('history', saving.id, `Riwayat: ${saving.title}`)}
                  className="flex-1 bg-white text-slate-700 border border-slate-200 py-3.5 px-6 rounded-2xl font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base"
                >
                  <List size={18} /> Lihat Riwayat
                </button>
              </div>
            </div>
          );
        })}

      </div>

      <TopUpModal
        isOpen={activeModal === 'topUp'}
        onClose={closeModal}
        title={modalTitle}
        savingId={selectedSavingId}
      />
      <HistoryModal
        isOpen={activeModal === 'history'}
        onClose={closeModal}
        title={modalTitle}
        savingId={selectedSavingId}
      />
      <TargetFormModal
        isOpen={activeModal === 'targetForm'}
        onClose={closeModal}
        mode="create"
      />

      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, savingId: null, targetName: '' })}
        onConfirm={handleConfirmDelete}
        title="Hapus Target Tabungan?"
        description="Target tabungan dan seluruh riwayat top-up di dalamnya akan dihapus secara permanen. Tindakan ini tidak dapat dipulihkan."
        itemName={deleteConfirm.targetName}
        isLoading={isLoading}
      />

    </div>
  );
}