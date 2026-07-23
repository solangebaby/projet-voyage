import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '  https://wager-motion-mute.ngrok-free.dev -> http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 globally (token expired/invalid)
// FIX : Routes publiques qui ne doivent PAS déclencher une redirection /login
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/auth/setup-account',
  '/auth/activate-account',
];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';

      // Ne rediriger que si ce n'est pas une route publique
      const isPublicRoute = PUBLIC_ROUTES.some(route => requestUrl.includes(route));

      if (!isPublicRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth_token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  first_name: string;
  email: string;
  phone?: string;
  cni_number?: string;
  civility?: string;
  gender?: string;
  role: 'admin' | 'voyageur' | 'agence';
  status: 'active' | 'pending';
}

export interface Destination {
  id: number;
  city_name: string;
  region?: string;
  country?: string;
}

export interface Agency {
  id: number;
  user_id?: number;
  destination_id: number;
  agency_name: string;
  neighborhood: string;
  address?: string;
  phone?: string;
  is_main_station: boolean;
  destination?: Destination;
}

export interface Bus {
  id: number;
  bus_name: string;
  plate_number?: string;
  total_seats: number;
  seat_layout?: any;
  amenities?: string[];
  agency_id?: number;
  type?: string;
}

export interface Trip {
  id: number;
  departure_id: number;
  destination_id: number;
  bus_id: number;
  agency_id?: number;
  departure_date: string;
  departure_time: string;
  arrival_time?: string;
  price: number;
  available_seats: number;
  occupied_seats?: string[];
  status: string;
  validation_status?: string;
  notes?: string;
  departure?: Destination;
  destination?: Destination;
  bus?: Bus;
  agency?: Agency;
  departureAgency?: Agency;
  agency_data?: Agency;
}

export interface Reservation {
  id: number;
  trip_id: number;
  user_id?: number;
  passenger_first_name: string;
  passenger_last_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_gender?: string;
  passenger_cni?: string;
  passenger_nationality?: string;
  selected_seat: string;
  seat_number?: string;
  status: string;
  payment_status?: string;
  payment_type?: string;
  counter_status?: string;
  trip?: Trip;
  ticket?: { ticket_number: string; qr_code?: string };
  created_at?: string;
}

export interface Payment {
  id: number;
  reservation_id: number;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id?: string;
  created_at?: string;
  reservation?: Reservation;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  qr_code?: string;
  reservation_id: number;
  status?: string;
  downloaded_at?: string;
  created_at?: string;
  reservation?: Reservation;
}

export interface Comment {
  id: number;
  user_id?: number;
  guest_name?: string;
  comment: string;
  rating: number;
  status?: string;
  created_at?: string;
}

export interface Dispute {
  id: number;
  user_id: number;
  agency_id?: number;
  reservation_id?: number;
  type: string;
  subject: string;
  description: string;
  status: string;
  resolution?: string;
  created_at?: string;
  user?: User;
  agency?: Agency;
  reservation?: Reservation;
}

export interface Promotion {
  id: number;
  agency_id?: number;
  code: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_amount?: number;
  max_discount?: number;
  max_uses?: number;
  uses_count: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
}

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────

export const authService = {
  getToken: (): string =>
    localStorage.getItem('token') || sessionStorage.getItem('auth_token') || '',

  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getUser: (): User | null => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated: (): boolean => {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('auth_token'));
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_token');
  },

  login: async (email: string, password: string) => {
    const res = await apiClient.post('/login', { email, password });
    return res.data;
  },
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const login           = async (email: string, password: string) => (await apiClient.post('/login', { email, password })).data;
export const register        = async (data: any) => (await apiClient.post('/register', data)).data;
export const logout          = async () => (await apiClient.post('/logout')).data;
export const getUser         = async () => (await apiClient.get('/user')).data;
export const activateAccount = async (data: any) => (await apiClient.post('/auth/activate-account', data)).data;
export const setupAccount    = async (data: any) => (await apiClient.post('/auth/setup-account', data)).data;

// ─── DESTINATIONS ─────────────────────────────────────────────────────────────

export const getDestinations = async (): Promise<Destination[]> => {
  const res = await apiClient.get('/destinations');
  return res.data.data || res.data || [];
};

// ─── TRIPS ───────────────────────────────────────────────────────────────────

export const getTrips = async (): Promise<Trip[]> => {
  const res = await apiClient.get('/trips');
  return res.data.data || res.data || [];
};

export const searchTrips = async (params: {
  departure?: string | number;
  destination?: string | number;
  date?: string;
}): Promise<Trip[]> => {
  const searchParams: any = {};
  if (params.departure)   searchParams.departure_id   = params.departure;
  if (params.destination) searchParams.destination_id = params.destination;
  if (params.date)        searchParams.date            = params.date;
  const res = await apiClient.get('/trips/search', { params: searchParams });
  return res.data.data || [];
};

export const getTrip = async (id: number): Promise<Trip> => {
  const res = await apiClient.get(`/trips/${id}`);
  return res.data.data;
};

// ─── RESERVATIONS ─────────────────────────────────────────────────────────────

export const createReservation = async (data: {
  trip_id: number;
  selected_seat: string;
  passenger_first_name: string;
  passenger_last_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_gender: 'M' | 'F';
  passenger_cni: string;
  passenger_nationality?: string;
  payment_type?: 'counter' | 'online';
}): Promise<Reservation> => {
  const res = await apiClient.post('/reservations', data);
  return res.data.data;
};
export const createBulkReservation = async (data: {
  trip_id: number;
  selected_seats: string[];
  passenger_first_name: string;
  passenger_last_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_gender: string;
  passenger_cni: string;
}) => {
  const res = await apiClient.post('/reservations/bulk', data);
  return res.data;
};

export const getReservation      = async (id: number): Promise<Reservation> => (await apiClient.get(`/reservations/${id}`)).data.data;
export const getUserReservations = async (userId: number): Promise<Reservation[]> => (await apiClient.get(`/reservations/user/${userId}`)).data.data || [];
export const cancelReservation   = async (id: number) => (await apiClient.post(`/reservations/${id}/cancel`)).data;

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export const initiatePayment = async (data: {
  reservation_id: number;
  amount: number;
  payment_method: string;
  phone_number?: string;
}) => {
  const res = await apiClient.post('/payments/initiate', data);
  return res.data.data || res.data;
};

export const verifyPayment   = async (transactionId: string) => (await apiClient.post('/payments/verify', { transaction_id: transactionId })).data;
export const getUserPayments = async (userId: number): Promise<Payment[]> => (await apiClient.get(`/payments/user/${userId}`)).data.data || [];

// ─── TICKETS ─────────────────────────────────────────────────────────────────

export const getTicketByNumber    = async (num: string): Promise<Ticket> => (await apiClient.get(`/tickets/${num}`)).data.data;
export const getTicketForScan     = async (num: string) => (await apiClient.get(`/tickets/${num}/scan`)).data.data;
export const getUserTickets       = async (userId: number): Promise<Ticket[]> => (await apiClient.get(`/tickets/user/${userId}`)).data.data || [];
export const markTicketDownloaded = async (num: string) => (await apiClient.post(`/tickets/${num}/download`)).data;
export const downloadTicketPdf   = async (num: string): Promise<Blob> => (await apiClient.get(`/tickets/${num}/pdf`, { responseType: 'blob' })).data;

// ─── AGENCIES ────────────────────────────────────────────────────────────────

export const getAgencies = async (): Promise<Agency[]> => {
  const res = await apiClient.get('/agencies');
  return res.data.data || res.data || [];
};

// ─── AGENCY DASHBOARD ────────────────────────────────────────────────────────

export const getAgencyStats        = async () => (await apiClient.get('/agency/stats')).data;
export const getAgencyTrips        = async (params?: any) => (await apiClient.get('/agency/trips', { params })).data;
export const getAgencyReservations = async (params?: any) => (await apiClient.get('/agency/reservations', { params })).data;
export const getAgencyPayments     = async (params?: any) => (await apiClient.get('/agency/payments', { params })).data;
export const getAgencyProfile      = async () => (await apiClient.get('/agency/profile')).data;
export const createTrip            = async (data: any) => (await apiClient.post('/agency/trips', data)).data;
export const submitTrip            = async (id: number) => (await apiClient.post(`/agency/trips/${id}/submit`)).data;
export const cancelTrip            = async (id: number) => (await apiClient.post(`/agency/trips/${id}/cancel`)).data;
export const updateTrip            = async (id: number, data: any) => (await apiClient.put(`/agency/trips/${id}`, data)).data;
export const getTripPassengers     = async (id: number) => (await apiClient.get(`/agency/trips/${id}/passengers`)).data;
export const getBuses              = async () => (await apiClient.get('/agency/buses')).data;

/** Grouped agencyService object for components that prefer it */
export const agencyService = {
  getStats:         getAgencyStats,
  getTrips:         getAgencyTrips,
  getReservations:  getAgencyReservations,
  getPayments:      getAgencyPayments,
  getProfile:       getAgencyProfile,
  createTrip,
  submitTrip,
  cancelTrip,
  updateTrip,
  getTripPassengers,
  getBuses,
};

// ─── COMMENTS ────────────────────────────────────────────────────────────────

export const getComments = async () => (await apiClient.get('/comments')).data;
export const postComment = async (data: any) => (await apiClient.post('/comments', data)).data;

// ─── ADMIN ───────────────────────────────────────────────────────────────────

export const getStatistics = async () => (await apiClient.get('/admin/stats')).data;
export const getCities     = async () => (await apiClient.get('/admin/agencies')).data; // Ou crée une route /admin/cities si nécessaire
export const getFleetBuses = async () => (await apiClient.get('/admin/fleet/buses')).data;
export const createCity          = async (data: any) => (await apiClient.post('/cities', data)).data;
export const updateCity          = async (id: number, data: any) => (await apiClient.put(`/cities/${id}`, data)).data;
export const deleteCity          = async (id: number) => (await apiClient.delete(`/cities/${id}`)).data;
export const getRoutes           = async () => (await apiClient.get('/routes')).data;
export const createRoute         = async (data: any) => (await apiClient.post('/routes', data)).data;
export const updateRoute         = async (id: number, data: any) => (await apiClient.put(`/routes/${id}`, data)).data;
export const deleteRoute         = async (id: number) => (await apiClient.delete(`/routes/${id}`)).data;
export const createBus           = async (data: any) => (await apiClient.post('/fleet/buses', data)).data;
export const updateBus           = async (id: number, data: any) => (await apiClient.put(`/fleet/buses/${id}`, data)).data;
export const deleteBus           = async (id: number) => (await apiClient.delete(`/fleet/buses/${id}`)).data;
export const getVoyages          = async () => (await apiClient.get('/voyages')).data;
export const createVoyage        = async (data: any) => (await apiClient.post('/voyages', data)).data;
export const updateVoyage        = async (id: number, data: any) => (await apiClient.put(`/voyages/${id}`, data)).data;
export const deleteVoyage        = async (id: number) => (await apiClient.delete(`/voyages/${id}`)).data;
export const updateCommentStatus = async (id: number, status: string) => (await apiClient.put(`/comments/${id}/status`, { status })).data;
export const deleteComment       = async (id: number) => (await apiClient.delete(`/comments/${id}`)).data;

// ─── PROMOTIONS (AGENCY) ─────────────────────────────────────────────────────

export const getPromotions   = async () => (await apiClient.get('/agency/promotions')).data;
export const createPromotion = async (data: any) => (await apiClient.post('/agency/promotions', data)).data;
export const updatePromotion = async (id: number, data: any) => (await apiClient.put(`/agency/promotions/${id}`, data)).data;
export const deletePromotion = async (id: number) => (await apiClient.delete(`/agency/promotions/${id}`)).data;
export const togglePromotion = async (id: number) => (await apiClient.post(`/agency/promotions/${id}/toggle`)).data;
export const applyPromoCode  = async (data: any) => (await apiClient.post('/promotions/apply', data)).data;

// ─── DISPUTES (VOYAGEUR) ─────────────────────────────────────────────────────

export const getMyDisputes = async () => (await apiClient.get('/disputes/my')).data;
export const createDispute = async (data: any) => (await apiClient.post('/disputes', data)).data;

// ─── ADMIN — AGENCIES ────────────────────────────────────────────────────────

export const adminGetAgencies    = async (params?: any) => (await apiClient.get('/admin/agencies', { params })).data;
export const adminGetAgencyStats = async () => (await apiClient.get('/admin/agencies/stats')).data;
export const adminApproveAgency  = async (id: number) => (await apiClient.post(`/admin/agencies/${id}/approve`)).data;
export const adminSuspendAgency  = async (id: number) => (await apiClient.post(`/admin/agencies/${id}/suspend`)).data;
export const adminRejectAgency   = async (id: number) => (await apiClient.post(`/admin/agencies/${id}/reject`)).data;

// ─── ADMIN — DISPUTES ────────────────────────────────────────────────────────

export const adminGetDisputes     = async (params?: any) => (await apiClient.get('/admin/disputes', { params })).data;
export const adminGetDisputeStats = async () => (await apiClient.get('/admin/disputes/stats')).data;
export const adminGetDispute      = async (id: number) => (await apiClient.get(`/admin/disputes/${id}`)).data;
export const adminUpdateDispute   = async (id: number, data: any) => (await apiClient.put(`/admin/disputes/${id}`, data)).data;

// ─── ADMIN — TRIP VALIDATION ─────────────────────────────────────────────────

export const adminGetPendingTrips = async () => (await apiClient.get('/admin/trips/pending')).data;
export const adminApproveTrip     = async (id: number) => (await apiClient.post(`/admin/trips/${id}/approve`)).data;
export const adminRejectTrip      = async (id: number, data: any) => (await apiClient.post(`/admin/trips/${id}/reject`, data)).data;

export const api = apiClient;
export default apiClient;
