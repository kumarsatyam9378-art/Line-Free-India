import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BottomNav from '../components/BottomNav';

export default function CustomerHome() {
  const { user, customerProfile, signOutUser, allSalons, isFavorite, t } = useApp();
  const nav = useNavigate();

  const handleLogout = async () => {
    await signOutUser();
    nav('/', { replace: true });
  };

  const openSalons = allSalons.filter(s => s.isOpen && !s.isBreak);
  const topRated = [...allSalons].filter(s => (s.rating || 0) > 0).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  const favSalons = allSalons.filter(s => isFavorite(s.uid));

  // Calculate total queue across all salons
  const totalOpen = openSalons.length;

  return (
    <div className="min-h-screen pb-24 animate-fadeIn">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-text-dim text-sm">Welcome back 👋</p>
            <h1 className="text-2xl font-bold">{customerProfile?.name || user?.displayName || 'Customer'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-card-2 ring-2 ring-primary/30">
              {(customerProfile?.photoURL || user?.photoURL) ? (
                <img src={customerProfile?.photoURL || user?.photoURL || ''} className="w-12 h-12 object-cover" alt="" />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center text-2xl">👤</div>
              )}
            </div>
          </div>
        </div>

        {/* Live Stats */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 p-3 rounded-xl glass-card text-center">
            <p className="text-2xl font-bold gradient-text">{allSalons.length}</p>
            <p className="text-text-dim text-[10px] mt-0.5">Total Salons</p>
          </div>
          <div className="flex-1 p-3 rounded-xl glass-card text-center">
            <p className="text-2xl font-bold text-success">{totalOpen}</p>
            <p className="text-text-dim text-[10px] mt-0.5">Open Now</p>
          </div>
          <div className="flex-1 p-3 rounded-xl glass-card text-center">
            <p className="text-2xl font-bold text-gold">{favSalons.length}</p>
            <p className="text-text-dim text-[10px] mt-0.5">Favorites</p>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button onClick={() => nav('/customer/search')} className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-left transition-all hover:border-primary/40 active:scale-[0.98]">
            <span className="text-2xl mb-1.5 block">🔍</span>
            <p className="font-semibold text-sm">{t('search')}</p>
            <p className="text-text-dim text-[10px] mt-0.5">Find salons nearby</p>
          </button>
          <button onClick={() => nav('/customer/tokens')} className="p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 text-left transition-all hover:border-accent/40 active:scale-[0.98]">
            <span className="text-2xl mb-1.5 block">🎫</span>
            <p className="font-semibold text-sm">{t('tokens')}</p>
            <p className="text-text-dim text-[10px] mt-0.5">View your tokens</p>
          </button>
          <button onClick={() => nav('/customer/hairstyles')} className="p-4 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 text-left transition-all hover:border-gold/40 active:scale-[0.98]">
            <span className="text-2xl mb-1.5 block">💇</span>
            <p className="font-semibold text-sm">{t('hairstyles')}</p>
            <p className="text-text-dim text-[10px] mt-0.5">Explore styles</p>
          </button>
          <button onClick={() => nav('/customer/subscription')} className="p-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 text-left transition-all hover:border-secondary/40 active:scale-[0.98]">
            <span className="text-2xl mb-1.5 block">⭐</span>
            <p className="font-semibold text-sm">{t('subscription')}</p>
            <p className="text-text-dim text-[10px] mt-0.5">Premium features</p>
          </button>
        </div>

        {/* Premium Banner */}
        {!customerProfile?.subscription && (
          <button onClick={() => nav('/customer/subscription')} className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary to-accent mb-5 text-left relative overflow-hidden active:scale-[0.98] transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-3 relative z-10">
              <span className="text-3xl animate-float">👑</span>
              <div>
                <p className="font-bold text-white">Upgrade to Premium</p>
                <p className="text-white/80 text-xs">Wait alerts, advance booking & more!</p>
                <p className="text-gold font-semibold text-xs mt-1">Starting ₹11/month</p>
              </div>
            </div>
          </button>
        )}

        {/* ❤️ Favorite Salons */}
        {favSalons.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-3">❤️ Your Favorites</h2>
            <div className="horizontal-scroll">
              {favSalons.map(salon => (
                <button key={salon.uid} onClick={() => nav(`/customer/salon/${salon.uid}`)} className="w-44 p-3 rounded-2xl bg-card border border-border text-left transition-all hover:border-primary/30 active:scale-[0.97]">
                  <div className="w-full h-20 rounded-xl bg-card-2 overflow-hidden mb-2">
                    {salon.salonImageURL ? <img src={salon.salonImageURL} className="w-full h-20 object-cover" alt="" /> : (
                      <div className="w-full h-20 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20"><span className="text-3xl">💈</span></div>
                    )}
                  </div>
                  <p className="font-semibold text-sm truncate">{salon.salonName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`badge text-[9px] py-0.5 px-1.5 ${salon.isOpen && !salon.isBreak ? 'badge-success' : 'badge-danger'}`}>{salon.isOpen && !salon.isBreak ? 'Open' : 'Closed'}</span>
                    {salon.rating && <span className="text-gold text-[10px]">⭐ {salon.rating}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 🟢 Open Salons */}
        {openSalons.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">🟢 Open Now</h2>
              <button onClick={() => nav('/customer/search')} className="text-primary text-xs font-medium">View All →</button>
            </div>
            <div className="horizontal-scroll">
              {openSalons.slice(0, 8).map(salon => (
                <button key={salon.uid} onClick={() => nav(`/customer/salon/${salon.uid}`)} className="w-44 p-3 rounded-2xl bg-card border border-border text-left transition-all hover:border-primary/30 active:scale-[0.97]">
                  <div className="w-full h-20 rounded-xl bg-card-2 overflow-hidden mb-2">
                    {salon.salonImageURL ? <img src={salon.salonImageURL} className="w-full h-20 object-cover" alt="" /> : (
                      <div className="w-full h-20 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20"><span className="text-3xl">💈</span></div>
                    )}
                  </div>
                  <p className="font-semibold text-sm truncate">{salon.salonName}</p>
                  <p className="text-text-dim text-[10px] truncate">{salon.location || salon.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="badge badge-success text-[9px] py-0.5 px-1.5">Open</span>
                    {salon.rating && <span className="text-gold text-[10px]">⭐ {salon.rating}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ⭐ Top Rated */}
        {topRated.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-3">⭐ Top Rated</h2>
            <div className="horizontal-scroll">
              {topRated.map(salon => (
                <button key={salon.uid} onClick={() => nav(`/customer/salon/${salon.uid}`)} className="w-40 p-3 rounded-2xl premium-card text-left">
                  <div className="w-12 h-12 rounded-full bg-card-2 overflow-hidden mx-auto mb-2">
                    {salon.photoURL ? <img src={salon.photoURL} className="w-12 h-12 object-cover" alt="" /> : <div className="w-12 h-12 flex items-center justify-center text-2xl">💈</div>}
                  </div>
                  <p className="font-semibold text-xs text-center truncate">{salon.salonName}</p>
                  <div className="text-center mt-1">
                    <span className="text-gold text-sm font-bold">⭐ {salon.rating}</span>
                    <span className="text-text-dim text-[9px] ml-1">({salon.totalReviews})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Salons List */}
        {allSalons.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">💈 All Salons</h2>
              <button onClick={() => nav('/customer/search')} className="text-primary text-xs font-medium">See All →</button>
            </div>
            <div className="space-y-2">
              {allSalons.slice(0, 5).map(salon => (
                <button key={salon.uid} onClick={() => nav(`/customer/salon/${salon.uid}`)} className="w-full p-3 rounded-xl bg-card border border-border text-left flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98]">
                  <div className="w-11 h-11 rounded-xl bg-card-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {salon.salonImageURL ? <img src={salon.salonImageURL} className="w-11 h-11 object-cover" alt="" /> : <span className="text-xl">💈</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{salon.salonName || 'Salon'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] badge ${salon.isOpen && !salon.isBreak ? 'badge-success' : salon.isBreak ? 'badge-warning' : 'badge-danger'}`}>
                        {salon.isOpen && !salon.isBreak ? 'Open' : salon.isBreak ? 'Break' : 'Closed'}
                      </span>
                      <span className="text-text-dim text-[10px]">{salon.services?.length || 0} services</span>
                      {salon.rating && <span className="text-gold text-[10px]">⭐{salon.rating}</span>}
                    </div>
                  </div>
                  <span className="text-text-dim text-sm">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="mb-5">
          <h2 className="font-bold text-base mb-3">📋 How it works</h2>
          <div className="space-y-2">
            {[
              { icon: '🔍', title: 'Search Salon', desc: 'Find your favorite salon' },
              { icon: '✅', title: 'Select Services', desc: 'Choose what you want' },
              { icon: '🎫', title: 'Get Token', desc: 'Get your queue number' },
              { icon: '⏰', title: 'Wait Smart', desc: 'Know exact wait time' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="w-9 h-9 rounded-lg bg-card-2 flex items-center justify-center text-lg">{step.icon}</div>
                <div>
                  <p className="font-medium text-xs">{step.title}</p>
                  <p className="text-text-dim text-[10px]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refer & Earn */}
        <button
          onClick={() => {
            const text = `Hey! Skip the long queue at your salon. Use Line Free to get your token in advance! 🎫✂️`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }}
          className="btn-whatsapp mb-5"
        >
          📲 {t('refer')} — Share with Friends
        </button>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full p-3 rounded-xl border border-danger/30 text-danger text-sm font-medium mb-6">
          {t('auth.logout')}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
