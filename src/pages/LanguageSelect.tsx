import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, Lang } from '../store/AppContext';

export default function LanguageSelect() {
  const { setLang } = useApp();
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => setSplash(false), 2000);
    setTimeout(() => setShow(true), 2200);
  }, []);

  const select = (l: Lang) => {
    setLang(l);
    nav('/role');
  };

  if (splash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bg via-bg to-primary/5">
        <div className="text-center animate-fadeIn">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse-glow">
            <span className="text-6xl">✂️</span>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent">
            Line Free
          </h1>
          <p className="text-text-dim text-sm mt-2 animate-float">Skip the queue, save your time</p>
          <div className="mt-8 flex gap-1.5 justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className={`transition-all duration-500 w-full max-w-sm ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-5xl">✂️</span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Line Free
          </h1>
          <p className="text-text-dim text-sm mt-1">No more waiting in line</p>
        </div>

        <h2 className="text-center text-lg font-semibold mb-6">Select Language / भाषा चुनें</h2>

        <div className="space-y-3">
          <button
            onClick={() => select('en')}
            className="w-full p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all flex items-center gap-4 active:scale-[0.98] group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-3xl">🇬🇧</span>
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-lg">English</p>
              <p className="text-text-dim text-sm">Continue in English</p>
            </div>
            <span className="text-text-dim">→</span>
          </button>

          <button
            onClick={() => select('hi')}
            className="w-full p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all flex items-center gap-4 active:scale-[0.98] group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-3xl">🇮🇳</span>
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-lg">हिंदी</p>
              <p className="text-text-dim text-sm">हिंदी में जारी रखें</p>
            </div>
            <span className="text-text-dim">→</span>
          </button>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-2">
          {[
            { icon: '⚡', label: 'Instant Token' },
            { icon: '📱', label: 'UPI Payment' },
            { icon: '⭐', label: 'Top Salons' },
          ].map((f, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-card-2/50 text-center">
              <span className="text-lg block">{f.icon}</span>
              <p className="text-[9px] text-text-dim mt-0.5 font-medium">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
