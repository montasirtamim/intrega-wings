import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ScrollManager } from './components/ScrollManager';
import { AppProvider } from './context/AppContext';
import { BookingPage } from './pages/BookingPage';
import { FlightsPage } from './pages/FlightsPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { SignUpPage } from './pages/SignUpPage';
import { ToursPage } from './pages/ToursPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollManager />
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
