// API Service for Laravel Backend
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface User {
  id: number;
  name: string;
  first_name: string;
  email: string;
  phone?: string;
  cni_number?: string;
  civility?: string;
  gender?: string;
  role: 'admin' | 'voyageur';
  status: 'active' | 'pending';
}

export interface Bus {
  id: number;
  bus_name: string;
  matricule: string;
  type: 'standard' | 'vip';
  total_seats: number;
  price: number;
  features?: string[];
}

export interface Destination {
  id: number;
  city_name: string;
}

export interface Agency {
  id: number;
  destination_id: number;
  agency_name: string;
  neighborhood: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  is_main_station: boolean;
  destination?: Destination;
}

export interface Trip {
  price:number;
 // (price: any): import("react").ReactNode | Iterable<import("react").ReactNode>;
  id: number;
  bus_id: number;
  departure_id: number;
  destination_id: number;
  departure_agency_id?: number;
  arrival_agency_id?: number;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  available_seats: number;
  occupied_seats?: string[];
  distance_km?: number;
  status: 'active' | 'completed' | 'cancelled';
  bus?: Bus;
  departure?: Destination;
  destination?: Destination;
  departureAgency?: Agency;
  arrivalAgency?: Agency;
}

export interface Reservation {
  id: number;
  user_id: number;
  trip_id: number;
  departure_agency_id?: number;
  arrival_agency_id?: number;
  selected_seat: string;
  passenger_name?: string;
  passenger_first_name?: string;
  passenger_last_name?: string;
  passenger_email?: string;
  passenger_phone?: string;
  passenger_gender?: 'M' | 'F';
  passenger_cni?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  expires_at?: string;
  cancelled_at?: string;
  trip?: Trip;
  payment?: Payment;
  ticket?: Ticket;
}

export interface Payment {
  id: number;
  reservation_id: number;
  transaction_id: string;
  reference: string;
  amount: number;
  currency: string;
  method: 'MTN' | 'Orange' | 'Bancaire';
  phone_number?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  completed_at?: string;
  refunded_at?: string;
}

export interface Ticket {
  id: number;
  reservation_id: number;
  ticket_number: string;
  qr_code?: string;
  status: 'valid' | 'used' | 'cancelled';
  reservation?: Reservation;
}

export interface PassengerInput {
  firstName: string;
  lastName: string;
  cniNumber: string;
  email: string;
  phone: string;
  gender: 'M' | 'F';
}

// API Functions

// Authentication
export const register = async (data: any) => {
  const response = await apiClient.post('/register', data);
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await apiClient.post('/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/logout');
  return response.data;
};

export const getUser = async () => {
  const response = await apiClient.get('/user');
  return response.data;
};

// Destinations
export const getDestinations = async (): Promise<Destination[]> => {
  try {
    const response = await apiClient.get('/destinations');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw new Error('Failed to load destinations. Please check your connection and try again.');
  }
};

// Buses
export const getBuses = async (): Promise<Bus[]> => {
  const response = await apiClient.get('/buses');
  return response.data.data;
};

export const getBus = async (id: number): Promise<Bus> => {
  const response = await apiClient.get(`/buses/${id}`);
  return response.data.data;
};

// Trips
export const getTrips = async (): Promise<Trip[]> => {
  const response = await apiClient.get('/trips');
  return response.data.data;
};

export const searchTrips = async (params: {
  departure?: string | number;
  destination?: string | number;
  date?: string;
}): Promise<Trip[]> => {
  // If departure and destination are provided, convert to API format
  const searchParams: any = { ...params };
  
  // API expects departure_id and destination_id (numbers)
  if (params.departure) {
    searchParams.departure_id = params.departure;
    delete searchParams.departure;
  }
  if (params.destination) {
    searchParams.destination_id = params.destination;
    delete searchParams.destination;
  }
  
  const response = await apiClient.get('/trips/search', { params: searchParams });
  return response.data.data;
};

export const getTrip = async (id: number): Promise<Trip> => {
  const response = await apiClient.get(`/trips/${id}`);
  return response.data.data;
};

// Reservations
export const createReservation = async (data: {
  trip_id: number;
  selected_seat: string;
  passenger_first_name: string;
  passenger_last_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_gender: 'M' | 'F';
  passenger_cni: string;
}) => {
  const response = await apiClient.post('/reservations', data);
  return response.data.data;
};

export const getReservation = async (id: number): Promise<Reservation> => {
  const response = await apiClient.get(`/reservations/${id}`);
  return response.data.data;
};

export const getUserReservations = async (userId: number): Promise<Reservation[]> => {
  const response = await apiClient.get(`/reservations/user/${userId}`);
  return response.data.data;
};

export const cancelReservation = async (id: number) => {
  const response = await apiClient.post(`/reservations/${id}/cancel`);
  return response.data;
};

// Payments
export const initiatePayment = async (data: {
  reservation_id: number;
  amount: number;
  payment_method: string;
  phone_number?: string;
}) => {
  const response = await apiClient.post('/payments/initiate', {
    reservation_id: data.reservation_id,
    amount: data.amount,
    payment_method: data.payment_method,
    phone_number: data.phone_number,
  });
  return response.data.data;
};

export const verifyPayment = async (transactionId: string) => {
  const response = await apiClient.post('/payments/verify', {
    transaction_id: transactionId,
  });
  return response.data;
};

// Tickets
export const getTicketByNumber = async (ticketNumber: string): Promise<Ticket> => {
  const response = await apiClient.get(`/tickets/${ticketNumber}`);
  return response.data.data;
};

export const getUserTickets = async (userId: number): Promise<Ticket[]> => {
  const response = await apiClient.get(`/tickets/user/${userId}`);
  return response.data.data;
};

export const createTicket = async (reservationId: number): Promise<Ticket> => {
  // Ticket is created automatically after payment verification
  const response = await apiClient.get(`/reservations/${reservationId}`);
  return response.data.data.ticket;
};

export const getTicketDetails = async (ticketIdentifier: string | number): Promise<any> => {
  const response = await apiClient.get(`/tickets/${ticketIdentifier}`);
  return response.data.data;
};

export const downloadTicket = async (ticketIdentifier: string | number): Promise<Blob> => {
  const response = await apiClient.get(`/tickets/${ticketIdentifier}/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};

// Passengers
export const createPassenger = async (data: PassengerInput) => {
  // In Laravel backend, passenger info is part of user registration
  // For guest booking, we'll use the reservation user
  return data;
};

// Auth Service - Compatibility with utils/api.ts
export const authService = {
  setToken(token: string): void {
    localStorage.setItem('token', token);
    sessionStorage.setItem('auth_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('auth_token');
  },

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    const userFromLocal = localStorage.getItem('user');
    const userFromSession = sessionStorage.getItem('user');
    const userStr = userFromLocal || userFromSession;
    return userStr ? JSON.parse(userStr) : null;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

// Admin Functions
export const getCities = async () => {
  const response = await apiClient.get('/cities');
  return response.data;
};

export const createCity = async (data: { city_name: string; country: string }) => {
  const response = await apiClient.post('/cities', data);
  return response.data;
};

export const updateCity = async (id: number, data: { city_name?: string; country?: string }) => {
  const response = await apiClient.put(`/cities/${id}`, data);
  return response.data;
};

export const deleteCity = async (id: number) => {
  const response = await apiClient.delete(`/cities/${id}`);
  return response.data;
};

export const getRoutes = async () => {
  const response = await apiClient.get('/routes');
  return response.data;
};

export const createRoute = async (data: any) => {
  const response = await apiClient.post('/routes', data);
  return response.data;
};

export const updateRoute = async (id: number, data: any) => {
  const response = await apiClient.put(`/routes/${id}`, data);
  return response.data;
};

export const deleteRoute = async (id: number) => {
  const response = await apiClient.delete(`/routes/${id}`);
  return response.data;
};

export const getFleetBuses = async () => {
  const response = await apiClient.get('/fleet/buses');
  return response.data;
};

export const createBus = async (data: any) => {
  const response = await apiClient.post('/fleet/buses', data);
  return response.data;
};

export const updateBus = async (id: number, data: any) => {
  const response = await apiClient.put(`/fleet/buses/${id}`, data);
  return response.data;
};

export const deleteBus = async (id: number) => {
  const response = await apiClient.delete(`/fleet/buses/${id}`);
  return response.data;
};

export const getVoyages = async () => {
  const response = await apiClient.get('/voyages');
  return response.data;
};

export const createVoyage = async (data: any) => {
  const response = await apiClient.post('/voyages', data);
  return response.data;
};

export const updateVoyage = async (id: number, data: any) => {
  const response = await apiClient.put(`/voyages/${id}`, data);
  return response.data;
};

export const deleteVoyage = async (id: number) => {
  const response = await apiClient.delete(`/voyages/${id}`);
  return response.data;
};

export const getStatistics = async () => {
  const response = await apiClient.get('/statistics');
  return response.data;
};

export const getComments = async () => {
  const response = await apiClient.get('/comments');
  return response.data;
};

export const updateCommentStatus = async (id: number, status: string) => {
  const response = await apiClient.put(`/comments/${id}/status`, { status });
  return response.data;
};

export const deleteComment = async (id: number) => {
  const response = await apiClient.delete(`/comments/${id}`);
  return response.data;
};

// Named export for compatibility
export const api = apiClient;

export default apiClient;
