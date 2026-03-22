import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BottomNav from '../components/BottomNav';

export default function CustomerSearch() {
  const { allSalons, isFavorite, t } = useApp();
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'rated' | 'favorites'>('all');

  const getFiltered = () => {
    let results = [...allSalons];

    // Text search
    if (query.trim()) {
      const lower = query.toLowerCase();
      results = results.filter(s =>
        s.salonName?.toLowerCase().includes(lower) ||
        s.name?.toLowerCase().includes(lower) ||
        s.location?.toLowerCase().includes(lower) ||
        s.services?.some(svc => svc.name.toLowerCase().includes(lower))
      );
    }

    // Filter
    if (filter === 'open') {
      results = results.filter(s => s.isOpen && !s.isBreak && !s.isStopped);
    } else if (filter === 'rated') {
      results = results.filter(s => (s.rating || 0) > 0).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filter === 'favorites') {
      results = results.filter(s => isFavorite(s.uid));
    }

    return results;
  };

  const results = getFiltered();

  return (
    <div className="min-h-screen pb-24 animate-fadeIn">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{t('search')}</h1>
        
        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search salon, service, location..."
              className="input-field pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">🔍</span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {[
            { id: 'all' as const, label: '📋 All', count: allSalons.length },
            { id: 'open' as const, label: '🟢 Open Now', count: allSalons.filter(s => s.isOpen && !s.isBreak && !s.isStopped).length },
            { id: 'rated' as const, label: '⭐ Top Rated', count: allSalons.filter(s => (s.rating || 0) > 0).length },
            { id: 'favorites' as const, label: '❤️ Favorites', count: allSalons.filter(s => isFavorite(s.uid)).length },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'bg-card border border-border text-text-dim hover:border-primary/30'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-text-dim text-xs mb-3">{results.length} salon{results.length !== 1 ? 's' : ''} found</p>

        {/* Results */}
        {results.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl block mb-3 animate-float">😔</span>
            <p className="text-text-dim font-medium">{t('no.results')}</p>
            <p className="text-text-dim text-xs mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((salon, i) => (
              <button
                key={salon.uid}
                onClick={() => nav(`/customer/salon/${salon.uid}`)}
                className="w-full p-4 rounded-2xl bg-card border border-border text-left flex items-center gap-4 hover:border-primary/30 transition-all active:scale-[0.98] animate-fadeIn"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-card-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {salon.salonImageURL ? (
                    <img src={salon.salonImageURL} className="w-14 h-14 object-cover" alt="" />
                  ) : salon.photoURL ? (
                    <img src={salon.photoURL} className="w-14 h-14 object-cover" alt="" />
                  ) : (
                    <span className="text-2xl">💈</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{salon.salonName || 'Salon'}</p>
                  <p className="text-text-dim text-sm truncate">{salon.name}</p>
                  {salon.location && <p className="text-text-dim text-xs">📍 {salon.location}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`badge text-[10px] ${
                      salon.isOpen && !salon.isBreak ? 'badge-success' :
                      salon.isBreak ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {salon.isOpen && !salon.isBreak ? '🟢 Open' : salon.isBreak ? '🟡 Break' : '🔴 Closed'}
                    </span>
                    <span className="text-[10px] text-text-dim">{salon.services?.length || 0} services</span>
                    {salon.rating && (
                      <span className="text-[10px] text-gold font-semibold">⭐ {salon.rating} ({salon.totalReviews})</span>
                    )}
                    {salon.isStopped && <span className="badge badge-danger text-[9px]">Tokens Paused</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-primary text-lg">→</span>
                  {salon.services && salon.services.length > 0 && (
                    <p className="text-[10px] text-text-dim mt-1">
                      from ₹{Math.min(...salon.services.map(s => s.price))}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
