import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ScrollManager } from './components/ScrollManager';
import { AppProvider, useApp } from './context/AppContext';
import { BookingPage } from './pages/BookingPage';
import { FlightsPage } from './pages/FlightsPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { SignUpPage } from './pages/SignUpPage';
import { ToursPage } from './pages/ToursPage';

function GlobalAuthToast() {
  const { toastMessage, clearToast } = useApp();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          role="alert"
          className="fixed top-24 right-4 left-4 sm:left-auto sm:max-w-md z-50 px-4 py-3.5 rounded-xl bg-[#0B1F3A] text-white border border-[#C5A059]/60 shadow-2xl flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <Lock className="w-4 h-4 text-[#D8B774] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={clearToast}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollManager />
        <GlobalAuthToast />
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070F1D] text-[#1E293B] dark:text-[#F1F5F9] transition-colors duration-300">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/flights" element={<FlightsPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/booking/:flightId" element={<BookingPage />} />
              <Route path="/tours" element={<ToursPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
