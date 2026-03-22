import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, googleProvider } from '../firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  User
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection, query, where, getDocs,
  updateDoc, addDoc, onSnapshot
} from 'firebase/firestore';

export type Lang = 'en' | 'hi';
export type Role = 'customer' | 'barber';

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  avgTime: number; // in minutes
}

export interface ReviewEntry {
  id?: string;
  salonId: string;
  customerId: string;
  customerName: string;
  customerPhoto: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface BarberProfile {
  uid: string;
  name: string;
  salonName: string;
  location: string;
  phone: string;
  photoURL: string;
  salonImageURL: string;
  services: ServiceItem[];
  isOpen: boolean;
  isBreak: boolean;
  isStopped: boolean;
  currentToken: number;
  totalTokensToday: number;
  breakStartTime: number | null;
  createdAt: any;
  rating?: number;
  totalReviews?: number;
  totalEarnings?: number;
  subscription?: string | null;
  subscriptionExpiry?: number | null;
  upiId?: string;
  businessHours?: string;
}

export interface CustomerProfile {
  uid: string;
  name: string;
  phone: string;
  location: string;
  photoURL: string;
  favoriteSalons: string[];
  subscription: string | null;
  createdAt: any;
}

export interface TokenEntry {
  id?: string;
  salonId: string;
  salonName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  tokenNumber: number;
  selectedServices: ServiceItem[];
  totalTime: number;
  totalPrice: number;
  estimatedWaitMinutes: number;
  status: 'waiting' | 'serving' | 'done' | 'cancelled';
  createdAt: any;
  date: string; // YYYY-MM-DD
  isAdvanceBooking: boolean;
  advanceDate?: string;
}

export interface MessageEntry {
  id?: string;
  salonId: string;
  salonName: string;
  customerId: string;
  customerName: string;
  customerPhoto: string;
  message: string;
  createdAt: any;
  read: boolean;
}

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  role: Role | null;
  setRole: (r: Role | null) => void;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  // Customer
  customerProfile: CustomerProfile | null;
  setCustomerProfile: (p: CustomerProfile | null) => void;
  saveCustomerProfile: (p: CustomerProfile) => Promise<void>;
  // Barber
  barberProfile: BarberProfile | null;
  setBarberProfile: (p: BarberProfile | null) => void;
  saveBarberProfile: (p: BarberProfile) => Promise<boolean>;
  retrySyncBarberProfile: () => Promise<boolean>;
  syncPending: boolean;
  // Tokens
  getToken: (token: Omit<TokenEntry, 'id'>) => Promise<string | null>;
  cancelToken: (tokenId: string) => Promise<void>;
  // Salon operations
  searchSalons: (q: string) => Promise<BarberProfile[]>;
  getSalonById: (id: string) => Promise<BarberProfile | null>;
  getSalonTokens: (salonId: string, date: string) => Promise<TokenEntry[]>;
  getCustomerTokens: (customerId: string) => Promise<TokenEntry[]>;
  // All salons (real-time)
  allSalons: BarberProfile[];
  // Barber operations
  nextCustomer: () => Promise<void>;
  toggleSalonOpen: () => Promise<void>;
  toggleSalonBreak: () => Promise<void>;
  toggleSalonStop: () => Promise<void>;
  continueTokens: () => Promise<void>;
  // Trial / subscription
  getBarberTrialDaysLeft: () => number;
  isBarberTrialActive: () => boolean;
  isBarberSubscribed: () => boolean;
  // Reviews
  addReview: (review: Omit<ReviewEntry, 'id'>) => Promise<void>;
  getSalonReviews: (salonId: string) => Promise<ReviewEntry[]>;
  // Earnings
  getTodayEarnings: () => Promise<number>;
  // Messaging
  sendMessage: (msg: Omit<MessageEntry, 'id'>) => Promise<void>;
  getSalonMessages: (salonId: string) => Promise<MessageEntry[]>;
  getBarberMessages: () => Promise<MessageEntry[]>;
  markMessageRead: (messageId: string) => Promise<void>;
  // Favorites
  toggleFavorite: (salonId: string) => void;
  isFavorite: (salonId: string) => boolean;
  t: (key: string) => string;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

// Translations
const translations: Record<string, Record<Lang, string>> = {
  'app.name': { en: 'Line Free', hi: 'लाइन फ्री' },
  'lang.select': { en: 'Select Language', hi: 'भाषा चुनें' },
  'role.select': { en: 'Continue as', hi: 'के रूप में जारी रखें' },
  'role.customer': { en: 'Customer', hi: 'ग्राहक' },
  'role.barber': { en: 'Salon Owner / Barber', hi: 'सैलून मालिक / बार्बर' },
  'auth.login': { en: 'Login', hi: 'लॉगिन' },
  'auth.google': { en: 'Continue with Google', hi: 'Google से लॉगिन करें' },
  'auth.logout': { en: 'Logout', hi: 'लॉगआउट' },
  'profile.setup': { en: 'Setup Profile', hi: 'प्रोफाइल सेटअप' },
  'profile.name': { en: 'Name', hi: 'नाम' },
  'profile.phone': { en: 'Phone Number', hi: 'फ़ोन नंबर' },
  'profile.location': { en: 'Location', hi: 'लोकेशन' },
  'profile.salonName': { en: 'Salon Name', hi: 'सैलून का नाम' },
  'profile.optional': { en: '(Optional)', hi: '(वैकल्पिक)' },
  'btn.continue': { en: 'Continue', hi: 'जारी रखें' },
  'btn.skip': { en: 'Skip', hi: 'छोड़ें' },
  'btn.save': { en: 'Save', hi: 'सेव करें' },
  'btn.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'btn.back': { en: 'Back', hi: 'वापस' },
  'btn.next': { en: 'Next', hi: 'अगला' },
  'btn.getToken': { en: 'Get Token', hi: 'टोकन लें' },
  'btn.cancelToken': { en: 'Cancel Token', hi: 'टोकन रद्द करें' },
  'home': { en: 'Home', hi: 'होम' },
  'search': { en: 'Search Salon', hi: 'सैलून खोजें' },
  'tokens': { en: 'My Tokens', hi: 'मेरे टोकन' },
  'profile': { en: 'Profile', hi: 'प्रोफाइल' },
  'subscription': { en: 'Subscription', hi: 'सब्सक्रिप्शन' },
  'hairstyles': { en: 'Hairstyles', hi: 'हेयरस्टाइल' },
  'salon.open': { en: 'Open Salon', hi: 'सैलून खोलें' },
  'salon.close': { en: 'Close Salon', hi: 'सैलून बंद करें' },
  'salon.break': { en: 'Take Break', hi: 'ब्रेक लें' },
  'salon.endBreak': { en: 'End Break', hi: 'ब्रेक खत्म' },
  'salon.closed': { en: 'Salon is Closed', hi: 'सैलून बंद है' },
  'salon.onBreak': { en: 'On Break', hi: 'ब्रेक पर' },
  'salon.isOpen': { en: 'Salon is Open', hi: 'सैलून खुला है' },
  'queue': { en: 'Queue', hi: 'कतार' },
  'queue.customers': { en: 'Customers in Queue', hi: 'कतार में ग्राहक' },
  'queue.next': { en: 'Next Customer', hi: 'अगला ग्राहक' },
  'queue.stop': { en: 'Stop Tokens', hi: 'टोकन बंद करें' },
  'queue.continue': { en: 'Continue Tokens', hi: 'टोकन जारी रखें' },
  'queue.current': { en: 'Current Token', hi: 'वर्तमान टोकन' },
  'queue.total': { en: 'Total Tokens', hi: 'कुल टोकन' },
  'queue.waiting': { en: 'Waiting', hi: 'इंतज़ार' },
  'queue.peopleBefore': { en: 'people before you', hi: 'लोग आपसे पहले' },
  'queue.estTime': { en: 'Estimated wait', hi: 'अनुमानित इंतज़ार' },
  'queue.yourToken': { en: 'Your Token', hi: 'आपका टोकन' },
  'services': { en: 'Services', hi: 'सेवाएं' },
  'services.add': { en: 'Add Service', hi: 'सेवा जोड़ें' },
  'services.select': { en: 'Select Services', hi: 'सेवाएं चुनें' },
  'min': { en: 'min', hi: 'मिनट' },
  'rs': { en: '₹', hi: '₹' },
  'today': { en: 'Today', hi: 'आज' },
  'favorites': { en: 'Favorites', hi: 'पसंदीदा' },
  'no.results': { en: 'No results found', hi: 'कोई परिणाम नहीं' },
  'sub.customer.title': { en: 'Customer Subscription', hi: 'ग्राहक सब्सक्रिप्शन' },
  'sub.barber.title': { en: 'Salon Subscription', hi: 'सैलून सब्सक्रिप्शन' },
  'error': { en: 'Something went wrong', hi: 'कुछ गलत हो गया' },
  'loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
  'earnings': { en: 'Earnings', hi: 'कमाई' },
  'reviews': { en: 'Reviews', hi: 'रिव्यू' },
  'share': { en: 'Share', hi: 'शेयर करें' },
  'pay': { en: 'Pay', hi: 'भुगतान करें' },
  'trial': { en: 'Free Trial', hi: 'फ्री ट्रायल' },
  'trial.active': { en: 'Trial Active', hi: 'ट्रायल चालू' },
  'trial.expired': { en: 'Trial Expired', hi: 'ट्रायल खत्म' },
  'nearby': { en: 'Nearby Salons', hi: 'आस-पास के सैलून' },
  'featured': { en: 'Featured Salons', hi: 'फीचर्ड सैलून' },
  'all.salons': { en: 'All Salons', hi: 'सभी सैलून' },
  'open.now': { en: 'Open Now', hi: 'अभी खुला' },
  'refer': { en: 'Refer & Earn', hi: 'रेफर करें और कमाएं' },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('lf_lang') as Lang) || 'en';
  });
  const [role, setRoleState] = useState<Role | null>(() => {
    return localStorage.getItem('lf_role') as Role | null;
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerProfile, setCustomerProfileState] = useState<CustomerProfile | null>(null);
  const [barberProfile, setBarberProfileState] = useState<BarberProfile | null>(null);
  const [allSalons, setAllSalons] = useState<BarberProfile[]>([]);
  const [syncPending, setSyncPending] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lf_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('lf_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lf_lang', l);
  };

  const setRole = (r: Role | null) => {
    setRoleState(r);
    if (r) localStorage.setItem('lf_role', r);
    else localStorage.removeItem('lf_role');
  };

  const setCustomerProfile = (p: CustomerProfile | null) => {
    setCustomerProfileState(p);
    if (p) localStorage.setItem('lf_customer', JSON.stringify(p));
    else localStorage.removeItem('lf_customer');
  };

  const setBarberProfile = (p: BarberProfile | null) => {
    setBarberProfileState(p);
    if (p) localStorage.setItem('lf_barber', JSON.stringify(p));
    else localStorage.removeItem('lf_barber');
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  // ─── REAL-TIME SALONS LISTENER ───
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'barbers'), (snapshot) => {
      const salons = snapshot.docs.map(d => d.data() as BarberProfile);
      // Sort by most recently created first
      salons.sort((a, b) => {
        const aTime = typeof a.createdAt === 'number' ? a.createdAt : 0;
        const bTime = typeof b.createdAt === 'number' ? b.createdAt : 0;
        return bTime - aTime;
      });
      setAllSalons(salons);
    }, (err) => {
      console.warn('Salon listener error:', err);
    });
    return () => unsub();
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const savedRole = localStorage.getItem('lf_role') as Role | null;
        if (savedRole === 'customer') {
          try {
            const snap = await getDoc(doc(db, 'customers', u.uid));
            if (snap.exists()) {
              const data = snap.data() as CustomerProfile;
              setCustomerProfile(data);
            } else {
              const local = localStorage.getItem('lf_customer');
              if (local) setCustomerProfileState(JSON.parse(local));
            }
          } catch {
            const local = localStorage.getItem('lf_customer');
            if (local) setCustomerProfileState(JSON.parse(local));
          }
        } else if (savedRole === 'barber') {
          try {
            const snap = await getDoc(doc(db, 'barbers', u.uid));
            if (snap.exists()) {
              const data = snap.data() as BarberProfile;
              setBarberProfile(data);
            } else {
              const local = localStorage.getItem('lf_barber');
              if (local) setBarberProfileState(JSON.parse(local));
            }
          } catch {
            const local = localStorage.getItem('lf_barber');
            if (local) setBarberProfileState(JSON.parse(local));
          }
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      throw err;
    }
  };

  const signOutUser = async () => {
    try { await fbSignOut(auth); } catch {}
    setUser(null);
    setRole(null);
    setCustomerProfile(null);
    setBarberProfile(null);
    localStorage.removeItem('lf_role');
    localStorage.removeItem('lf_customer');
    localStorage.removeItem('lf_barber');
  };

  const saveCustomerProfile = async (p: CustomerProfile) => {
    setCustomerProfile(p);
    try {
      await setDoc(doc(db, 'customers', p.uid), p, { merge: true });
    } catch (e) {
      console.warn('Firestore save failed, saved locally:', e);
    }
  };

  // Retry helper: tries up to 3 times with exponential backoff
  const firestoreRetry = async (fn: () => Promise<void>, retries = 3): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
      try {
        await fn();
        return true;
      } catch (e) {
        console.warn(`Firestore write attempt ${i + 1}/${retries} failed:`, e);
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
      }
    }
    return false;
  };

  // Background sync: non-blocking save with auto-retry
  const pendingProfileRef = { current: null as BarberProfile | null };

  const syncBarberToFirestore = async (p: BarberProfile) => {
    setSyncPending(true);
    const success = await firestoreRetry(() =>
      setDoc(doc(db, 'barbers', p.uid), p, { merge: true })
    );
    if (success) {
      setSyncPending(false);
      pendingProfileRef.current = null;
      console.log('✅ Barber profile synced to Firestore');
    } else {
      // Keep pending for auto-retry
      pendingProfileRef.current = p;
      console.warn('⚠️ Barber profile sync pending, will auto-retry...');
    }
    return success;
  };

  // Auto-retry pending syncs every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingProfileRef.current) {
        console.log('🔄 Auto-retrying barber profile sync...');
        syncBarberToFirestore(pendingProfileRef.current);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const saveBarberProfile = async (p: BarberProfile): Promise<boolean> => {
    setBarberProfile(p); // Save locally immediately — this is instant
    // Fire-and-forget: start background sync, don't await
    syncBarberToFirestore(p);
    return true; // Always return true — navigation is never blocked
  };

  const retrySyncBarberProfile = async (): Promise<boolean> => {
    if (!barberProfile) return false;
    return syncBarberToFirestore(barberProfile);
  };

  const searchSalons = async (q: string): Promise<BarberProfile[]> => {
    // Use real-time allSalons data instead of fetching again
    if (!q.trim()) return allSalons;
    const lower = q.toLowerCase();
    return allSalons.filter(s =>
      s.salonName?.toLowerCase().includes(lower) ||
      s.name?.toLowerCase().includes(lower) ||
      s.location?.toLowerCase().includes(lower)
    );
  };

  const getSalonById = async (id: string): Promise<BarberProfile | null> => {
    // First check real-time cache
    const cached = allSalons.find(s => s.uid === id);
    if (cached) return cached;
    // Fallback to direct Firestore read
    try {
      const snap = await getDoc(doc(db, 'barbers', id));
      if (snap.exists()) return snap.data() as BarberProfile;
    } catch {}
    return null;
  };

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const getSalonTokens = async (salonId: string, date: string): Promise<TokenEntry[]> => {
    try {
      const q2 = query(
        collection(db, 'tokens'),
        where('salonId', '==', salonId),
        where('date', '==', date)
      );
      const snap = await getDocs(q2);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TokenEntry));
    } catch {
      return [];
    }
  };

  const getCustomerTokens = async (customerId: string): Promise<TokenEntry[]> => {
    try {
      const today = getTodayStr();
      const q2 = query(
        collection(db, 'tokens'),
        where('customerId', '==', customerId),
        where('date', '==', today)
      );
      const snap = await getDocs(q2);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TokenEntry));
    } catch {
      return [];
    }
  };

  const getToken = async (token: Omit<TokenEntry, 'id'>): Promise<string | null> => {
    try {
      const ref = await addDoc(collection(db, 'tokens'), token);
      return ref.id;
    } catch (e) {
      console.error('Failed to get token:', e);
      return null;
    }
  };

  const cancelToken = async (tokenId: string) => {
    try {
      await updateDoc(doc(db, 'tokens', tokenId), { status: 'cancelled' });
    } catch (e) {
      console.error('Failed to cancel token:', e);
    }
  };

  const nextCustomer = async () => {
    if (!barberProfile || !user) return;
    const today = getTodayStr();
    try {
      const q2 = query(
        collection(db, 'tokens'),
        where('salonId', '==', user.uid),
        where('date', '==', today),
        where('status', '==', 'waiting')
      );
      const snap = await getDocs(q2);
      const tokens = snap.docs.map(d => ({ id: d.id, ...d.data() } as TokenEntry));
      tokens.sort((a, b) => a.tokenNumber - b.tokenNumber);
      
      const servingQ = query(
        collection(db, 'tokens'),
        where('salonId', '==', user.uid),
        where('date', '==', today),
        where('status', '==', 'serving')
      );
      const servingSnap = await getDocs(servingQ);
      for (const d of servingSnap.docs) {
        await updateDoc(doc(db, 'tokens', d.id), { status: 'done' });
      }
      
      if (tokens.length > 0) {
        const next = tokens[0];
        await updateDoc(doc(db, 'tokens', next.id!), { status: 'serving' });
        const newCurrent = next.tokenNumber;
        const updated = { ...barberProfile, currentToken: newCurrent };
        await saveBarberProfile(updated);
      }
    } catch (e) {
      console.error('nextCustomer error:', e);
    }
  };

  const toggleSalonOpen = async () => {
    if (!barberProfile) return;
    const newOpen = !barberProfile.isOpen;
    const updated = {
      ...barberProfile,
      isOpen: newOpen,
      isBreak: false,
      currentToken: newOpen ? 0 : barberProfile.currentToken,
      totalTokensToday: newOpen ? 0 : barberProfile.totalTokensToday,
    };
    await saveBarberProfile(updated);
  };

  const toggleSalonBreak = async () => {
    if (!barberProfile) return;
    const goingOnBreak = !barberProfile.isBreak;
    const updated = {
      ...barberProfile,
      isBreak: goingOnBreak,
      breakStartTime: goingOnBreak ? Date.now() : null,
    };
    await saveBarberProfile(updated);
  };

  const toggleSalonStop = async () => {
    if (!barberProfile) return;
    const updated = { ...barberProfile, isStopped: !barberProfile.isStopped };
    await saveBarberProfile(updated);
  };

  const continueTokens = async () => {
    if (!barberProfile) return;
    const updated = { ...barberProfile, isStopped: false };
    await saveBarberProfile(updated);
  };

  // ─── BARBER TRIAL / SUBSCRIPTION ───
  const getBarberTrialDaysLeft = (): number => {
    if (!barberProfile?.createdAt) return 30;
    const created = typeof barberProfile.createdAt === 'number' ? barberProfile.createdAt : Date.now();
    const daysSinceCreation = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysSinceCreation);
  };

  const isBarberTrialActive = (): boolean => {
    return getBarberTrialDaysLeft() > 0;
  };

  const isBarberSubscribed = (): boolean => {
    if (isBarberTrialActive()) return true;
    if (!barberProfile?.subscriptionExpiry) return false;
    return barberProfile.subscriptionExpiry > Date.now();
  };

  // ─── REVIEWS ───
  const addReview = async (review: Omit<ReviewEntry, 'id'>) => {
    try {
      await addDoc(collection(db, 'reviews'), review);
      // Update salon average rating
      const reviewsSnap = await getDocs(
        query(collection(db, 'reviews'), where('salonId', '==', review.salonId))
      );
      const allReviews = reviewsSnap.docs.map(d => d.data() as ReviewEntry);
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      // Update barber profile with new rating
      const salonDoc = await getDoc(doc(db, 'barbers', review.salonId));
      if (salonDoc.exists()) {
        await updateDoc(doc(db, 'barbers', review.salonId), {
          rating: Math.round(avgRating * 10) / 10,
          totalReviews: allReviews.length,
        });
      }
    } catch (e) {
      console.error('Failed to add review:', e);
    }
  };

  const getSalonReviews = async (salonId: string): Promise<ReviewEntry[]> => {
    try {
      const q2 = query(
        collection(db, 'reviews'),
        where('salonId', '==', salonId)
      );
      const snap = await getDocs(q2);
      const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() } as ReviewEntry));
      reviews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return reviews;
    } catch {
      return [];
    }
  };

  // ─── EARNINGS ───
  const getTodayEarnings = async (): Promise<number> => {
    if (!user) return 0;
    const today = getTodayStr();
    try {
      const q2 = query(
        collection(db, 'tokens'),
        where('salonId', '==', user.uid),
        where('date', '==', today),
        where('status', '==', 'done')
      );
      const snap = await getDocs(q2);
      return snap.docs.reduce((sum, d) => sum + ((d.data() as TokenEntry).totalPrice || 0), 0);
    } catch {
      return 0;
    }
  };

  // ─── MESSAGING ───
  const sendMessage = async (msg: Omit<MessageEntry, 'id'>): Promise<void> => {
    try {
      await addDoc(collection(db, 'messages'), msg);
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const getSalonMessages = async (salonId: string): Promise<MessageEntry[]> => {
    try {
      const q2 = query(
        collection(db, 'messages'),
        where('salonId', '==', salonId)
      );
      const snap = await getDocs(q2);
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageEntry));
      msgs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      return msgs;
    } catch {
      return [];
    }
  };

  const getBarberMessages = async (): Promise<MessageEntry[]> => {
    if (!user) return [];
    return getSalonMessages(user.uid);
  };

  const markMessageRead = async (messageId: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'messages', messageId), { read: true });
    } catch (e) {
      console.error('Failed to mark message read:', e);
    }
  };

  // ─── FAVORITES ───
  const toggleFavorite = (salonId: string) => {
    if (!customerProfile) return;
    const favs = customerProfile.favoriteSalons || [];
    const updated = favs.includes(salonId)
      ? favs.filter(id => id !== salonId)
      : [...favs, salonId];
    const newProfile = { ...customerProfile, favoriteSalons: updated };
    saveCustomerProfile(newProfile);
  };

  const isFavorite = (salonId: string): boolean => {
    return (customerProfile?.favoriteSalons || []).includes(salonId);
  };

  return (
    <AppContext.Provider value={{
      lang, setLang, role, setRole, user, loading,
      signInWithGoogle, signOutUser,
      customerProfile, setCustomerProfile, saveCustomerProfile,
      barberProfile, setBarberProfile, saveBarberProfile,
      retrySyncBarberProfile, syncPending,
      getToken, cancelToken,
      searchSalons, getSalonById, getSalonTokens, getCustomerTokens,
      allSalons,
      nextCustomer, toggleSalonOpen, toggleSalonBreak, toggleSalonStop, continueTokens,
      getBarberTrialDaysLeft, isBarberTrialActive, isBarberSubscribed,
      addReview, getSalonReviews, getTodayEarnings,
      sendMessage, getSalonMessages, getBarberMessages, markMessageRead,
      toggleFavorite, isFavorite,
      t,
      theme,
      toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}
