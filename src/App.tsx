import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import LanguageSelect from './pages/LanguageSelect';
import RoleSelect from './pages/RoleSelect';
import CustomerAuth from './pages/CustomerAuth';
import BarberAuth from './pages/BarberAuth';
import CustomerProfileSetup from './pages/CustomerProfileSetup';
import BarberProfileSetup from './pages/BarberProfileSetup';
import CustomerHome from './pages/CustomerHome';
import CustomerSearch from './pages/CustomerSearch';
import SalonDetail from './pages/SalonDetail';
import CustomerTokens from './pages/CustomerTokens';
import CustomerProfileEdit from './pages/CustomerProfileEdit';
import CustomerSubscription from './pages/CustomerSubscription';
import CustomerHairstyles from './pages/CustomerHairstyles';
import BarberHome from './pages/BarberHome';
import BarberCustomers from './pages/BarberCustomers';
import BarberProfile from './pages/BarberProfile';
import BarberSubscription from './pages/BarberSubscription';
import CustomerChat from './pages/CustomerChat';
import BarberMessages from './pages/BarberMessages';

function AuthGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole: 'customer' | 'barber' }) {
  const { user, role, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-3xl">✂️</span>
          </div>
          <p className="text-text-dim">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={requiredRole === 'customer' ? '/customer/auth' : '/barber/auth'} replace />;
  }

  if (role !== requiredRole) {
    return <Navigate to="/role" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-4xl">✂️</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Line Free
          </h1>
          <p className="text-text-dim mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LanguageSelect />} />
      <Route path="/role" element={<RoleSelect />} />
      
      {/* Auth Routes - no guard needed, page handles it */}
      <Route path="/customer/auth" element={<CustomerAuth />} />
      <Route path="/barber/auth" element={<BarberAuth />} />
      
      {/* Setup Routes - only need user logged in */}
      <Route path="/customer/setup" element={<CustomerProfileSetup />} />
      <Route path="/barber/setup" element={<BarberProfileSetup />} />
      
      {/* Customer Protected Routes */}
      <Route path="/customer/home" element={<AuthGuard requiredRole="customer"><CustomerHome /></AuthGuard>} />
      <Route path="/customer/search" element={<AuthGuard requiredRole="customer"><CustomerSearch /></AuthGuard>} />
      <Route path="/customer/salon/:id" element={<AuthGuard requiredRole="customer"><SalonDetail /></AuthGuard>} />
      <Route path="/customer/tokens" element={<AuthGuard requiredRole="customer"><CustomerTokens /></AuthGuard>} />
      <Route path="/customer/profile" element={<AuthGuard requiredRole="customer"><CustomerProfileEdit /></AuthGuard>} />
      <Route path="/customer/subscription" element={<AuthGuard requiredRole="customer"><CustomerSubscription /></AuthGuard>} />
      <Route path="/customer/hairstyles" element={<AuthGuard requiredRole="customer"><CustomerHairstyles /></AuthGuard>} />
      <Route path="/customer/chat/:salonId" element={<AuthGuard requiredRole="customer"><CustomerChat /></AuthGuard>} />

      {/* Barber Protected Routes */}
      <Route path="/barber/home" element={<AuthGuard requiredRole="barber"><BarberHome /></AuthGuard>} />
      <Route path="/barber/customers" element={<AuthGuard requiredRole="barber"><BarberCustomers /></AuthGuard>} />
      <Route path="/barber/profile" element={<AuthGuard requiredRole="barber"><BarberProfile /></AuthGuard>} />
      <Route path="/barber/subscription" element={<AuthGuard requiredRole="barber"><BarberSubscription /></AuthGuard>} />
      <Route path="/barber/messages" element={<AuthGuard requiredRole="barber"><BarberMessages /></AuthGuard>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
