import { Routes, Route } from 'react-router-dom';

// Pages publiques
import Home                     from './components/pages/Home';
import TravelerLogin            from './components/pages/TravelerLogin';
import SetupPassword            from './components/pages/SetupPassword';
import Ticketpage               from './components/pages/Ticketpage';
import Confirmation             from './components/pages/Confirmation';
import Payment                  from './components/pages/Payment';
import ProfessionalTicket       from './components/pages/ProfessionalTicket';
import ScanPage                 from './components/pages/ScanPage';
import TicketScan               from './components/pages/TicketScan';
import TravelerDashboard        from './components/pages/TravelerDashboard';
import AgencyDashboard          from './components/pages/AgencyDashboard';

// Guard
import PrivateRoute             from './components/PrivateRoute';

// Layout admin partagé (sidebar persistante)
import AdminLayout              from './components/Layouts/AdminLayout';

// Pages admin — contenu uniquement (plus de sidebar propre)
import ProfessionalAdminDashboard from './components/pages/ProfessionalAdminDashboard';
import CityManagement           from './components/admin/CityManagement';
import RouteManagement          from './components/admin/RouteManagement';
import BusFleetManagement       from './components/admin/BusFleetManagement';
import VoyageManagement         from './components/admin/VoyageManagement';
import TarifManagement          from './components/admin/TarifManagement';
import ReservationManagement    from './components/admin/ReservationManagement';
import PaymentManagement        from './components/admin/PaymentManagement';
import UserManagement           from './components/admin/UserManagement';
import AgencyManagement         from './components/admin/AgencyManagement';
import TripValidation           from './components/admin/TripValidation';
import DisputeManagement        from './components/admin/DisputeManagement';

// Wrapper : applique PrivateRoute à chaque page enfant du layout admin
const AdminPrivate = ({ children }: { children: React.ReactNode }) => (
  <PrivateRoute allowedRole="admin">{children}</PrivateRoute>
);

function App() {
  return (
    <Routes>

      {/* ── Routes publiques ── */}
      <Route path="/"               element={<Home />} />
      <Route path="/login"          element={<TravelerLogin />} />
      <Route path="/setup-password" element={<SetupPassword />} />
      <Route path="/tickets"        element={<Ticketpage />} />
      <Route path="/confirmation"   element={<Confirmation />} />
      <Route path="/payment"        element={<Payment />} />
      <Route path="/ticket"         element={<ProfessionalTicket />} />
      {/* Note : deux routes identiques /scan/:ticketNumber — on garde la plus récente */}
      <Route path="/scan/:ticketNumber" element={<ScanPage />} />

      {/* ── Routes voyageur ── */}
      <Route path="/traveler-dashboard" element={
        <PrivateRoute allowedRole="voyageur"><TravelerDashboard /></PrivateRoute>
      } />

      {/* ── Routes agence ── */}
      <Route path="/agency-dashboard" element={
        <PrivateRoute allowedRole="agence"><AgencyDashboard /></PrivateRoute>
      } />

      {/*
        ── Routes Admin ────────────────────────────────────────────
        Toutes imbriquées sous AdminLayout :
        → La sidebar est rendue UNE SEULE FOIS par AdminLayout
        → <Outlet /> affiche le contenu de la page active
        → Plus besoin de sidebar dans chaque composant admin
      */}
      <Route
        path="/admin-dashboard"
        element={
          <AdminPrivate>
            <AdminLayout />
          </AdminPrivate>
        }
      >
        {/* index = /admin-dashboard */}
        <Route index element={<ProfessionalAdminDashboard />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminPrivate>
            <AdminLayout />
          </AdminPrivate>
        }
      >
        {/* /admin/cities, /admin/routes, etc. */}
        <Route path="cities"          element={<CityManagement />} />
        <Route path="routes"          element={<RouteManagement />} />
        <Route path="buses"           element={<BusFleetManagement />} />
        <Route path="voyages"         element={<VoyageManagement />} />
        <Route path="tarifs"          element={<TarifManagement />} />
        <Route path="reservations"    element={<ReservationManagement />} />
        <Route path="payments"        element={<PaymentManagement />} />
        <Route path="users"           element={<UserManagement />} />
        <Route path="agencies"        element={<AgencyManagement />} />
        <Route path="trip-validation" element={<TripValidation />} />
        <Route path="disputes"        element={<DisputeManagement />} />
      </Route>

    </Routes>
  );
}

export default App;
