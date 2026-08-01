import { TrendingUp, Crown } from 'lucide-react';

interface BusinessSummaryProps {
  totalProfit: number;
  topPerformer: string;
}

export default function BusinessSummary({
  totalProfit,
  topPerformer
}: BusinessSummaryProps) {

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <div className="lg:col-span-1 flex flex-col gap-5 sm:gap-6 w-full font-sans">

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 sm:p-8 rounded-3xl flex flex-col justify-center text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group min-h-[160px] sm:min-h-[180px]">
        <TrendingUp
          className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-all duration-500"
          size={140}
        />

        <div className="relative z-10">
          <h3 className="text-blue-100 text-xs sm:text-sm font-semibold mb-1.5 uppercase tracking-wider">Total Profit Bisnis</h3>
          <p className="text-3xl sm:text-4xl font-extrabold drop-shadow-md truncate" title={formatRupiah(totalProfit)}>
            {formatRupiah(totalProfit)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow min-h-[140px] sm:min-h-[160px]">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 sm:p-2.5 bg-amber-50 rounded-xl text-amber-500 border border-amber-100 shadow-sm">
            <Crown size={20} strokeWidth={2.5} />
          </div>
          <h3 className="text-slate-500 text-xs sm:text-sm font-semibold uppercase tracking-wider">Top Performa</h3>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-slate-800 truncate" title={topPerformer}>
          {topPerformer}
        </p>
      </div>

    </div>
  );
}