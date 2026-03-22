import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

export default function RoleSelect() {
  const { setRole, t } = useApp();
  const nav = useNavigate();

  const select = (r: 'customer' | 'barber') => {
    setRole(r);
    if (r === 'customer') nav('/customer/auth');
    else nav('/barber/auth');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-4xl">✂️</span>
        </div>
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Line Free</h1>
        <p className="text-text-dim text-sm mt-1">{t('role.select')}</p>
      </div>

      <div className="w-full space-y-3 max-w-xs">
        <button
          onClick={() => select('customer')}
          className="w-full p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all flex items-center gap-4 active:scale-[0.98] group"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-3xl">👤</span>
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-lg">{t('role.customer')}</p>
            <p className="text-text-dim text-sm">Book token, skip the line</p>
          </div>
          <span className="text-text-dim">→</span>
        </button>

        <button
          onClick={() => select('barber')}
          className="w-full p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all flex items-center gap-4 active:scale-[0.98] group"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-3xl">💈</span>
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-lg">{t('role.barber')}</p>
            <p className="text-text-dim text-sm">Manage your salon queue</p>
          </div>
          <span className="text-text-dim">→</span>
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 flex gap-6 text-center">
        <div>
          <p className="text-xl font-extrabold gradient-text">500+</p>
          <p className="text-text-dim text-[10px]">Salons</p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <p className="text-xl font-extrabold gradient-text">10K+</p>
          <p className="text-text-dim text-[10px]">Customers</p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <p className="text-xl font-extrabold gradient-text">4.8⭐</p>
          <p className="text-text-dim text-[10px]">Rating</p>
        </div>
      </div>

      <button onClick={() => nav('/')} className="mt-8 text-text-dim text-sm hover:text-primary transition-colors">
        ← Change Language
      </button>
    </div>
  );
}
