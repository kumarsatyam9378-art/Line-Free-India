import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BackButton from '../components/BackButton';

export default function CustomerProfileSetup() {
  const { user, saveCustomerProfile, customerProfile, t } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState(customerProfile?.name || user?.displayName || '');
  const [phone, setPhone] = useState(customerProfile?.phone || '');
  const [location, setLocation] = useState(customerProfile?.location || '');

  const handleContinue = async () => {
    const profile = {
      uid: user?.uid || '',
      name: name || user?.displayName || 'Customer',
      phone: phone || '',
      location: location || '',
      photoURL: user?.photoURL || '',
      favoriteSalons: customerProfile?.favoriteSalons || [],
      subscription: customerProfile?.subscription || null,
      createdAt: customerProfile?.createdAt || Date.now(),
    };
    await saveCustomerProfile(profile);
    nav('/customer/home', { replace: true });
  };

  const handleSkip = async () => {
    const profile = {
      uid: user?.uid || '',
      name: user?.displayName || 'Customer',
      phone: '',
      location: '',
      photoURL: user?.photoURL || '',
      favoriteSalons: [],
      subscription: null,
      createdAt: Date.now(),
    };
    await saveCustomerProfile(profile);
    nav('/customer/home', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col p-6 animate-fadeIn">
      <BackButton to="/customer/auth" />
      
      <div className="flex-1 flex flex-col pt-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-card-2 flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-20 h-20 rounded-full object-cover" alt="" />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </div>
          <h1 className="text-xl font-bold">{t('profile.setup')}</h1>
          <p className="text-text-dim text-sm mt-1">All fields are optional</p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto w-full">
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.name')} {t('profile.optional')}</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.phone')} {t('profile.optional')}</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 XXXXXXXXXX"
              className="input-field"
              type="tel"
            />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.location')} {t('profile.optional')}</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Your city or area"
              className="input-field"
            />
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
    </div>
  );
}
