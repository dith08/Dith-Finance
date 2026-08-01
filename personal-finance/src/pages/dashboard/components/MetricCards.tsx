import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

interface MetricCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalTargetSaving: number;
}

export default function MetricCards({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  totalTargetSaving
}: MetricCardsProps) {

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const metrics = [
    { title: 'Saldo Saat Ini', value: formatRupiah(totalBalance), icon: <Wallet className="text-blue-600" size={22} />, bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Pemasukan', value: formatRupiah(monthlyIncome), icon: <TrendingUp className="text-emerald-600" size={22} />, bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Pengeluaran', value: formatRupiah(monthlyExpense), icon: <TrendingDown className="text-rose-600" size={22} />, bg: 'bg-rose-50', border: 'border-rose-100' },
    { title: 'Target Saving', value: formatRupiah(totalTargetSaving), icon: <PiggyBank className="text-yellow-400" size={22} />, bg: 'bg-yellow-50', border: 'border-yellow-100' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full font-sans">
      {metrics.map((item, index) => (
        <div
          key={index}
          className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 duration-300"
        >
          <div className={`p-3.5 rounded-2xl border shrink-0 ${item.bg} ${item.border}`}>
            {item.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-slate-500 text-xs sm:text-sm font-semibold mb-1 truncate">{item.title}</h3>
            <p className="text-slate-900 text-xl sm:text-2xl font-bold tracking-tight truncate" title={item.value}>
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}