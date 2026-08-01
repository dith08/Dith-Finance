import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit, FileSpreadsheet, Activity, DollarSign, Wallet, TrendingUp, Store, DownloadCloud, Loader2, Trash2, CalendarDays } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import BusinessEntityModal from './components/BusinessEntityModal';
import BusinessDataModal from './components/BusinessDataModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { useBusinessStore } from '../../store/businessStore';

export default function Business() {
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);

  const [exportingType, setExportingType] = useState<'all' | 'single' | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; businessId: string | null; businessName: string }>({
    isOpen: false,
    businessId: null,
    businessName: '',
  });

  const {
    businesses,
    currentMetrics,
    selectedBusinessId,
    setSelectedBusiness,
    fetchBusinesses,
    fetchMetricsByBusiness,
    isLoading,
    deleteBusiness
  } = useBusinessStore();

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (selectedBusinessId && fetchMetricsByBusiness) {
      fetchMetricsByBusiness(selectedBusinessId);
    }
  }, [selectedBusinessId, fetchMetricsByBusiness]);

  const handleDeleteBusiness = async () => {
    if (!selectedBusinessId) return;
    setDeleteConfirm({
      isOpen: true,
      businessId: selectedBusinessId,
      businessName: activeBusiness?.name || 'Entitas Bisnis',
    });
  };

  const handleConfirmDeleteBusiness = async () => {
    if (deleteConfirm.businessId) {
      await deleteBusiness(deleteConfirm.businessId);
    }
  };

  const activeBusiness = businesses.find(b => b.id === selectedBusinessId) || null;

  const sortedMetrics = [...currentMetrics].sort((a, b) => {
    const dateA = new Date(a.record_date).getTime();
    const dateB = new Date(b.record_date).getTime();

    if (dateA === dateB) {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    }

    return dateB - dateA;
  });

  const latestMetric = sortedMetrics.length > 0 ? sortedMetrics[0] : null;

  const grossRevenue = latestMetric ? Number(latestMetric.gross_revenue) : 0;
  const operationalCost = latestMetric ? Number(latestMetric.operational_cost) : 0;
  const cashBalance = latestMetric ? Number(latestMetric.cash_balance) : 0;
  const burnRate = latestMetric ? Number(latestMetric.burn_rate) : 0;

  const profit = grossRevenue - operationalCost;
  const profitMargin = grossRevenue > 0 ? ((profit / grossRevenue) * 100).toFixed(1) : '0.0';

  let cashStatus = "Belum Ada Data";
  if (latestMetric) {
    cashStatus = profit > 0 ? "Positif Sehat" : profit < 0 ? "Negatif (Rugi)" : "Titik Impas (BEP)";
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleExport = async (type: 'all' | 'single') => {
    setExportingType(type);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Personal Finance App';
      workbook.created = new Date();

      const styleHeader = (worksheet: ExcelJS.Worksheet, headers: string[]) => {
        const headerRow = worksheet.addRow(headers);
        headerRow.height = 32;
        headerRow.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        headerRow.eachCell((cell) => { cell.border = { bottom: { style: 'medium', color: { argb: 'FF0F172A' } } }; });
      };

      const styleDataRow = (row: ExcelJS.Row, isAlternate: boolean) => {
        row.height = 24;
        row.font = { name: 'Segoe UI', size: 11, color: { argb: 'FF334155' } };
        row.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        row.eachCell((cell) => { cell.border = { bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } } }; });
        if (isAlternate) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      };

      const sheetOptions = { views: [{ showGridLines: false }] };

      if (type === 'all') {
        if (businesses.length === 0) {
          alert('Tidak ada entitas bisnis terdaftar.');
          setExportingType(null); return;
        }

        const storeState = useBusinessStore.getState() as any;
        if (!storeState.getAllBusinessMetrics) {
          alert("Error: Fungsi getAllBusinessMetrics belum diimplementasikan di businessStore.");
          setExportingType(null); return;
        }

        const allMetrics = await storeState.getAllBusinessMetrics();

        if (!allMetrics || allMetrics.length === 0) {
          alert('Data metrik kosong untuk semua bisnis.');
          setExportingType(null); return;
        }

        const masterSheet = workbook.addWorksheet('Master Data Bisnis', sheetOptions);
        masterSheet.columns = [
          { key: 'nama', width: 25 },
          { key: 'tanggal', width: 18 },
          { key: 'pendapatan', width: 22, style: { numFmt: 'Rp #,##0' } },
          { key: 'operasional', width: 22, style: { numFmt: 'Rp #,##0' } },
          { key: 'profit', width: 22, style: { numFmt: 'Rp #,##0' } },
          { key: 'balance', width: 22, style: { numFmt: 'Rp #,##0' } },
          { key: 'burn', width: 22, style: { numFmt: 'Rp #,##0' } },
          { key: 'catatan', width: 45 }
        ];

        styleHeader(masterSheet, ['Nama Bisnis', 'Tanggal Rekam', 'Pendapatan (Rp)', 'Operasional (Rp)', 'Net Profit (Rp)', 'Cash Balance (Rp)', 'Burn Rate (Rp)', 'Catatan']);

        allMetrics.forEach((m: any, index: number) => {
          const businessName = businesses.find(b => b.id === m.business_id)?.name || 'Unknown Business';
          const p = Number(m.gross_revenue) - Number(m.operational_cost);

          const row = masterSheet.addRow([
            businessName,
            new Date(m.record_date).toLocaleDateString('id-ID'),
            Number(m.gross_revenue),
            Number(m.operational_cost),
            p,
            Number(m.cash_balance),
            Number(m.burn_rate),
            m.evaluation_note || '-'
          ]);

          styleDataRow(row, index % 2 === 0);
          const profitCell = row.getCell(5);
          if (p > 0) profitCell.font = { name: 'Segoe UI', color: { argb: 'FF059669' }, bold: true };
          else if (p < 0) profitCell.font = { name: 'Segoe UI', color: { argb: 'FFE11D48' }, bold: true };
        });

        businesses.forEach(b => {
          const bMetrics = allMetrics
            .filter((m: any) => m.business_id === b.id)
            .sort((x: any, y: any) => {
              const dX = new Date(x.record_date).getTime();
              const dY = new Date(y.record_date).getTime();
              if (dX === dY) {
                const tX = x.created_at ? new Date(x.created_at).getTime() : 0;
                const tY = y.created_at ? new Date(y.created_at).getTime() : 0;
                return tY - tX;
              }
              return dY - dX;
            });

          if (bMetrics.length > 0) {
            const safeSheetName = b.name.substring(0, 31).replace(/[\[\]\*\\\/\?]/g, '');
            const detailSheet = workbook.addWorksheet(safeSheetName, sheetOptions);

            detailSheet.columns = [
              { key: 'tanggal', width: 18 },
              { key: 'pendapatan', width: 22, style: { numFmt: 'Rp #,##0' } },
              { key: 'operasional', width: 22, style: { numFmt: 'Rp #,##0' } },
              { key: 'profit', width: 22, style: { numFmt: 'Rp #,##0' } },
              { key: 'balance', width: 22, style: { numFmt: 'Rp #,##0' } }
            ];

            styleHeader(detailSheet, ['Tanggal Rekam', 'Pendapatan', 'Operasional', 'Net Profit', 'Cash Balance']);

            bMetrics.forEach((m: any, index: number) => {
              const p = Number(m.gross_revenue) - Number(m.operational_cost);
              const row = detailSheet.addRow([
                new Date(m.record_date).toLocaleDateString('id-ID'),
                Number(m.gross_revenue), Number(m.operational_cost), p, Number(m.cash_balance)
              ]);
              styleDataRow(row, index % 2 === 0);

              const profitCell = row.getCell(4);
              if (p > 0) profitCell.font = { name: 'Segoe UI', color: { argb: 'FF059669' }, bold: true };
              else if (p < 0) profitCell.font = { name: 'Segoe UI', color: { argb: 'FFE11D48' }, bold: true };
            });
          }
        });

      } else {
        if (sortedMetrics.length === 0 || !activeBusiness) {
          alert('Tidak ada data metrik untuk entitas ini.');
          setExportingType(null); return;
        }

        const safeSheetName = `Metrik - ${activeBusiness.name.substring(0, 20)}`.replace(/[\[\]\*\\\/\?]/g, '');
        const metricsSheet = workbook.addWorksheet(safeSheetName, sheetOptions);

        metricsSheet.columns = [
          { key: 'tanggal', width: 18 },
          { key: 'pendapatan', width: 22, style: { numFmt: 'Rp #,##0' } },
          { key: 'operasional', width: 22, style: { numFmt: 'Rp #,##0' } },
          { key: 'profit', width: 22, style: { numFmt: 'Rp #,##0' } },
          { key: 'balance', width: 22, style: { numFmt: 'Rp #,##0' } },
          { key: 'burn', width: 22, style: { numFmt: 'Rp #,##0' } },
          { key: 'catatan', width: 45 }
        ];

        styleHeader(metricsSheet, ['Tanggal Rekam', 'Pendapatan (Rp)', 'Operasional (Rp)', 'Net Profit (Rp)', 'Cash Balance (Rp)', 'Burn Rate (Rp)', 'Catatan Evaluasi']);

        sortedMetrics.forEach((m, index) => {
          const p = Number(m.gross_revenue) - Number(m.operational_cost);
          const row = metricsSheet.addRow([
            new Date(m.record_date).toLocaleDateString('id-ID'),
            Number(m.gross_revenue), Number(m.operational_cost), p, Number(m.cash_balance), Number(m.burn_rate), m.evaluation_note || '-'
          ]);

          styleDataRow(row, index % 2 === 0);
          const profitCell = row.getCell(4);
          if (p > 0) profitCell.font = { name: 'Segoe UI', color: { argb: 'FF059669' }, bold: true };
          else if (p < 0) profitCell.font = { name: 'Segoe UI', color: { argb: 'FFE11D48' }, bold: true };
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = type === 'all'
        ? `Laporan_Master_Semua_Bisnis_${dateStr}.xlsx`
        : `Laporan_${activeBusiness?.name.replace(/\s+/g, '_')}_${dateStr}.xlsx`;

      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);

    } catch (error) {
      alert("Terjadi kesalahan saat mengekspor data.");
      console.error(error);
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-8 font-sans animate-in fade-in duration-500">

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a8cd8] tracking-tight">Bisnis</h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">Pantau ringkasan bisnis harian.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-5 bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm w-full">
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto min-w-0">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100 shrink-0">
            {isLoading && businesses.length === 0 ? <Loader2 size={24} className="animate-spin" /> : <Store size={24} strokeWidth={2} />}
          </div>
          <div className="min-w-0 flex-1 relative">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Entitas Aktif</p>
            <div className="relative group flex items-center gap-2 hover:opacity-80 transition-opacity">
              <select
                value={selectedBusinessId || ''}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                disabled={businesses.length === 0}
                className="appearance-none font-bold text-slate-900 text-base sm:text-xl bg-transparent outline-none cursor-pointer pr-6 truncate w-full"
              >
                {businesses.length === 0 ? (
                  <option value="">Tidak ada bisnis terdaftar</option>
                ) : (
                  businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-0 text-slate-400 pointer-events-none group-hover:text-blue-600 transition-colors shrink-0" size={18} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto mt-2 md:mt-0 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={handleDeleteBusiness}
            disabled={!selectedBusinessId || isLoading}
            className="p-3 bg-white border border-rose-200 text-rose-500 rounded-2xl hover:bg-rose-50 hover:text-rose-700 transition-all shadow-sm shrink-0 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            title="Hapus Bisnis"
          >
            <Trash2 size={18} />
          </button>

          <button
            onClick={() => { setModalMode('edit'); setIsEntityModalOpen(true); }}
            disabled={!selectedBusinessId || isLoading}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Edit Nama Bisnis"
          >
            <Edit size={18} />
          </button>

          <button
            onClick={() => { setModalMode('add'); setIsEntityModalOpen(true); }}
            className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 px-3.5 sm:px-5 py-3 rounded-2xl font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm text-xs sm:text-base whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Tambah Bisnis</span>
          </button>

          <button
            onClick={() => handleExport('all')}
            disabled={exportingType !== null || businesses.length === 0}
            className="flex-1 sm:flex-none bg-slate-800 text-white px-3.5 sm:px-5 py-3 rounded-2xl font-semibold hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm text-xs sm:text-base whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingType === 'all' ? <Loader2 size={18} className="animate-spin" /> : <DownloadCloud size={18} />}
            <span>{exportingType === 'all' ? 'Mengekspor...' : 'Export Semua'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Performa Finansial (Terbaru)</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {latestMetric ? `Data tercatat: ${formatDate(latestMetric.record_date)}` : 'Belum ada data metrik diinput.'}
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-500 text-white flex items-center justify-center text-xl sm:text-2xl font-bold font-serif rounded-2xl shadow-sm shrink-0 uppercase">
            {activeBusiness ? activeBusiness.name.charAt(0) : '?'}
          </div>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { title: 'Pendapatan Kotor', value: formatRupiah(grossRevenue), icon: <TrendingUp className="text-emerald-500" size={18} />, bg: 'bg-emerald-50' },
              { title: 'Operasional', value: formatRupiah(operationalCost), icon: <Activity className="text-rose-500" size={18} />, bg: 'bg-rose-50' },
              { title: 'Profit', value: formatRupiah(profit), icon: <DollarSign className="text-blue-500" size={18} />, bg: 'bg-blue-50' },
              { title: 'Cash Balance', value: formatRupiah(cashBalance), icon: <Wallet className="text-amber-500" size={18} />, bg: 'bg-amber-50' },
            ].map((item, idx) => (
              <div key={idx} className="p-5 border border-slate-100 rounded-2xl flex flex-col bg-white shadow-sm hover:border-slate-200 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 truncate">{item.title}</span>
                  <div className={`p-2 rounded-xl shrink-0 ${item.bg}`}>
                    {item.icon}
                  </div>
                </div>
                <span className={`text-lg sm:text-xl font-bold mt-auto truncate ${item.title === 'Profit' && profit < 0 ? 'text-rose-600' : 'text-slate-900'}`} title={item.value}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div className={`border p-4 sm:p-5 rounded-2xl flex flex-col justify-center ${profit > 0 ? 'bg-blue-50/50 border-blue-100' : profit < 0 ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50/50 border-slate-100'}`}>
              <span className={`text-xs sm:text-sm font-semibold mb-1 ${profit > 0 ? 'text-blue-600' : profit < 0 ? 'text-rose-600' : 'text-slate-600'}`}>Status Arus Kas</span>
              <span className="text-base sm:text-lg font-bold text-slate-900">{cashStatus}</span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 sm:p-5 rounded-2xl flex flex-col justify-center">
              <span className="text-xs sm:text-sm font-semibold text-emerald-600 mb-1">Profit Margin (Gross)</span>
              <span className="text-base sm:text-lg font-bold text-slate-900">{profitMargin}%</span>
            </div>
            <div className="bg-rose-50/50 border border-rose-100 p-4 sm:p-5 rounded-2xl flex flex-col justify-center">
              <span className="text-xs sm:text-sm font-semibold text-rose-600 mb-1">Burn Rate / Hari</span>
              <span className="text-base sm:text-lg font-bold text-slate-900">{formatRupiah(burnRate)}</span>
            </div>
          </div>

          {latestMetric?.evaluation_note && (
            <div className="bg-amber-50/50 border border-amber-100 p-4 sm:p-5 rounded-2xl flex flex-col">
              <span className="text-xs sm:text-sm font-semibold text-amber-700 mb-1">Catatan Evaluasi Terbaru:</span>
              <p className="text-sm text-slate-700 italic">"{latestMetric.evaluation_note}"</p>
            </div>
          )}

          {sortedMetrics.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-6">
              <h3 className="text-base font-bold text-slate-800 mb-4">Riwayat Rekaman Metrik</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {sortedMetrics.map(m => {
                  const p = Number(m.gross_revenue) - Number(m.operational_cost);
                  return (
                    <div key={m.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-400">
                          <CalendarDays size={18} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${p > 0 ? 'text-emerald-600' : p < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                            {p > 0 ? '+' : ''}{formatRupiah(p)} (Net Profit)
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{formatDate(m.record_date)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingMetricId(m.id);
                          setIsDataModalOpen(true);
                        }}
                        className="text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors w-full sm:w-auto"
                      >
                        Edit Metrik
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => {
              setEditingMetricId(null);
              setIsDataModalOpen(true);
            }}
            disabled={!selectedBusinessId}
            className="bg-white border border-slate-200 text-blue-600 px-6 py-3 rounded-2xl font-semibold text-sm sm:text-base hover:bg-blue-50 hover:border-blue-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Metrik Baru
          </button>

          <button
            onClick={() => handleExport('single')}
            disabled={exportingType !== null || !selectedBusinessId || sortedMetrics.length === 0}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold text-sm sm:text-base hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingType === 'single' ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
            {exportingType === 'single' ? 'Mengekspor...' : 'Export Entitas Ini'}
          </button>
        </div>
      </div>

      <BusinessEntityModal
        isOpen={isEntityModalOpen}
        onClose={() => setIsEntityModalOpen(false)}
        mode={modalMode}
        businessId={selectedBusinessId}
        initialName={activeBusiness?.name}
      />

      <BusinessDataModal
        isOpen={isDataModalOpen}
        onClose={() => {
          setIsDataModalOpen(false);
          setEditingMetricId(null);
        }}
        title="Input Data Metrik"
        editingId={editingMetricId}
        editingData={currentMetrics.find(m => m.id === editingMetricId)}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Hapus Entitas Bisnis"
        description={`Anda yakin ingin menghapus "${deleteConfirm.businessName}"? Data metrik yang terkait juga akan dihapus permanen.`}
        onConfirm={async () => {
          await handleConfirmDeleteBusiness();
          setDeleteConfirm({ isOpen: false, businessId: null, businessName: '' });
        }}
        onClose={() => setDeleteConfirm({ isOpen: false, businessId: null, businessName: '' })}
      />

    </div>
  );
}