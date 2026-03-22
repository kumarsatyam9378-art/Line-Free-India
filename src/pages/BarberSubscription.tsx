import { useApp } from '../store/AppContext';
import BottomNav from '../components/BottomNav';
import BackButton from '../components/BackButton';

const UPI_ID = 'kumarsatyam9378@okhdfcbank';

export default function BarberSubscription() {
  const { isBarberTrialActive, getBarberTrialDaysLeft, isBarberSubscribed, barberProfile, t } = useApp();

  const trialDays = getBarberTrialDaysLeft();
  const trialActive = isBarberTrialActive();
  const subscribed = isBarberSubscribed();

  const plans = [
    {
      id: 'barber_monthly',
      name: 'Monthly',
      price: 100,
      period: '/month',
      features: [
        'Unlimited tokens',
        'Queue management',
        'Customer analytics',
        'Break management',
        'Earnings dashboard',
        'Ratings & reviews',
      ],
    },
    {
      id: 'barber_yearly',
      name: 'Yearly',
      price: 1000,
      period: '/year',
      features: [
        'Everything in Monthly',
        'Priority support',
        'Advanced analytics',
        'Custom salon page',
        'Save ₹200/year',
      ],
      badge: 'Best Value 🔥',
    },
  ];

  const handleSubscribe = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent('LineFree')}&tn=${encodeURIComponent(`LineFree Salon Subscription - ${plan.name}`)}&am=${plan.price}&cu=INR`;
    window.location.href = upiUrl;
  };

  return (
    <div className="min-h-screen pb-24 animate-fadeIn">
      <div className="p-6">
        <BackButton to="/barber/home" />
        <h1 className="text-2xl font-bold mb-1">{t('sub.barber.title')}</h1>
        <p className="text-text-dim text-sm mb-5">First month FREE! Then subscribe to continue.</p>

        {/* Trial Status */}
        {trialActive ? (
          <div className="p-4 rounded-2xl bg-success/10 border border-success/30 mb-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl animate-float">🎁</span>
              <div className="flex-1">
                <p className="text-success font-bold">{t('trial.active')}</p>
                <p className="text-sm text-text-dim">{trialDays} days remaining</p>
              </div>
            </div>
            <div className="progress-bar mt-2">
              <div className="progress-fill" style={{ width: `${(trialDays / 30) * 100}%` }} />
            </div>
            <p className="text-text-dim text-xs mt-2">
              You're enjoying all premium features for free! Subscribe before trial ends to avoid service interruption.
            </p>
          </div>
        ) : subscribed ? (
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 mb-5 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-primary font-bold">Active Subscription</p>
              <p className="text-sm text-text-dim">Your subscription is active. Thank you!</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 mb-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-danger font-bold">{t('trial.expired')}</p>
                <p className="text-sm text-text-dim">Your 1-month free trial has ended. Subscribe to continue using all features.</p>
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan.id} className={`p-5 rounded-2xl border relative overflow-hidden ${
              plan.badge ? 'premium-card border-primary' : 'bg-card border-border'
            }`}>
              {plan.badge && (
                <span className="absolute -top-0 right-0 px-4 py-1.5 rounded-bl-xl bg-primary text-white text-xs font-bold">
                  {plan.badge}
                </span>
              )}
              
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-bold gradient-text">₹{plan.price}</span>
                <span className="text-text-dim text-sm">{plan.period}</span>
              </div>
              <p className="font-semibold mb-3 text-lg">{plan.name} Plan</p>
              
              <ul className="space-y-2 mb-5">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-sm text-text-dim flex items-center gap-2">
                    <span className="text-success text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              
              <button onClick={() => handleSubscribe(plan.id)} className={plan.badge ? 'btn-primary' : 'btn-secondary'}>
                💳 Pay via UPI
              </button>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="mt-5 p-4 rounded-xl glass-card text-center">
          <p className="text-text-dim text-xs mb-1">Payment via UPI — Opens your payment app</p>
          <p className="font-mono text-sm text-primary">{UPI_ID}</p>
          <p className="text-text-dim text-[10px] mt-2">GPay • PhonePe • Paytm • BHIM & more</p>
        </div>

        {/* FAQ */}
        <div className="mt-5 space-y-3">
          <h3 className="font-semibold text-sm">📋 FAQ</h3>
          {[
            { q: 'What happens after my free trial?', a: 'After 1 month, subscribe at ₹100/month to continue managing your salon.' },
            { q: 'Can I cancel anytime?', a: 'Yes! No lock-in period. Cancel anytime.' },
            { q: 'What\'s included in the free trial?', a: 'All features — unlimited tokens, queue management, analytics, and more.' },
          ].map((faq, i) => (
            <div key={i} className="p-3 rounded-xl bg-card border border-border">
              <p className="font-medium text-sm">{faq.q}</p>
              <p className="text-text-dim text-xs mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
