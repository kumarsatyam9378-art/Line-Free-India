import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';

export default function BottomNav() {
  const { role, t } = useApp();
  const nav = useNavigate();
  const loc = useLocation();

  if (role === 'customer') {
    const tabs = [
      { path: '/customer/home', label: t('home'), icon: '🏠' },
      { path: '/customer/search', label: t('search'), icon: '🔍' },
      { path: '/customer/tokens', label: t('tokens'), icon: '🎫' },
      { path: '/customer/hairstyles', label: t('hairstyles'), icon: '💇' },
      { path: '/customer/profile', label: t('profile'), icon: '👤' },
    ];
    return (
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] glass-strong z-50">
        <div className="flex justify-around items-center py-2 px-1">
          {tabs.map(tab => {
            const active = loc.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => nav(tab.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
                  active ? 'text-primary' : 'text-text-dim hover:text-text'
                }`}
              >
                {active && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-primary" />
                )}
                <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>{tab.icon}</span>
                <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (role === 'barber') {
    const tabs = [
      { path: '/barber/home', label: t('home'), icon: '🏠' },
      { path: '/barber/customers', label: t('queue'), icon: '👥' },
      { path: '/barber/messages', label: 'Messages', icon: '💬' },
      { path: '/barber/subscription', label: t('subscription'), icon: '⭐' },
      { path: '/barber/profile', label: t('profile'), icon: '👤' },
    ];
    return (
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] glass-strong z-50">
        <div className="flex justify-around items-center py-2 px-1">
          {tabs.map(tab => {
            const active = loc.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => nav(tab.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
                  active ? 'text-primary' : 'text-text-dim hover:text-text'
                }`}
              >
                {active && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-primary" />
                )}
                <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>{tab.icon}</span>
                <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>{tab.label}</span>
                {tab.path === '/barber/messages' && !active && (
                  <div className="absolute top-1 right-2 w-2.5 h-2.5 bg-danger rounded-full border border-card animate-pulse shadow-[0_0_8px_rgba(255,68,68,0.6)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
