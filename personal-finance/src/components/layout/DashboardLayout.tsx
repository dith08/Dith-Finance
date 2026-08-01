import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Building2, PiggyBank, } from 'lucide-react';

export default function DashboardLayout() {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Transaksi', path: '/transactions', icon: <CreditCard size={20} /> },
    { name: 'Bisnis', path: '/business', icon: <Building2 size={20} /> },
    { name: 'Saving', path: '/saving', icon: <PiggyBank size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#cde4f7] overflow-hidden font-sans">

      <aside className="hidden md:flex flex-col w-64 bg-[#1a8cd8] text-white shadow-2xl z-20 shrink-0">
        <div className="p-6 text-2xl font-bold mb-6 tracking-tight">
          DithFinance
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-white text-[#1a8cd8] font-bold shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        <header className="md:hidden bg-[#1a8cd8] text-white p-4 font-bold text-xl shadow-sm z-10 shrink-0">
          DithFinance
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </div>

        <nav className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 py-3 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20 pb-safe">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full p-2 rounded-xl transition-all ${isActive
                  ? 'text-[#1a8cd8] scale-110'
                  : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] font-bold mt-1">{item.name}</span>
            </NavLink>
          ))}
        </nav>

      </main>
    </div>
  );
}