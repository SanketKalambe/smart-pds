import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import LandingPage from '../components/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import DistributorRegister from '../pages/auth/DistributorRegister';
import ConsumerRegister from '../pages/auth/ConsumerRegister';

import AdminDashboard from '../pages/admin/AdminDashboard';
import VerificationQueue from '../pages/admin/VerificationQueue';
import StockAllocation from '../pages/admin/StockAllocation';
import AdminComplaints from '../pages/admin/AdminComplaints';
import SystemSettingsPage from '../pages/admin/SystemSettingsPage';

import DistributorDashboard from '../pages/distributor/DistributorDashboard';
import EposTerminal from '../pages/distributor/EposTerminal';
import DistributorStock from '../pages/distributor/DistributorStock';
import DistributorSlots from '../pages/distributor/DistributorSlots';

import ConsumerDashboard from '../pages/consumer/ConsumerDashboard';
import RationBookPage from '../pages/consumer/RationBookPage';
import SlotBookingPage from '../pages/consumer/SlotBookingPage';
import ComplaintChatbox from '../pages/consumer/ComplaintChatbox';
import ConsumerHistoryPage from '../pages/consumer/ConsumerHistoryPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/distributor" element={<DistributorRegister />} />
      <Route path="/register/consumer" element={<ConsumerRegister />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/verification-queue" element={<VerificationQueue />} />
        <Route path="/admin/stock-allocation" element={<StockAllocation />} />
        <Route path="/admin/complaints" element={<AdminComplaints />} />
        <Route path="/admin/settings" element={<SystemSettingsPage />} />
      </Route>

      {/* Distributor Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['distributor']} />}>
        <Route path="/distributor" element={<DistributorDashboard />} />
        <Route path="/distributor/epos" element={<EposTerminal />} />
        <Route path="/distributor/stock" element={<DistributorStock />} />
        <Route path="/distributor/slots" element={<DistributorSlots />} />
      </Route>

      {/* Consumer Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['consumer']} />}>
        <Route path="/consumer" element={<ConsumerDashboard />} />
        <Route path="/consumer/ration-book" element={<RationBookPage />} />
        <Route path="/consumer/slots" element={<SlotBookingPage />} />
        <Route path="/consumer/complaints" element={<ComplaintChatbox />} />
        <Route path="/consumer/history" element={<ConsumerHistoryPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
