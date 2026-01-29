import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import AdminLogin from './components/pages/AdminLogin';
import Signup from './components/pages/Signup';
import Register from './components/pages/Register';
import Ticketpage from './components/pages/Ticketpage';
import Tickets from './components/pages/Tickets';
import Confirmation from './components/pages/Confirmation';
import Payment from './components/pages/Payment';
import Confirmationpage from './components/pages/Confirmationpage';
import Admindashboard from './components/pages/Admindashboard';
import TravelerDashboard from './components/pages/TravelerDashboard';
import Cancel from './components/pages/Cancel';
import ProtectedRoute from './components/PrivateRoute';
import CityManagement from './components/admin/CityManagement';
import RouteManagement from './components/admin/RouteManagement';
import BusFleetManagement from './components/admin/BusFleetManagement';
import VoyageManagement from './components/admin/VoyageManagement';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<Register />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Ticket Routes */}
      <Route path="/tickets" element={<Ticketpage />} />
      <Route path="/ticket-details" element={<Tickets />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/ticket" element={<Confirmationpage />} />
      <Route path="/cancel" element={<Cancel />} />
      
      {/* Protected Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRole="admin">
            <Admindashboard />
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
