import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface CashFlowChartProps {
  data: {
    name: string;
    pemasukan: number;
    pengeluaran: number;
  }[];
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
  const formatTooltipValue = (value: any) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col w-full h-full font-sans">

      {/* Header Grafik & Legenda */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-800">Arus Kas (30 Hari Terakhir)</h2>
        <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
          <span className="flex items-center gap-2 text-emerald-600">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>Pemasukan
          </span>
          <span className="flex items-center gap-2 text-rose-600">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div>Pengeluaran
          </span>
        </div>
      </div>

      <div className="w-full h-[260px] sm:h-[300px] mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>

            <defs>
              <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-5}
              tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}k`}
            />

            <Tooltip
              formatter={formatTooltipValue}
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                fontWeight: 600
              }}
            />

            <Area
              type="monotone"
              dataKey="pemasukan"
              stroke="#10B981"
              strokeWidth={3}
              fill="url(#colorPemasukan)"
              fillOpacity={1}
            />

            <Area
              type="monotone"
              dataKey="pengeluaran"
              stroke="#F43F5E"
              strokeWidth={3}
              fill="url(#colorPengeluaran)"
              fillOpacity={1}
            />

          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}