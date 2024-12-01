import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthGuard from './components/AuthGuard';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PropertyPage from './pages/PropertyPage';
import GuestView from './pages/GuestView';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/guest/:propertyId" element={<GuestView />} />
        <Route path="/dashboard/*" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/property/:id" element={<AuthGuard><PropertyPage /></AuthGuard>} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;