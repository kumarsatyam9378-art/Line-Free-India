import { useState, useEffect } from 'react';
import { useApp, TokenEntry } from '../store/AppContext';
import BottomNav from '../components/BottomNav';

export default function BarberCustomers() {
  const { user, getSalonTokens, nextCustomer, getTodayEarnings, t } = useApp();
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  const loadTokens = async () => {
    if (!user) return;
    const t = await getSalonTokens(user.uid, today);
    t.sort((a, b) => a.tokenNumber - b.tokenNumber);
    setTokens(t);
    setLoading(false);
    const e = await getTodayEarnings();
    setEarnings(e);
  };

  useEffect(() => { loadTokens(); const iv = setInterval(loadTokens, 5000); return () => clearInterval(iv); }, [user]);

  const handleNext = async () => {
    await nextCustomer();
    await loadTokens();
  };

  const waitingTokens = tokens.filter(t => t.status === 'waiting');
  const servingToken = tokens.find(t => t.status === 'serving');
  const doneTokens = tokens.filter(t => t.status === 'done');

  return (
    <div className="min-h-screen pb-24 animate-fadeIn">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-1">{t('queue.customers')}</h1>
        <p className="text-text-dim text-sm mb-4">{t('today')} · {waitingTokens.length} waiting</p>

        {/* Earnings Summary */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 p-3 rounded-xl glass-card text-center">
            <p className="text-lg font-bold gradient-text-gold">₹{earnings}</p>
            <p className="text-text-dim text-[9px]">{t('earnings')}</p>
          </div>
          <div className="flex-1 p-3 rounded-xl glass-card text-center">
            <p className="text-lg font-bold text-success">{doneTokens.length}</p>
            <p className="text-text-dim text-[9px]">Served</p>
          </div>
          <div className="flex-1 p-3 rounded-xl glass-card text-center">
            <p className="text-lg font-bold text-warning">{waitingTokens.length}</p>
            <p className="text-text-dim text-[9px]">{t('queue.waiting')}</p>
          </div>
        </div>

        <button onClick={loadTokens} className="mb-4 text-primary text-sm font-medium">🔄 Refresh</button>

        {/* Next Customer Button */}
        <button
          onClick={handleNext}
          disabled={waitingTokens.length === 0 && !servingToken}
          className="w-full p-5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg mb-5 disabled:opacity-40 transition-all active:scale-[0.98]"
        >
          {servingToken ? `✅ Done #${servingToken.tokenNumber} → ${t('queue.next')}` : `▶️ ${t('queue.next')}`}
        </button>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Currently Serving */}
            {servingToken && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-success mb-2">✂️ Currently Serving</h3>
                <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">#{servingToken.tokenNumber} · {servingToken.customerName}</p>
                      <p className="text-sm text-text-dim">{servingToken.selectedServices.map(s => s.name).join(', ')}</p>
                      <p className="text-sm">~{servingToken.totalTime}min · ₹{servingToken.totalPrice}</p>
                    </div>
                    {servingToken.customerPhone && (
                      <a href={`tel:${servingToken.customerPhone}`} className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg">
                        📞
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Waiting Queue */}
            {waitingTokens.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-warning mb-2">⏳ Waiting ({waitingTokens.length})</h3>
                <div className="space-y-2">
                  {waitingTokens.map((token, i) => (
                    <div key={token.id} className="p-3 rounded-xl bg-card border border-border flex items-center gap-3 animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {token.tokenNumber}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{token.customerName}</p>
                        <p className="text-text-dim text-xs">{token.selectedServices.map(s => s.name).join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">₹{token.totalPrice}</p>
                        <p className="text-xs text-text-dim">~{token.totalTime}min</p>
                      </div>
                      {token.customerPhone && (
                        <a href={`tel:${token.customerPhone}`} className="text-primary text-sm">📞</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Done */}
            {doneTokens.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text-dim mb-2">✅ Done ({doneTokens.length})</h3>
                <div className="space-y-2">
                  {doneTokens.map(token => (
                    <div key={token.id} className="p-3 rounded-xl bg-card border border-border flex items-center gap-3 opacity-50">
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center font-bold text-success">
                        {token.tokenNumber}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{token.customerName}</p>
                      </div>
                      <p className="text-sm">₹{token.totalPrice}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tokens.length === 0 && (
              <div className="text-center py-10">
                <span className="text-5xl block mb-3 animate-float">👥</span>
                <p className="text-text-dim font-medium">No customers yet today</p>
                <p className="text-text-dim text-xs mt-1">Open your salon to start receiving tokens</p>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
