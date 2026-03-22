import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, BarberProfile, ServiceItem, TokenEntry, ReviewEntry } from '../store/AppContext';
import BackButton from '../components/BackButton';

const UPI_ID = 'kumarsatyam9378@okhdfcbank';

export default function SalonDetail() {
  const { id } = useParams<{ id: string }>();
  const { getSalonById, getSalonTokens, getToken, user, customerProfile, addReview, getSalonReviews, allSalons, toggleFavorite, isFavorite, t } = useApp();
  const nav = useNavigate();
  const [salon, setSalon] = useState<BarberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ServiceItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [getting, setGetting] = useState(false);
  const [tokenResult, setTokenResult] = useState<{ tokenNumber: number; waitTime: number } | null>(null);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews'>('services');
  const [advanceDate, setAdvanceDate] = useState('');

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  // Use real-time data from allSalons when available
  useEffect(() => {
    if (id) {
      const realtime = allSalons.find(s => s.uid === id);
      if (realtime) {
        setSalon(realtime);
        setLoading(false);
      } else {
        getSalonById(id).then(s => { setSalon(s); setLoading(false); });
      }
    }
  }, [id, allSalons]);

  // Load reviews
  useEffect(() => {
    if (id) {
      getSalonReviews(id).then(setReviews);
    }
  }, [id]);

  const toggleService = (s: ServiceItem) => {
    const exists = selected.find(x => x.id === s.id);
    if (exists) setSelected(selected.filter(x => x.id !== s.id));
    else setSelected([...selected, s]);
  };

  const totalTime = selected.reduce((a, s) => a + s.avgTime, 0);
  const totalPrice = selected.reduce((a, s) => a + s.price, 0);

  const handleGetToken = async () => {
    if (!salon || !user || selected.length === 0) return;
    setGetting(true);
    
    const bookingDate = advanceDate || today;
    const isAdvance = advanceDate !== '' && advanceDate !== today;
    
    const existingTokens = await getSalonTokens(salon.uid, bookingDate);
    const activeTokens = existingTokens.filter(t => t.status === 'waiting' || t.status === 'serving');
    const maxToken = existingTokens.length > 0 ? Math.max(...existingTokens.map(t => t.tokenNumber)) : 0;
    const newTokenNumber = maxToken + 1;
    
    const waitingTokens = activeTokens.filter(t => t.status === 'waiting');
    const servingToken = activeTokens.find(t => t.status === 'serving');
    let waitMinutes = 0;
    if (!isAdvance) {
      if (servingToken) waitMinutes += servingToken.totalTime;
      waitingTokens.forEach(t => { waitMinutes += t.totalTime; });
    }

    const token: Omit<TokenEntry, 'id'> = {
      salonId: salon.uid,
      salonName: salon.salonName,
      customerId: user.uid,
      customerName: customerProfile?.name || user.displayName || 'Customer',
      customerPhone: customerProfile?.phone || '',
      tokenNumber: newTokenNumber,
      selectedServices: selected,
      totalTime,
      totalPrice,
      estimatedWaitMinutes: waitMinutes,
      status: 'waiting',
      createdAt: Date.now(),
      date: bookingDate,
      isAdvanceBooking: isAdvance,
      advanceDate: isAdvance ? advanceDate : undefined,
    };

    const tokenId = await getToken(token);
    if (tokenId) {
      setTokenResult({ tokenNumber: newTokenNumber, waitTime: waitMinutes });
    }
    setGetting(false);
    setShowConfirm(false);
  };

  const handlePayUPI = (amount: number) => {
    const upiUrl = `upi://pay?pa=${salon?.upiId || UPI_ID}&pn=${encodeURIComponent(salon?.salonName || 'Salon')}&tn=${encodeURIComponent(`Payment for salon services`)}&am=${amount}&cu=INR`;
    window.location.href = upiUrl;
  };

  const handleWhatsAppShare = () => {
    const text = `Check out ${salon?.salonName} on Line Free! 💈\n📍 ${salon?.location || ''}\n🎫 Get your token online and skip the queue!\n\nServices: ${salon?.services?.map(s => `${s.name} (₹${s.price})`).join(', ')}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSubmitReview = async () => {
    if (!salon || !user) return;
    setSubmittingReview(true);
    await addReview({
      salonId: salon.uid,
      customerId: user.uid,
      customerName: customerProfile?.name || user.displayName || 'Customer',
      customerPhoto: customerProfile?.photoURL || user.photoURL || '',
      rating: reviewRating,
      comment: reviewComment,
      createdAt: Date.now(),
    });
    const updatedReviews = await getSalonReviews(salon.uid);
    setReviews(updatedReviews);
    setShowReview(false);
    setReviewComment('');
    setReviewRating(5);
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen p-6">
        <BackButton to="/customer/search" />
        <div className="text-center py-20">
          <span className="text-5xl animate-float block">😔</span>
          <p className="text-text-dim mt-3">Salon not found</p>
        </div>
      </div>
    );
  }

  // Token result screen
  if (tokenResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fadeIn">
        <div className="text-center w-full max-w-sm">
          <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-bounceIn">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Token Confirmed!</h1>
          <p className="text-text-dim mb-6">{salon.salonName}</p>
          
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-text-dim text-sm">Your Token Number</p>
            <p className="text-6xl font-bold text-primary my-3 animate-countUp">{tokenResult.tokenNumber}</p>
            <p className="text-text-dim text-sm">Estimated wait</p>
            <p className="text-xl font-semibold text-accent">
              {tokenResult.waitTime > 0 ? `~${tokenResult.waitTime} ${t('min')}` : 'You are next! 🎉'}
            </p>
          </div>

          {/* Pay Now via UPI */}
          {totalPrice > 0 && (
            <button onClick={() => handlePayUPI(totalPrice)} className="btn-accent mb-3">
              💳 Pay ₹{totalPrice} via UPI
            </button>
          )}

          {/* WhatsApp Share */}
          <button
            onClick={() => {
              const text = `🎫 My Token: #${tokenResult.tokenNumber}\n💈 Salon: ${salon.salonName}\n⏰ Wait: ~${tokenResult.waitTime} min\n💰 Total: ₹${totalPrice}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="btn-whatsapp mb-3"
          >
            📲 Share on WhatsApp
          </button>

          <p className="text-text-dim text-xs mb-5">
            Please arrive 10 minutes before your turn
          </p>

          <button onClick={() => nav('/customer/tokens')} className="btn-primary mb-2">
            View My Tokens
          </button>
          <button onClick={() => nav('/customer/home')} className="btn-secondary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isClosed = !salon.isOpen;
  const isOnBreak = salon.isBreak;
  const isStopped = salon.isStopped;
  const canGetToken = salon.isOpen && !salon.isStopped;

  return (
    <div className="min-h-screen pb-8 animate-fadeIn">
      <div className="p-6">
        <BackButton to="/customer/search" />

        {/* Salon Header */}
        <div className="mt-4 mb-5">
          <div className="w-full h-44 rounded-2xl bg-card-2 overflow-hidden mb-4 relative">
            {salon.salonImageURL ? (
              <img src={salon.salonImageURL} className="w-full h-44 object-cover" alt="" />
            ) : (
              <div className="w-full h-44 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <span className="text-6xl">💈</span>
              </div>
            )}
            {/* Favorite toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(salon.uid); }}
              className="absolute top-3 right-3 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-xl transition-transform active:scale-90"
            >
              {isFavorite(salon.uid) ? '❤️' : '🤍'}
            </button>
            {/* Overlay badges */}
            <div className="absolute bottom-3 left-3 flex gap-2">
              <span className={`badge text-xs ${
                isClosed ? 'bg-danger/80 text-white' :
                isOnBreak ? 'bg-warning/80 text-white' :
                'bg-success/80 text-white'
              }`}>
                {isClosed ? '🔴 Closed' : isOnBreak ? '🟡 On Break' : '🟢 Open'}
              </span>
              {isStopped && <span className="badge bg-danger/80 text-white text-xs">Tokens Stopped</span>}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{salon.salonName}</h1>
              <p className="text-text-dim text-sm">{salon.name}</p>
              {salon.location && <p className="text-text-dim text-xs mt-1">📍 {salon.location}</p>}
              {salon.phone && <p className="text-text-dim text-xs">📞 {salon.phone}</p>}
              {salon.businessHours && <p className="text-text-dim text-xs text-accent mt-0.5">⏰ {salon.businessHours}</p>}
            </div>
            {salon.rating && (
              <div className="text-center p-2 rounded-xl bg-gold/10 border border-gold/20">
                <p className="text-gold font-bold text-lg">⭐ {salon.rating}</p>
                <p className="text-text-dim text-[9px]">{salon.totalReviews} reviews</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button onClick={() => nav(`/customer/chat/${salon.uid}`)} className="flex-1 p-2.5 rounded-xl bg-primary/15 border border-primary/30 text-center text-sm font-medium text-primary">
              💬 Message
            </button>
            <button onClick={handleWhatsAppShare} className="flex-1 p-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-center text-sm font-medium text-[#25D366]">
              📲 Share
            </button>
            {salon.phone && (
              <a href={`tel:${salon.phone}`} className="flex-1 p-2.5 rounded-xl bg-accent/15 border border-accent/30 text-center text-sm font-medium text-accent">
                📞 Call
              </a>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'services' ? 'bg-primary text-white' : 'bg-card border border-border text-text-dim'
            }`}
          >
            🛠️ {t('services')} ({salon.services?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'reviews' ? 'bg-primary text-white' : 'bg-card border border-border text-text-dim'
            }`}
          >
            ⭐ {t('reviews')} ({reviews.length})
          </button>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <>
            {!canGetToken && (
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 mb-4">
                <p className="text-warning text-xs font-medium">
                  {isClosed ? '🔴 Salon is currently closed. Cannot get token.' :
                   isStopped ? '⏹️ Salon has stopped accepting tokens for now.' :
                   '🟡 Salon is on break. You can still get a token.'}
                </p>
              </div>
            )}

            <div className="space-y-2 mb-5">
              {salon.services?.map(s => {
                const isSelected = selected.find(x => x.id === s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => canGetToken || isOnBreak ? toggleService(s) : null}
                    disabled={isClosed || isStopped}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all active:scale-[0.98] ${
                      isSelected ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-card border-border'
                    } ${(isClosed || isStopped) ? 'opacity-50' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-text-dim text-xs">~{s.avgTime} {t('min')}</p>
                    </div>
                    <p className="font-semibold text-primary">₹{s.price}</p>
                  </button>
                );
              })}
            </div>

            {/* Selected Summary */}
            {selected.length > 0 && (
              <div className="p-4 rounded-2xl glass-card mb-4 animate-slideUp">
                <div className="flex justify-between mb-2">
                  <span className="text-text-dim text-sm">Services</span>
                  <span className="text-sm font-medium">{selected.length} selected</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-text-dim text-sm">Total Time</span>
                  <span className="text-sm">~{totalTime} {t('min')}</span>
                </div>
                <div className="divider" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="gradient-text">₹{totalPrice}</span>
                </div>
              </div>
            )}

            {/* Advance Booking Date Picker */}
            {selected.length > 0 && (
              <div className="mb-4 animate-slideUp">
                <label className="text-sm text-text-dim mb-1.5 block">📅 Booking Date</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdvanceDate('')}
                    className={`flex-1 p-2.5 rounded-xl text-sm font-medium border transition-all ${
                      !advanceDate || advanceDate === today
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-card border-border text-text-dim'
                    }`}
                  >
                    📌 Today
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="date"
                      value={advanceDate}
                      onChange={e => setAdvanceDate(e.target.value)}
                      min={today}
                      className="input-field text-sm py-2.5 w-full"
                    />
                  </div>
                </div>
                {advanceDate && advanceDate !== today && (
                  <p className="text-xs text-accent mt-1.5 font-medium">📆 Advance booking for {new Date(advanceDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                )}
              </div>
            )}

            {/* Get Token Button */}
            {(canGetToken || isOnBreak) && selected.length > 0 && (
              <button
                onClick={() => setShowConfirm(true)}
                className="btn-primary text-lg animate-slideUp"
              >
                🎫 {advanceDate && advanceDate !== today ? 'Book Advance Token' : t('btn.getToken')}
              </button>
            )}
          </>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <button
              onClick={() => setShowReview(true)}
              className="w-full p-3 rounded-xl border border-dashed border-primary/50 text-primary text-sm font-medium mb-4"
            >
              ✍️ Write a Review
            </button>

            {reviews.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-4xl block mb-3">⭐</span>
                <p className="text-text-dim">No reviews yet</p>
                <p className="text-text-dim text-xs mt-1">Be the first to review this salon!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map(review => (
                  <div key={review.id} className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-card-2 overflow-hidden flex-shrink-0">
                        {review.customerPhoto ? (
                          <img src={review.customerPhoto} className="w-9 h-9 object-cover" alt="" />
                        ) : (
                          <div className="w-9 h-9 flex items-center justify-center text-lg">👤</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{review.customerName}</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-xs ${s <= review.rating ? 'text-gold' : 'text-border'}`}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-text-dim text-sm">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm animate-scaleIn">
            <h2 className="text-xl font-bold mb-4">Confirm Token</h2>
            <p className="text-text-dim mb-2">{salon.salonName}</p>
            <div className="space-y-1 mb-4">
              {selected.map(s => (
                <p key={s.id} className="text-sm">• {s.name} - ₹{s.price} ({s.avgTime}min)</p>
              ))}
            </div>
            <div className="divider" />
            <div className="flex justify-between font-bold mb-5">
              <span>Total: ~{totalTime}min</span>
              <span className="text-primary">₹{totalPrice}</span>
            </div>
            <button onClick={handleGetToken} disabled={getting} className="btn-primary mb-2">
              {getting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Getting Token...
                </span>
              ) : 'Confirm & Get Token'}
            </button>
            <button onClick={() => setShowConfirm(false)} className="btn-secondary">
              {t('btn.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm animate-scaleIn">
            <h2 className="text-xl font-bold mb-4">Write a Review</h2>
            <p className="text-text-dim text-sm mb-3">{salon.salonName}</p>
            
            {/* Star Rating */}
            <div className="flex gap-2 justify-center mb-4">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onClick={() => setReviewRating(s)}
                  className={`text-3xl transition-transform ${s <= reviewRating ? 'text-gold scale-110' : 'text-border'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-text-dim mb-4">
              {reviewRating === 5 ? '🤩 Excellent!' : reviewRating === 4 ? '😊 Good' : reviewRating === 3 ? '😐 Average' : reviewRating === 2 ? '😕 Poor' : '😞 Bad'}
            </p>

            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Write your experience... (optional)"
              className="input-field mb-4 h-24 resize-none"
            />

            <button onClick={handleSubmitReview} disabled={submittingReview} className="btn-primary mb-2">
              {submittingReview ? 'Submitting...' : '⭐ Submit Review'}
            </button>
            <button onClick={() => setShowReview(false)} className="btn-secondary">
              {t('btn.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
