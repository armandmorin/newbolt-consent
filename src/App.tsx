import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeAuth } from './lib/auth';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientFormPage from './pages/ClientFormPage';
import ClientSnippetPage from './pages/ClientSnippetPage';
import ConsentBuilderPage from './pages/ConsentBuilderPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminsPage from './pages/AdminsPage';
import AdminFormPage from './pages/AdminFormPage';
import ActivityLogPage from './pages/ActivityLogPage';
import HelpCenterPage from './pages/HelpCenterPage';
import NotFoundPage from './pages/NotFoundPage';
import BillingPage from './pages/BillingPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import PlansPage from './pages/PlansPage';
import SuperAdminBillingPage from './pages/SuperAdminBillingPage';
import DomainSettingsPage from './pages/DomainSettingsPage';

function App() {
  useEffect(() => {
    // Initialize auth with default SuperAdmin if needed
    initializeAuth();
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/plans" element={<PlansPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/new" element={<ClientFormPage />} />
            <Route path="/clients/:id/edit" element={<ClientFormPage />} />
            <Route path="/clients/:id/snippet" element={<ClientSnippetPage />} />
            <Route path="/clients/:id/consent" element={<ConsentBuilderPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            
            {/* Billing routes */}
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/billing/payment-methods" element={<PaymentMethodsPage />} />
            
            {/* Admin management routes (SuperAdmin only) */}
            <Route path="/admins" element={<AdminsPage />} />
            <Route path="/admins/new" element={<AdminFormPage />} />
            <Route path="/admins/:id/edit" element={<AdminFormPage />} />
            <Route path="/activity-log" element={<ActivityLogPage />} />
            <Route path="/admin-billing" element={<SuperAdminBillingPage />} />
            <Route path="/domain-settings" element={<DomainSettingsPage />} />
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
