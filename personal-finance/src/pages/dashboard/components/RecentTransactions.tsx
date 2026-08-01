import { ArrowUpRight, ArrowDownLeft, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransactionItem {
  id: string;
  note: string;
  category?: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

interface RecentTransactionsProps {
  transactions: TransactionItem[];
}

export default function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
  const navigate = useNavigate();

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col w-full h-full font-sans">

      <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-base sm:text-lg font-bold text-slate-800">Transaksi Terakhir</h2>

        <button
          onClick={() => navigate('/transactions')}
          className="text-xs sm:text-sm text-blue-600 font-bold hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 rounded-lg px-2 py-1"
        >
          Lihat Semua
        </button>
      </div>

      <div className="divide-y divide-slate-100 flex-1 flex flex-col">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 my-auto">
            <Inbox size={40} className="mb-3 opacity-50" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-slate-600">Belum ada transaksi</p>
            <p className="text-xs mt-1">Catatan arus kas Anda akan muncul di sini.</p>
          </div>
        ) : (
          transactions.map((trx) => (
            <div
              key={trx.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className={`p-2.5 sm:p-3 rounded-2xl border shrink-0 ${trx.type === 'income' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                  {trx.type === 'income' ? <ArrowDownLeft size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 truncate" title={trx.note}>
                    {trx.note}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wide truncate">
                    {trx.category || 'Umum'} • {formatDate(trx.date)}
                  </p>
                </div>
              </div>

              <span className={`text-sm sm:text-base font-extrabold shrink-0 whitespace-nowrap ${trx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trx.type === 'income' ? '+' : '-'} {formatRupiah(trx.amount)}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}