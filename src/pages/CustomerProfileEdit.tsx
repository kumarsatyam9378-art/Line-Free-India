import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BottomNav from '../components/BottomNav';
import BackButton from '../components/BackButton';

export default function CustomerProfileEdit() {
  const { user, customerProfile, saveCustomerProfile, signOutUser, allSalons, isFavorite, theme, toggleTheme, t } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState(customerProfile?.name || '');
  const [phone, setPhone] = useState(customerProfile?.phone || '');
  const [location, setLocation] = useState(customerProfile?.location || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!customerProfile) return;
    await saveCustomerProfile({
      ...customerProfile,
      name: name || customerProfile.name,
      phone: phone || '',
      location: location || '',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await signOutUser();
    nav('/', { replace: true });
  };

  const favCount = allSalons.filter(s => isFavorite(s.uid)).length;

  return (
    <div className="min-h-screen pb-24 animate-fadeIn">
      <div className="p-6">
        <BackButton to="/customer/home" />
        <h1 className="text-2xl font-bold mb-5">{t('profile')}</h1>

        {/* Profile Card */}
        <div className="text-center mb-6 p-5 rounded-2xl glass-card">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-card-2 ring-3 ring-primary/30">
            {(customerProfile?.photoURL || user?.photoURL) ? (
              <img src={customerProfile?.photoURL || user?.photoURL || ''} className="w-20 h-20 object-cover" alt="" />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center text-4xl">👤</div>
            )}
          </div>
          <p className="font-bold text-lg">{name || user?.displayName || 'Customer'}</p>
          <p className="text-text-dim text-sm">{user?.email}</p>
          
          {/* Stats Grid */}
          <div className="flex gap-4 mt-4 justify-center">
            <div className="text-center">
              <p className="text-xl font-bold gradient-text">{favCount}</p>
              <p className="text-text-dim text-[10px]">Favorites</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="text-xl font-bold gradient-text">{customerProfile?.subscription ? '⭐' : '—'}</p>
              <p className="text-text-dim text-[10px]">Plan</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.name')}</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.phone')}</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" type="tel" placeholder="+91 XXXXXXXXXX" />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.location')}</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="input-field" placeholder="Your city" />
          </div>

          <button onClick={handleSave} className={`${saved ? 'btn-accent' : 'btn-primary'} transition-all`}>
            {saved ? '✅ Saved!' : t('btn.save')}
          </button>

          {/* Quick Links */}
          <div className="space-y-2 mt-2">
            <button onClick={() => nav('/customer/subscription')} className="w-full p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98]">
              <span className="text-lg">⭐</span>
              <span className="text-sm font-medium flex-1 text-left">{t('subscription')}</span>
              <span className="text-text-dim text-xs">{customerProfile?.subscription || 'Free'} →</span>
            </button>
            <button onClick={() => nav('/customer/hairstyles')} className="w-full p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98]">
              <span className="text-lg">💇</span>
              <span className="text-sm font-medium flex-1 text-left">{t('hairstyles')}</span>
              <span className="text-text-dim text-xs">Explore →</span>
            </button>
            <button onClick={() => nav('/customer/tokens')} className="w-full p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98]">
              <span className="text-lg">🎫</span>
              <span className="text-sm font-medium flex-1 text-left">{t('tokens')}</span>
              <span className="text-text-dim text-xs">View →</span>
            </button>
            <button onClick={toggleTheme} className="w-full p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98]">
              <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span className="text-sm font-medium flex-1 text-left">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${theme === 'light' ? 'bg-success' : 'bg-card-2'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'light' ? 'translate-x-4' : ''}`} />
              </div>
            </button>
          </div>

          {/* Share / Refer */}
          <button
            onClick={() => {
              const text = `Hey! Skip the long queue at salons. Download Line Free — get tokens in advance! 🎫✂️`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="btn-whatsapp"
          >
            📲 Refer Friends & Earn
          </button>

          <button onClick={handleLogout} className="w-full p-3 rounded-xl border border-danger/30 text-danger text-sm font-medium mt-2">
            {t('auth.logout')}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
