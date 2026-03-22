import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, ServiceItem } from '../store/AppContext';
import BackButton from '../components/BackButton';

export default function BarberProfileSetup() {
  const { user, saveBarberProfile, barberProfile, t } = useApp();
  const nav = useNavigate();
  
  const [name, setName] = useState(barberProfile?.name || user?.displayName || '');
  const [salonName, setSalonName] = useState(barberProfile?.salonName || '');
  const [location, setLocation] = useState(barberProfile?.location || '');
  const [phone, setPhone] = useState(barberProfile?.phone || '');
  const [services, setServices] = useState<ServiceItem[]>(barberProfile?.services || [
    { id: '1', name: 'Hair Cut', price: 100, avgTime: 20 },
    { id: '2', name: 'Hair Cut + Shaving', price: 150, avgTime: 30 },
    { id: '3', name: 'Hair Cut + Shaving + Facial', price: 350, avgTime: 50 },
  ]);
  const [newService, setNewService] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newTime, setNewTime] = useState('');
  const [showAddService, setShowAddService] = useState(false);

  const addService = () => {
    if (!newService.trim()) return;
    const s: ServiceItem = {
      id: Date.now().toString(),
      name: newService.trim(),
      price: parseInt(newPrice) || 0,
      avgTime: parseInt(newTime) || 15,
    };
    setServices([...services, s]);
    setNewService('');
    setNewPrice('');
    setNewTime('');
    setShowAddService(false);
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleContinue = async () => {
    const profile = {
      uid: user?.uid || '',
      name: name || user?.displayName || 'Barber',
      salonName: salonName || 'My Salon',
      location: location || '',
      phone: phone || '',
      photoURL: user?.photoURL || '',
      salonImageURL: barberProfile?.salonImageURL || '',
      services,
      isOpen: barberProfile?.isOpen ?? true,
      isBreak: barberProfile?.isBreak ?? false,
      isStopped: barberProfile?.isStopped ?? false,
      currentToken: barberProfile?.currentToken ?? 0,
      totalTokensToday: barberProfile?.totalTokensToday ?? 0,
      breakStartTime: barberProfile?.breakStartTime ?? null,
      createdAt: barberProfile?.createdAt || Date.now(),
    };
    await saveBarberProfile(profile);
    nav('/barber/home', { replace: true });
  };

  const handleSkip = async () => {
    const profile = {
      uid: user?.uid || '',
      name: user?.displayName || 'Barber',
      salonName: 'My Salon',
      location: '',
      phone: '',
      photoURL: user?.photoURL || '',
      salonImageURL: '',
      services: [
        { id: '1', name: 'Hair Cut', price: 100, avgTime: 20 },
        { id: '2', name: 'Hair Cut + Shaving', price: 150, avgTime: 30 },
      ],
      isOpen: true,
      isBreak: false,
      isStopped: false,
      currentToken: 0,
      totalTokensToday: 0,
      breakStartTime: null,
      createdAt: Date.now(),
    };
    await saveBarberProfile(profile);
    nav('/barber/home', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col p-6 pb-32 animate-fadeIn">
      <BackButton to="/barber/auth" />

      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-card-2 flex items-center justify-center ring-2 ring-primary/30">
          {user?.photoURL ? (
            <img src={user.photoURL} className="w-20 h-20 rounded-full object-cover" alt="" />
          ) : (
            <span className="text-4xl">💈</span>
          )}
        </div>
        <h1 className="text-xl font-bold">{t('profile.setup')}</h1>
        <p className="text-text-dim text-sm mt-1">Setup your salon details</p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto w-full">
        <div>
          <label className="text-sm text-text-dim mb-1 block">{t('profile.name')} {t('profile.optional')}</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-text-dim mb-1 block">{t('profile.salonName')} {t('profile.optional')}</label>
          <input value={salonName} onChange={e => setSalonName(e.target.value)} placeholder="Your salon name" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-text-dim mb-1 block">{t('profile.location')} {t('profile.optional')}</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Salon location" className="input-field" />
        </div>
        <div>
          <label className="text-sm text-text-dim mb-1 block">{t('profile.phone')} {t('profile.optional')}</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" className="input-field" type="tel" />
        </div>

        {/* Services */}
        <div>
          <label className="text-sm text-text-dim mb-2 block">{t('services')} - Add what you offer</label>
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id} className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border">
                <div className="flex-1">
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-text-dim text-xs">₹{s.price} · {s.avgTime} {t('min')}</p>
                </div>
                <button onClick={() => removeService(s.id)} className="text-danger text-lg">✕</button>
              </div>
            ))}
          </div>

          {showAddService ? (
            <div className="mt-3 p-4 bg-card rounded-xl border border-border space-y-3 animate-slideUp">
              <input value={newService} onChange={e => setNewService(e.target.value)} placeholder="Service name (e.g. Facial)" className="input-field text-sm" />
              <div className="flex gap-2">
                <input value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Price ₹" className="input-field text-sm" type="number" />
                <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="Time (min)" className="input-field text-sm" type="number" />
              </div>
              <div className="flex gap-2">
                <button onClick={addService} className="btn-primary text-sm py-2">✓ Add</button>
                <button onClick={() => setShowAddService(false)} className="btn-secondary text-sm py-2">{t('btn.cancel')}</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddService(true)} className="mt-3 w-full p-3 rounded-xl border border-dashed border-primary/50 text-primary text-sm font-medium">
              + {t('services.add')}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-3 max-w-sm mx-auto w-full">
        <button onClick={handleContinue} className="btn-primary">
          {t('btn.continue')} →
        </button>
        <button onClick={handleSkip} className="btn-secondary">
          {t('btn.skip')} →
        </button>
      </div>
    </div>
  );
}
