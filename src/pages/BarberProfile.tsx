import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, ServiceItem } from '../store/AppContext';
import BottomNav from '../components/BottomNav';
import BackButton from '../components/BackButton';

export default function BarberProfile() {
  const { user, barberProfile, saveBarberProfile, syncPending, signOutUser, theme, toggleTheme, t } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState(barberProfile?.name || '');
  const [salonName, setSalonName] = useState(barberProfile?.salonName || '');
  const [location, setLocation] = useState(barberProfile?.location || '');
  const [phone, setPhone] = useState(barberProfile?.phone || '');
  const [upiId, setUpiId] = useState(barberProfile?.upiId || '');
  const [businessHours, setBusinessHours] = useState(barberProfile?.businessHours || '');
  const [services, setServices] = useState<ServiceItem[]>(barberProfile?.services || []);
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleSave = async () => {
    if (!barberProfile) return;
    await saveBarberProfile({
      ...barberProfile,
      name: name || barberProfile.name,
      salonName: salonName || barberProfile.salonName,
      location: location || '',
      phone: phone || '',
      upiId: upiId || '',
      businessHours: businessHours || '',
      services,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addService = () => {
    if (!newName.trim()) return;
    setServices([...services, { id: Date.now().toString(), name: newName.trim(), price: parseInt(newPrice) || 0, avgTime: parseInt(newTime) || 15 }]);
    setNewName(''); setNewPrice(''); setNewTime(''); setShowAdd(false);
  };

  const removeService = (id: string) => setServices(services.filter(s => s.id !== id));
  const handleLogout = async () => { await signOutUser(); nav('/', { replace: true }); };

  const handleShareWhatsApp = () => {
    const text = `Check out my salon "${salonName}" on Line Free! 💈\n📍 ${location || 'Come visit us!'}\n📞 ${phone || ''}\n\nServices:\n${services.map(s => `• ${s.name} - ₹${s.price}`).join('\n')}\n\nBooking app: Line Free 🎫`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Profile completion %
  const fields = [name, salonName, location, phone, upiId];
  const filled = fields.filter(f => f.trim()).length;
  const completion = Math.round(((filled + (services.length > 0 ? 1 : 0)) / (fields.length + 1)) * 100);

  return (
    <div className="min-h-screen pb-24 animate-fadeIn">
      <div className="p-6">
        <BackButton to="/barber/home" />
        <h1 className="text-2xl font-bold mb-5">{t('profile')}</h1>

        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-card-2 ring-2 ring-primary/30">
            {barberProfile?.photoURL ? <img src={barberProfile.photoURL} className="w-20 h-20 object-cover" alt="" /> : <div className="w-20 h-20 flex items-center justify-center text-4xl">💈</div>}
          </div>
          <p className="text-text-dim text-sm">{user?.email}</p>
          {barberProfile?.rating && (
            <p className="text-gold text-sm font-semibold mt-1">⭐ {barberProfile.rating} ({barberProfile.totalReviews || 0} reviews)</p>
          )}
        </div>

        {/* Profile Completion */}
        <div className="mb-5 p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Profile Completion</p>
            <p className="text-sm font-bold gradient-text">{completion}%</p>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
          {completion < 100 && <p className="text-text-dim text-[10px] mt-1.5">Complete your profile to attract more customers!</p>}
        </div>

        {/* Sync indicator */}
        {syncPending && (
          <div className="mb-4 p-2 rounded-lg bg-primary/10 flex items-center gap-2 justify-center">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-primary text-[11px]">Syncing to server...</p>
          </div>
        )}

        <div className="space-y-4 max-w-sm mx-auto">
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.name')}</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.salonName')}</label>
            <input value={salonName} onChange={e => setSalonName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.location')}</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.phone')}</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" type="tel" />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">💳 UPI ID (for receiving payments)</label>
            <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" className="input-field" />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">⏰ Business Hours</label>
            <input value={businessHours} onChange={e => setBusinessHours(e.target.value)} placeholder="e.g. 9:00 AM - 8:00 PM" className="input-field" />
          </div>

          {/* Services */}
          <div>
            <label className="text-sm text-text-dim mb-2 block">{t('services')}</label>
            <div className="space-y-2">
              {services.map(s => (
                <div key={s.id} className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-text-dim text-xs">₹{s.price} · {s.avgTime}min</p>
                  </div>
                  <button onClick={() => removeService(s.id)} className="text-danger text-lg">✕</button>
                </div>
              ))}
            </div>
            {showAdd ? (
              <div className="mt-3 p-4 bg-card rounded-xl border border-border space-y-3 animate-slideUp">
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Service name" className="input-field text-sm" />
                <div className="flex gap-2">
                  <input value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Price ₹" className="input-field text-sm" type="number" />
                  <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="Time (min)" className="input-field text-sm" type="number" />
                </div>
                <div className="flex gap-2">
                  <button onClick={addService} className="btn-primary text-sm py-2">✓ Add</button>
                  <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm py-2">{t('btn.cancel')}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAdd(true)} className="mt-3 w-full p-3 rounded-xl border border-dashed border-primary/50 text-primary text-sm font-medium active:scale-[0.98] transition-transform">
                + {t('services.add')}
              </button>
            )}
          </div>

          <button onClick={handleSave} className={`${saved ? 'btn-accent' : 'btn-primary'} transition-all`}>
            {saved ? '✅ Saved!' : t('btn.save')}
          </button>

          <button onClick={handleShareWhatsApp} className="btn-whatsapp mb-3">
            📲 Share Salon on WhatsApp
          </button>

          <button onClick={toggleTheme} className="w-full p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98]">
            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="text-sm font-medium flex-1 text-left">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${theme === 'light' ? 'bg-success' : 'bg-card-2'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'light' ? 'translate-x-4' : ''}`} />
            </div>
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
