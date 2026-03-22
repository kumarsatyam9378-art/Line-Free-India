import { useState, useEffect } from 'react';
import { useApp, TokenEntry } from '../store/AppContext';
import BottomNav from '../components/BottomNav';

type EnrichedToken = TokenEntry & {
  liveQueuePos?: number;
  liveServingNumber?: number | '-';
};

export default function CustomerTokens() {
  const { user, getCustomerTokens, getSalonTokens, cancelToken, t } = useApp();
  const [tokens, setTokens] = useState<EnrichedToken[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTokens = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const myTokens = await getCustomerTokens(user.uid);
      myTokens.sort((a, b) => b.tokenNumber - a.tokenNumber);

      // Enhance with live queue data for active tokens
      const enriched = await Promise.all(
        myTokens.map(async (token) => {
          if (token.status === 'waiting') {
            try {
              const allTokens = await getSalonTokens(token.salonId, token.date);
              const serving = allTokens.find((tx) => tx.status === 'serving');
              const waitingBeforeMe = allTokens.filter(
                (tx) => tx.status === 'waiting' && tx.tokenNumber < token.tokenNumber
              ).length;

              const servStr: number | '-' = serving ? serving.tokenNumber : '-';
              return {
                ...token,
                liveQueuePos: waitingBeforeMe + 1,
                liveServingNumber: servStr,
              };
            } catch {
              return token;
            }
          }
          return token;
        })
      );
      setTokens(enriched);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
    const iv = setInterval(loadTokens, 10000);
    return () => clearInterval(iv);
  }, [user]);

  const handleCancel = async (tokenId: string) => {
    if (confirm('Are you sure you want to cancel this token?')) {
      await cancelToken(tokenId);
      loadTokens();
    }
  };

  const handleShareToken = (token: TokenEntry) => {
    const text = `🎫 My Line Free Token: #${token.tokenNumber}\n💈 Salon: ${token.salonName}\n📆 Date: ${token.date}\n⏰ Wait: ~${token.estimatedWaitMinutes} min\n💰 Total: ₹${token.totalPrice}\n📋 Services: ${token.selectedServices.map(s => s.name).join(', ')}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const activeTokens = tokens.filter((t) => t.status === 'waiting' || t.status === 'serving');
  const completedTokens = tokens.filter((t) => t.status === 'done' || t.status === 'cancelled');

  return (
    <div className="min-h-screen pb-24 animate-fadeIn">
      <div className="p-6">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold">{t('tokens')}</h1>
          <button onClick={loadTokens} className="text-primary text-sm font-medium hover:text-primary/80 transition-colors">
            🔄 Refresh
          </button>
        </div>
        <p className="text-text-dim text-sm mb-6">Track your live queue position</p>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-text-dim text-sm mt-3 animate-pulse">Loading tokens...</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-card-2 flex items-center justify-center mx-auto mb-4 border border-border">
              <span className="text-5xl animate-float block">🎫</span>
            </div>
            <p className="font-semibold text-lg text-text">No active tokens</p>
            <p className="text-text-dim text-sm mt-1 max-w-[250px] mx-auto">You don't have any booked tokens yet. Search for a salon to book one!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Tokens */}
            {activeTokens.length > 0 && (
              <div>
                <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Active Bookings
                </h2>
                <div className="space-y-4">
                  {activeTokens.map((token) => (
                    <div key={token.id} className="p-5 rounded-2xl premium-card relative overflow-hidden group">
                      {/* Status indicator gradient line */}
                      <div className={`absolute top-0 left-0 w-1 h-full ${token.status === 'serving' ? 'bg-success' : 'bg-warning'}`} />
                      
                      {token.isAdvanceBooking && (
                        <div className="absolute top-0 right-0 bg-accent text-bg text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                          ADVANCE BOOKING
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-lg leading-tight">{token.salonName}</p>
                          <p className="text-text-dim text-xs mt-0.5">📅 {token.date}</p>
                        </div>
                        <div className="text-center bg-card-2 p-2 rounded-xl min-w-[60px] border border-border">
                          <p className="text-[10px] text-text-dim uppercase tracking-wider font-bold">Token</p>
                          <p className="text-2xl font-black text-primary leading-none mt-1">#{token.tokenNumber}</p>
                        </div>
                      </div>

                      {/* Live Queue Tracker */}
                      {token.status === 'waiting' && token.liveQueuePos !== undefined && (
                        <div className="mb-4 p-3 rounded-xl bg-card-2/50 border border-primary/20 backdrop-blur-sm">
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-text-dim">Currently Serving:</span>
                            <span className="font-bold text-accent">#{token.liveServingNumber}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-text-dim">Your Position:</span>
                            <span className="font-bold text-warning">{token.liveQueuePos} in line</span>
                          </div>
                          <div className="w-full bg-card h-1.5 rounded-full mt-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-warning to-accent h-full transition-all duration-1000" 
                              style={{ width: `${Math.max(5, 100 - (token.liveQueuePos * 10))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {token.status === 'serving' && (
                        <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/30 flex items-center gap-3">
                          <span className="text-2xl animate-spin-slow block">✂️</span>
                          <div>
                            <p className="font-bold text-success text-sm">You are being served!</p>
                            <p className="text-success/80 text-xs">Please proceed to the barber</p>
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <p className="text-xs text-text-dim mb-1 font-medium">Services:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {token.selectedServices.map((s, i) => (
                            <span key={i} className="px-2 py-1 rounded-md bg-card border border-border text-[10px]">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
                        <div>
                          <p className="text-xs text-text-dim">Total Price / Wait</p>
                          <p className="font-bold text-sm">₹{token.totalPrice} <span className="text-text-dim font-normal mx-1">•</span> ~{token.estimatedWaitMinutes}m</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleShareToken(token)} className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center text-lg transition-transform active:scale-95">
                            📲
                          </button>
                          {token.status === 'waiting' && token.id && (
                            <button onClick={() => handleCancel(token.id as string)} className="w-9 h-9 rounded-full bg-danger/10 text-danger flex items-center justify-center text-lg transition-transform active:scale-95">
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tokens */}
            {completedTokens.length > 0 && (
              <div>
                <h2 className="font-bold text-base mb-3 text-text-dim">Past Bookings</h2>
                <div className="space-y-3">
                  {completedTokens.slice(0, 5).map((token) => (
                    <div key={token.id} className="p-4 rounded-xl bg-card border border-border opacity-75 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-sm">{token.salonName}</p>
                        <span className={`badge text-[10px] ${token.status === 'done' ? 'badge-success' : 'badge-danger'}`}>
                          {token.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-text-dim">
                        <span>📅 {token.date}</span>
                        <span>Token #{token.tokenNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
