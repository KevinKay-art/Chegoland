import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AskChegolandWidget } from './components/AskChegolandWidget.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { Footer } from './components/Footer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AppProvider } from './hooks/useAppContext.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.tsx';
import { ShopPage } from './pages/ShopPage.tsx';
import { TrackOrderPage } from './pages/TrackOrderPage.tsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8E7] text-[#2C1E16]">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CheckoutPage />} />
          <Route path="/order/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      {!isAdmin && <AskChegolandWidget />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}
