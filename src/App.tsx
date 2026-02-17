import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/pages/Home';
import AdminLogin from './components/pages/AdminLogin';
import Signup from './components/pages/Signup';
import Register from './components/pages/Register';
import Ticketpage from './components/pages/Ticketpage';
import Tickets from './components/pages/Tickets';
import TicketsSimple from './components/pages/TicketsSimple';
import TicketsImproved from './components/pages/TicketsImproved';
import TicketsCompact from './components/pages/TicketsCompact';
import Confirmation from './components/pages/Confirmation';
import ConfirmationImproved from './components/pages/ConfirmationImproved';
import ConfirmationCompact from './components/pages/ConfirmationCompact';
import Payment from './components/pages/Payment';
import PaymentImproved from './components/pages/PaymentImproved';
import ProfessionalTicket from './components/pages/ProfessionalTicket';
import ProfessionalTicketImproved from './components/pages/ProfessionalTicketImproved';
import PaymentCompact from './components/pages/PaymentCompact';
import ProfessionalTicketCompact from './components/pages/ProfessionalTicketCompact';
import ModernAdminDashboard from './components/pages/ModernAdminDashboard';
import ProfessionalAdminDashboard from './components/pages/ProfessionalAdminDashboard';
import TravelerDashboard from './components/pages/TravelerDashboard';
import Cancel from './components/pages/Cancel';
import ProtectedRoute from './components/PrivateRoute';
import CityManagement from './components/admin/CityManagement';
import RouteManagement from './components/admin/RouteManagement';
import BusFleetManagement from './components/admin/BusFleetManagement';
import VoyageManagement from './components/admin/VoyageManagement';
import TarifManagement from './components/admin/TarifManagement';
import ReservationManagement from './components/admin/ReservationManagement';
import PaymentManagement from './components/admin/PaymentManagement';
import UserManagement from './components/admin/UserManagement';
import BusPage from './components/pages/BusPage';
import TravelsPage from './components/pages/TravelsPage';
import DestinationsPage from './components/pages/DestinationsPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<Register />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Redirect /admin to /admin/dashboard */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Info Pages */}
      <Route path="/bus" element={<BusPage />} />
      <Route path="/travels" element={<TravelsPage />} />
      <Route path="/destinations" element={<DestinationsPage />} />

      {/* Ticket Routes */}
      <Route path="/tickets" element={<Ticketpage />} />
      <Route path="/ticket-details" element={<Tickets />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/ticket" element={<ProfessionalTicket />} />
      <Route path="/cancel" element={<Cancel />} />
      
      {/* Protected Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRole="admin">
            <ProfessionalAdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/cities" 
        element={
          <ProtectedRoute allowedRole="admin">
            <CityManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/routes" 
        element={
          <ProtectedRoute allowedRole="admin">
            <RouteManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/buses" 
        element={
          <ProtectedRoute allowedRole="admin">
            <BusFleetManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/voyages" 
        element={
          <ProtectedRoute allowedRole="admin">
            <VoyageManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/tarifs" 
        element={
          <ProtectedRoute allowedRole="admin">
            <TarifManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reservations" 
        element={
          <ProtectedRoute allowedRole="admin">
            <ReservationManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/payments" 
        element={
          <ProtectedRoute allowedRole="admin">
            <PaymentManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/traveler/dashboard" 
        element={
          <ProtectedRoute allowedRole="voyageur">
            <TravelerDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
