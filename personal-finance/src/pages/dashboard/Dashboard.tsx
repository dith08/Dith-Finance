import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import MetricCards from './components/MetricCards';
import CashFlowChart from './components/CashFlowChart';
import BusinessSummary from './components/BusinessSummary';
import RecentTransactions from './components/RecentTransactions';

import { useTransactionStore } from '../../store/transactionStore';
import { useBusinessStore } from '../../store/businessStore';
import { useSavingStore } from '../../store/savingStore';

export default function Dashboard() {
  const [isMounting, setIsMounting] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const { transactions, fetchTransactions } = useTransactionStore();
  const { businesses, currentMetrics, fetchBusinesses, fetchMetricsByBusiness } = useBusinessStore();
  const { savings, fetchSavings } = useSavingStore();

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchTransactions(),
        fetchBusinesses(),
        fetchSavings()
      ]);
      setTimeout(() => setIsMounting(false), 300);
    };
    loadAllData();
  }, [fetchTransactions, fetchBusinesses, fetchSavings]);

  useEffect(() => {
    if (businesses.length > 0) {
      fetchMetricsByBusiness(businesses[0].id);
    }
  }, [businesses, fetchMetricsByBusiness]);



  let calculatedTotalBalance = 0;
  let calculatedMonthlyIncome = 0;
  let calculatedMonthlyExpense = 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  transactions.forEach(t => {
    const amount = Number(t.amount);
    const trxDate = new Date(t.date);

    if (t.type === 'income') {
      calculatedTotalBalance += amount;
    } else {
      calculatedTotalBalance -= amount;
    }

    if (trxDate.getMonth() === currentMonth && trxDate.getFullYear() === currentYear) {
      if (t.type === 'income') {
        calculatedMonthlyIncome += amount;
      } else {
        calculatedMonthlyExpense += amount;
      }
    }
  });

  const recentTrxData = transactions.slice(0, 5).map(t => ({
    id: t.id,
    note: t.note,
    category: t.category,
    amount: Number(t.amount),
    type: t.type,
    date: t.date
  }));

  const generateChartData = () => {
    const dataMap: Record<string, { pemasukan: number; pengeluaran: number }> = {};
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dataMap[dateStr] = { pemasukan: 0, pengeluaran: 0 };
    }

    transactions.forEach(t => {
      if (dataMap[t.date]) {
        if (t.type === 'income') dataMap[t.date].pemasukan += Number(t.amount);
        else dataMap[t.date].pengeluaran += Number(t.amount);
      }
    });

    return Object.keys(dataMap).map(dateKey => {
      const dateObj = new Date(dateKey);
      return {
        name: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
        pemasukan: dataMap[dateKey].pemasukan,
        pengeluaran: dataMap[dateKey].pengeluaran
      };
    });
  };

  let totalBusinessProfit = 0;
  let topBusinessName = "Belum Ada Bisnis";

  if (currentMetrics.length > 0) {
    const latestMetric = currentMetrics[0];
    totalBusinessProfit = Number(latestMetric.gross_revenue) - Number(latestMetric.operational_cost);
    topBusinessName = businesses.find(b => b.id === latestMetric.business_id)?.name || "Unknown";
  }

  const totalTargetSaving = savings.reduce((sum, item) => sum + Number(item.target_amount), 0);

  const handleExportAll = async () => {
    setIsExporting(true);
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

        headerRow.eachCell((cell) => {
          cell.border = { bottom: { style: 'medium', color: { argb: 'FF0F172A' } } };
        });
      };

      const styleDataRow = (row: ExcelJS.Row, isAlternate: boolean) => {
        row.height = 24;
        row.font = { name: 'Segoe UI', size: 11, color: { argb: 'FF334155' } };
        row.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

        row.eachCell((cell) => {
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } } };
        });

        if (isAlternate) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      };

      const sheetOptions = { views: [{ showGridLines: false }] };

      const summarySheet = workbook.addWorksheet('Ringkasan', sheetOptions);
      summarySheet.columns = [
        { key: 'metrik', width: 35 },
        { key: 'nilai', width: 25, style: { numFmt: 'Rp #,##0' } },
        { key: 'ket', width: 45 }
      ];

      styleHeader(summarySheet, ['Metrik Utama', 'Nominal (Rp)', 'Keterangan']);

      const summaryData = [
        ['Total Saldo Kas', calculatedTotalBalance, 'Akumulasi seluruh transaksi berjalan'],
        ['Pemasukan (Bulan Ini)', calculatedMonthlyIncome, 'Filter kalender bulan ini'],
        ['Pengeluaran (Bulan Ini)', calculatedMonthlyExpense, 'Filter kalender bulan ini'],
        ['Total Target Tabungan', totalTargetSaving, 'Agregasi seluruh objektif tabungan'],
        ['Profit Bisnis (Tertinggi)', totalBusinessProfit, `Dihasilkan oleh entitas: ${topBusinessName}`]
      ];

      summaryData.forEach((rowData, index) => {
        const row = summarySheet.addRow(rowData);
        styleDataRow(row, index % 2 === 0);

        row.getCell(1).font = { name: 'Segoe UI', bold: true, color: { argb: 'FF0F172A' } };
      });

      const trxSheet = workbook.addWorksheet('Arus Kas', sheetOptions);
      trxSheet.columns = [
        { key: 'tanggal', width: 18 },
        { key: 'tipe', width: 18 },
        { key: 'kategori', width: 25 },
        { key: 'nominal', width: 25, style: { numFmt: 'Rp #,##0' } },
        { key: 'catatan', width: 50 }
      ];

      styleHeader(trxSheet, ['Tanggal', 'Tipe Aliran', 'Kategori', 'Nominal (Rp)', 'Catatan Transaksi']);

      transactions.forEach((t, index) => {
        const row = trxSheet.addRow([
          t.date,
          t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          t.category || 'Umum',
          Number(t.amount),
          t.note || '-'
        ]);

        styleDataRow(row, index % 2 === 0);

        const typeCell = row.getCell(2);
        const amountCell = row.getCell(4);
        if (t.type === 'income') {
          typeCell.font = { name: 'Segoe UI', color: { argb: 'FF059669' }, bold: true };
          amountCell.font = { name: 'Segoe UI', color: { argb: 'FF059669' }, bold: true };
        } else {
          typeCell.font = { name: 'Segoe UI', color: { argb: 'FFE11D48' }, bold: true };
          amountCell.font = { name: 'Segoe UI', color: { argb: 'FFE11D48' }, bold: true };
        }
      });

      const savingSheet = workbook.addWorksheet('Tabungan', sheetOptions);
      savingSheet.columns = [
        { key: 'nama', width: 30 },
        { key: 'kategori', width: 20 },
        { key: 'terkumpul', width: 25, style: { numFmt: 'Rp #,##0' } },
        { key: 'target', width: 25, style: { numFmt: 'Rp #,##0' } },
        { key: 'progres', width: 15, style: { numFmt: '0"%"' }, alignment: { horizontal: 'center' } },
        { key: 'status', width: 18 }
      ];

      styleHeader(savingSheet, ['Tujuan Tabungan', 'Kategori', 'Terkumpul (Rp)', 'Target Nominal (Rp)', 'Progres', 'Status']);

      savings.forEach((s, index) => {
        const current = Number(s.current_amount);
        const target = Number(s.target_amount);
        const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
        const isCompleted = current >= target;

        const row = savingSheet.addRow([
          s.title, s.category, current, target, progress, isCompleted ? 'Tercapai' : 'Proses'
        ]);

        styleDataRow(row, index % 2 === 0);

        if (isCompleted) {
          row.getCell(6).font = { name: 'Segoe UI', color: { argb: 'FF059669' }, bold: true };
        } else {
          row.getCell(6).font = { name: 'Segoe UI', color: { argb: 'FFD97706' }, bold: true };
        }
      });

      if (businesses.length > 0) {
        const businessSheet = workbook.addWorksheet('Daftar Bisnis', sheetOptions);
        businessSheet.columns = [
          { key: 'nama', width: 35 },
          { key: 'id', width: 45 }
        ];
        styleHeader(businessSheet, ['Entitas Bisnis Terdaftar', 'ID Referensi Sistem']);

        businesses.forEach((b, index) => {
          const row = businessSheet.addRow([b.name, b.id]);
          styleDataRow(row, index % 2 === 0);
          row.getCell(1).font = { name: 'Segoe UI', bold: true, color: { argb: 'FF0F172A' } };
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const dateStr = new Date().toISOString().split('T')[0];
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Laporan_Finansial_Clean_${dateStr}.xlsx`);

    } catch (error) {
      alert("Gagal mengekspor data. Periksa konsol untuk detail.");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isMounting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-[#1a8cd8]" />
        <p className="text-slate-500 font-semibold animate-pulse">Menyelaraskan Data Keuangan...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full pb-8 font-sans animate-in fade-in duration-500">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a8cd8] tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">Pantau ringkasan finansial harian.</p>
        </div>
      </div>

      <MetricCards
        totalBalance={calculatedTotalBalance}
        monthlyIncome={calculatedMonthlyIncome}
        monthlyExpense={calculatedMonthlyExpense}
        totalTargetSaving={totalTargetSaving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <CashFlowChart data={generateChartData()} />
        <BusinessSummary
          totalProfit={totalBusinessProfit}
          topPerformer={topBusinessName}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <RecentTransactions transactions={recentTrxData} />

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-l-4 border-[#1a8cd8] shadow-sm flex-1 flex items-center">
            <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
              "Keuangan yang sehat bukan dibangun dari penghasilan besar, tetapi dari kebiasaan kecil yang dilakukan secara konsisten setiap hari."
            </p>
          </div>
          <button
            onClick={handleExportAll}
            disabled={isExporting || (transactions.length === 0 && savings.length === 0 && businesses.length === 0)}
            className="w-full bg-[#1a8cd8] text-white flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold hover:bg-[#146baf] active:scale-[0.98] transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {isExporting ? 'Memproses Ekspor...' : 'Export Semua Data'}
          </button>
        </div>
      </div>

    </div>
  );
}