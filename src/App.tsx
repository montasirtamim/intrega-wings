import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { PageTransition } from './components/PageTransition';
import { ScrollManager } from './components/ScrollManager';
import { AppProvider, useApp } from './context/AppContext';
import { AdminPage } from './pages/AdminPage';
import { BookingPage } from './pages/BookingPage';
import { ContactPage } from './pages/ContactPage';
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
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.25 }}
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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/flights"
          element={
            <PageTransition>
              <FlightsPage />
            </PageTransition>
          }
        />
        <Route
          path="/booking"
          element={
            <PageTransition>
              <BookingPage />
            </PageTransition>
          }
        />
        <Route
          path="/booking/:flightId"
          element={
            <PageTransition>
              <BookingPage />
            </PageTransition>
          }
        />
        <Route
          path="/tours"
          element={
            <PageTransition>
              <ToursPage />
            </PageTransition>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <PageTransition>
              <MyBookingsPage />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <ContactPage />
            </PageTransition>
          }
        />
        <Route
          path="/admin"
          element={
            <PageTransition>
              <AdminPage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/signup"
          element={
            <PageTransition>
              <SignUpPage />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ScrollManager />
          <GlobalAuthToast />
          <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070F1D] text-[#1E293B] dark:text-[#F1F5F9] transition-colors duration-300">
            <Navbar />

            <main className="flex-1">
              <AnimatedRoutes />
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </AppProvider>
    </MotionConfig>
  );
}

export default App;
