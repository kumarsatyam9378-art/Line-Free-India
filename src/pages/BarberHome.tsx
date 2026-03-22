import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, TokenEntry } from '../store/AppContext';
import BottomNav from '../components/BottomNav';

export default function BarberHome() {
  const { barberProfile, user, signOutUser, toggleSalonOpen, toggleSalonBreak, toggleSalonStop, getSalonTokens, getTodayEarnings, isBarberTrialActive, getBarberTrialDaysLeft, isBarberSubscribed, syncPending, t } = useApp();
  const nav = useNavigate();
  const [todayTokens, setTodayTokens] = useState<TokenEntry[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; amount: number }[]>([]);

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  const loadTokens = async () => {
    if (!user) return;
    const t = await getSalonTokens(user.uid, today);
    t.sort((a, b) => a.tokenNumber - b.tokenNumber);
    setTodayTokens(t);
    const e = await getTodayEarnings();
    setEarnings(e);
  };

  const loadWeeklyStats = async () => {
    if (!user) return;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      days.push({ date: dateStr, name: d.toLocaleDateString('en', { weekday: 'short' }) });
    }
    
    const weekly = await Promise.all(days.map(async d => {
      try {
        const tks = await getSalonTokens(user.uid, d.date);
        const dailyEarn = tks.filter(t => t.status === 'done').reduce((a, c) => a + c.totalPrice, 0);
        return { day: d.name, amount: dailyEarn };
      } catch {
        return { day: d.name, amount: 0 };
      }
    }));
    setWeeklyData(weekly);
  };

  useEffect(() => {
    loadTokens();
    loadWeeklyStats();
    const iv = setInterval(loadTokens, 5000); 
    const ivWeekly = setInterval(loadWeeklyStats, 30000); // refresh weekly stats every 30s
    return () => { clearInterval(iv); clearInterval(ivWeekly); };
  }, [user]);

  const handleLogout = async () => {
    await signOutUser();
    nav('/', { replace: true });
  };

  const bp = barberProfile;
  if (!bp) return null;

  const waitingCount = todayTokens.filter(t => t.status === 'waiting').length;
  const doneCount = todayTokens.filter(t => t.status === 'done').length;
  const servingToken = todayTokens.find(t => t.status === 'serving');
  const cancelledCount = todayTokens.filter(t => t.status === 'cancelled').length;
  const trialDays = getBarberTrialDaysLeft();
  const trialActive = isBarberTrialActive();
  const subscribed = isBarberSubscribed();

  return (
    <div className="min-h-screen pb-24 animate-fadeIn">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-text-dim text-sm">👋 Welcome</p>
            <h1 className="text-2xl font-bold">{bp.salonName || 'My Salon'}</h1>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-card-2 ring-2 ring-primary/30">
            {bp.photoURL ? <img src={bp.photoURL} className="w-12 h-12 object-cover" alt="" /> : <div className="w-12 h-12 flex items-center justify-center text-2xl">💈</div>}
          </div>
        </div>

        {/* Background sync indicator — subtle, non-blocking */}
        {syncPending && (
          <div className="mb-3 p-2 rounded-lg bg-primary/10 flex items-center gap-2 justify-center">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-primary text-[11px]">Syncing profile...</p>
          </div>
        )}

        {/* Trial / Subscription Banner */}
        {trialActive ? (
          <div className="p-3 rounded-xl bg-success/10 border border-success/30 mb-4 flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div className="flex-1">
              <p className="text-success font-semibold text-sm">{t('trial.active')}</p>
              <p className="text-text-dim text-xs">{trialDays} days left in free trial</p>
            </div>
            <div className="text-right">
              <div className="progress-bar w-16">
                <div className="progress-fill" style={{ width: `${(trialDays / 30) * 100}%` }} />
              </div>
            </div>
          </div>
        ) : !subscribed ? (
          <button
            onClick={() => nav('/barber/subscription')}
            className="w-full p-3 rounded-xl bg-danger/10 border border-danger/30 mb-4 flex items-center gap-3 text-left"
          >
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-danger font-semibold text-sm">{t('trial.expired')}</p>
              <p className="text-text-dim text-xs">Subscribe at ₹100/month to continue</p>
            </div>
            <span className="text-primary text-sm font-medium">Subscribe →</span>
          </button>
        ) : null}

        {/* Status Card */}
        <div className={`p-5 rounded-2xl mb-5 ${
          !bp.isOpen ? 'bg-gradient-to-br from-danger/20 to-danger/5 border border-danger/20' :
          bp.isBreak ? 'bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20' :
          'bg-gradient-to-br from-success/20 to-success/5 border border-success/20'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${!bp.isOpen ? 'bg-danger' : bp.isBreak ? 'bg-warning animate-pulse' : 'bg-success animate-pulse'}`} />
            <span className="font-bold text-lg">
              {!bp.isOpen ? t('salon.closed') : bp.isBreak ? t('salon.onBreak') : t('salon.isOpen')}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="stat-card">
              <p className="text-xl font-bold text-primary animate-countUp">{servingToken?.tokenNumber || '-'}</p>
              <p className="text-[9px] text-text-dim mt-0.5">{t('queue.current')}</p>
            </div>
            <div className="stat-card">
              <p className="text-xl font-bold text-warning animate-countUp">{waitingCount}</p>
              <p className="text-[9px] text-text-dim mt-0.5">{t('queue.waiting')}</p>
            </div>
            <div className="stat-card">
              <p className="text-xl font-bold text-success animate-countUp">{doneCount}</p>
              <p className="text-[9px] text-text-dim mt-0.5">Done</p>
            </div>
            <div className="stat-card">
              <p className="text-xl font-bold gradient-text-gold animate-countUp">₹{earnings}</p>
              <p className="text-[9px] text-text-dim mt-0.5">{t('earnings')}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={toggleSalonOpen}
            className={`p-4 rounded-2xl font-medium flex flex-col items-center gap-2 transition-all active:scale-[0.97] ${
              bp.isOpen ? 'bg-danger/20 border border-danger/30 text-danger' : 'bg-success/20 border border-success/30 text-success'
            }`}
          >
            <span className="text-2xl">{bp.isOpen ? '🔴' : '🟢'}</span>
            <span className="text-sm">{bp.isOpen ? t('salon.close') : t('salon.open')}</span>
          </button>

          <button
            onClick={toggleSalonBreak}
            disabled={!bp.isOpen}
            className={`p-4 rounded-2xl font-medium flex flex-col items-center gap-2 transition-all active:scale-[0.97] ${
              bp.isBreak ? 'bg-success/20 border border-success/30 text-success' : 'bg-warning/20 border border-warning/30 text-warning'
            } disabled:opacity-30`}
          >
            <span className="text-2xl">{bp.isBreak ? '▶️' : '⏸️'}</span>
            <span className="text-sm">{bp.isBreak ? t('salon.endBreak') : t('salon.break')}</span>
          </button>

          <button
            onClick={toggleSalonStop}
            disabled={!bp.isOpen}
            className={`p-4 rounded-2xl font-medium flex flex-col items-center gap-2 transition-all active:scale-[0.97] ${
              bp.isStopped ? 'bg-primary/20 border border-primary/30 text-primary' : 'bg-card border border-border text-text'
            } disabled:opacity-30`}
          >
            <span className="text-2xl">{bp.isStopped ? '▶️' : '⏹️'}</span>
            <span className="text-sm">{bp.isStopped ? t('queue.continue') : t('queue.stop')}</span>
          </button>

          <button
            onClick={() => nav('/barber/customers')}
            className="p-4 rounded-2xl font-medium flex flex-col items-center gap-2 bg-primary/20 border border-primary/30 text-primary transition-all active:scale-[0.97]"
          >
            <span className="text-2xl">👥</span>
            <span className="text-sm">{t('queue.customers')}</span>
          </button>
        </div>

        {/* Currently Serving */}
        {servingToken && (
          <div className="p-4 rounded-2xl bg-success/10 border border-success/30 mb-5 animate-slideUp">
            <p className="text-sm text-success font-medium mb-2">✂️ Currently Serving</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">Token #{servingToken.tokenNumber}</p>
                <p className="text-text-dim text-sm">{servingToken.customerName}</p>
                <p className="text-text-dim text-xs">{servingToken.selectedServices.map(s => s.name).join(', ')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold gradient-text">₹{servingToken.totalPrice}</p>
                <p className="text-text-dim text-xs">~{servingToken.totalTime}min</p>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Summary */}
        <div className="p-4 rounded-2xl glass-card mb-5">
          <h3 className="font-semibold text-sm mb-3">📊 Today's Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-card-2/50">
              <p className="text-text-dim text-[10px]">Total Customers</p>
              <p className="text-lg font-bold">{doneCount + (servingToken ? 1 : 0)}</p>
            </div>
            <div className="p-3 rounded-xl bg-card-2/50">
              <p className="text-text-dim text-[10px]">Revenue</p>
              <p className="text-lg font-bold gradient-text-gold">₹{earnings}</p>
            </div>
            <div className="p-3 rounded-xl bg-card-2/50">
              <p className="text-text-dim text-[10px]">In Queue</p>
              <p className="text-lg font-bold text-warning">{waitingCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-card-2/50">
              <p className="text-text-dim text-[10px]">Cancelled</p>
              <p className="text-lg font-bold text-danger">{cancelledCount}</p>
            </div>
          </div>
        </div>

        {/* Weekly Earnings Chart */}
        {weeklyData.length > 0 && (
          <div className="p-4 rounded-2xl bg-card border border-border mb-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm">📈 7-Day Revenue</h3>
              <p className="text-xs text-text-dim">₹{weeklyData.reduce((a,c) => a+c.amount, 0)} Total</p>
            </div>
            <div className="flex items-end justify-between h-24 gap-1">
              {weeklyData.map((d, i) => {
                const max = Math.max(...weeklyData.map(w => w.amount), 1);
                const height = Math.max(10, (d.amount / max) * 100);
                const isToday = i === 6;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="w-full relative flex justify-center h-full items-end pb-1">
                      <div 
                        className={`w-full max-w-[24px] rounded-t-sm transition-all duration-500 ${isToday ? 'bg-gradient-to-t from-primary/50 to-primary' : 'bg-card-2'}`}
                        style={{ height: `${height}%` }}
                      >
                        {/* Tooltip on hover/active */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-text text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          ₹{d.amount}
                        </div>
                      </div>
                    </div>
                    <p className={`text-[9px] mt-1 ${isToday ? 'font-bold text-primary' : 'text-text-dim'}`}>{d.day}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer History */}
        {doneCount > 0 && (
          <div className="mb-5">
            <h3 className="font-semibold text-sm mb-3">✅ Recent Customers</h3>
            <div className="space-y-2">
              {todayTokens.filter(t => t.status === 'done').slice(-5).reverse().map(token => (
                <div key={token.id} className="p-3 rounded-xl bg-card border border-border flex justify-between items-center opacity-80">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      <span className="text-text-dim text-xs">#{token.tokenNumber}</span>
                      {token.customerName}
                    </p>
                    <p className="text-text-dim text-[10px] mt-0.5">{token.selectedServices.map(s => s.name).join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success text-sm">+₹{token.totalPrice}</p>
                    <p className="text-text-dim text-[10px]">Today</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        {bp.rating && (
          <div className="p-4 rounded-2xl bg-gold/5 border border-gold/20 mb-5 flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">⭐ {bp.rating}</p>
              <p className="text-text-dim text-[10px]">{bp.totalReviews || 0} reviews</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Your Salon Rating</p>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${((bp.rating || 0) / 5) * 100}%`, background: 'linear-gradient(90deg, #FFD93D, #FFA500)' }} />
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout} className="w-full p-3 rounded-xl border border-danger/30 text-danger text-sm font-medium">
          {t('auth.logout')}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
