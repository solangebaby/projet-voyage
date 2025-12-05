// // src/services/api.ts
// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3001';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // ==================== TYPES ====================
// export interface Admin {
//   id?: number;
//   email: string;
//   password: string;
// }

// export interface Destination {
//   id: number;
//   city: string;
// }

// export interface Bus {
//   id: number;
//   busName: string;
//   type: 'standard' | 'vip';
//   price: number;
//   totalSeats: number;
//   features: string[];
// }

// export interface Trip {
//   id?: number;
//   busId: number;
//   departure: string;
//   destination: string;
//   date: string;
//   departureTime: string;
//   arrivalTime: string;
//   availableSeats: number;
//   occupiedSeats: string[];
// }

// export interface Passenger {
//   id?: string;
//   firstName: string;
//   lastName: string;
//   cniKit: string;
//   gender: string;
//   civility: string;
//   email: string;
//   phone: string;
//   createdAt?: string;
// }

// export interface Reservation {
//   id?: string;
//   passengerId: string;
//   tripId: number;
//   busId: number;
//   selectedSeat: string;
//   departure: string;
//   destination: string;
//   date: string;
//   departureTime: string;
//   arrivalTime: string;
//   price: number;
//   status: 'pending' | 'confirmed' | 'cancelled';
//   createdAt?: string;
// }

// export interface Payment {
//   id?: string;
//   reservationId: string;
//   amount: number;
//   method: 'MTN' | 'Orange';
//   phoneNumber: string;
//   transactionId: string;
//   status: 'pending' | 'success' | 'failed' | 'refunded';
//   createdAt?: string;
//   refundedAt?: string;
// }

// export interface Ticket {
//   id?: string;
//   reservationId: string;
//   passengerId: string;
//   qrCode: string;
//   ticketNumber: string;
//   busName: string;
//   departure: string;
//   destination: string;
//   date: string;
//   departureTime: string;
//   selectedSeat: string;
//   price: number;
//   passengerName: string;
//   isUsed: boolean;
//   createdAt?: string;
// }

// // ==================== ADMIN ====================
// export const loginAdmin = async (email: string, password: string): Promise<Admin | null> => {
//   try {
//     const response = await api.get('/admins', {
//       params: { email, password }
//     });
    
//     if (response.data.length > 0) {
//       return response.data[0];
//     }
//     return null;
//   } catch (error) {
//     console.error('Login error:', error);
//     return null;
//   }
// };

// // ==================== DESTINATIONS ====================
// export const getDestinations = async (): Promise<Destination[]> => {
//   const response = await api.get('/destinations');
//   return response.data;
// };

// // ==================== BUSES ====================
// export const getBuses = async (): Promise<Bus[]> => {
//   const response = await api.get('/buses');
//   return response.data;
// };

// export const getBusById = async (id: number): Promise<Bus> => {
//   const response = await api.get(`/buses/${id}`);
//   return response.data;
// };

// // ==================== TRIPS ====================
// export const searchTrips = async (
//   departure: string,
//   destination: string,
//   date: string
// ): Promise<Trip[]> => {
//   try {
//     const response = await api.get('/trips', {
//       params: { departure, destination, date },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error searching trips:', error);
//     return [];
//   }
// };

// export const getTripById = async (id: number): Promise<Trip> => {
//   const response = await api.get(`/trips/${id}`);
//   return response.data;
// };

// export const createTrip = async (trip: Trip): Promise<Trip> => {
//   const response = await api.post('/trips', trip);
//   return response.data;
// };

// // ==================== PASSENGERS ====================
// export const createPassenger = async (passenger: Passenger): Promise<Passenger> => {
//   const passengerWithId = {
//     ...passenger,
//     id: `PASS-${Date.now()}`,
//     createdAt: new Date().toISOString(),
//   };
//   const response = await api.post('/passengers', passengerWithId);
//   return response.data;
// };

// export const getPassengerById = async (id: string): Promise<Passenger> => {
//   const response = await api.get(`/passengers/${id}`);
//   return response.data;
// };

// // ==================== RESERVATIONS ====================
// export const createReservation = async (reservation: Reservation): Promise<Reservation> => {
//   const reservationWithId = {
//     ...reservation,
//     id: `RES-${Date.now()}`,
//     status: 'pending',
//     createdAt: new Date().toISOString(),
//   };
//   const response = await api.post('/reservations', reservationWithId);
  
//   // Mettre à jour les sièges occupés
//   const trip = await getTripById(reservation.tripId);
//   const updatedOccupiedSeats = [...trip.occupiedSeats, reservation.selectedSeat];
//   await api.patch(`/trips/${reservation.tripId}`, {
//     occupiedSeats: updatedOccupiedSeats,
//     availableSeats: trip.availableSeats - 1,
//   });
  
//   return response.data;
// };

// export const getReservationById = async (id: string): Promise<Reservation> => {
//   const response = await api.get(`/reservations/${id}`);
//   return response.data;
// };

// export const updateReservationStatus = async (
//   id: string,
//   status: 'confirmed' | 'cancelled'
// ): Promise<Reservation> => {
//   const response = await api.patch(`/reservations/${id}`, { status });
//   return response.data;
// };

// export const getAllReservations = async (): Promise<Reservation[]> => {
//   const response = await api.get('/reservations');
//   return response.data;
// };

// // ==================== PAYMENTS ====================
// export const createPayment = async (payment: Payment): Promise<Payment> => {
//   const paymentWithId = {
//     ...payment,
//     id: `PAY-${Date.now()}`,
//     transactionId: `NOTPAY-${Math.floor(Math.random() * 999999)}`,
//     status: 'pending',
//     createdAt: new Date().toISOString(),
//   };
//   const response = await api.post('/payments', paymentWithId);
//   return response.data;
// };

// export const updatePaymentStatus = async (
//   id: string,
//   status: 'success' | 'failed' | 'refunded'
// ): Promise<Payment> => {
//   const updateData: any = { status };
//   if (status === 'refunded') {
//     updateData.refundedAt = new Date().toISOString();
//   }
//   const response = await api.patch(`/payments/${id}`, updateData);
//   return response.data;
// };

// export const getPaymentsByReservationId = async (reservationId: string): Promise<Payment[]> => {
//   const response = await api.get(`/payments?reservationId=${reservationId}`);
//   return response.data;
// };

// export const getAllPayments = async (): Promise<Payment[]> => {
//   const response = await api.get('/payments');
//   return response.data;
// };

// // ==================== TICKETS ====================
// export const createTicket = async (ticket: Ticket): Promise<Ticket> => {
//   const ticketWithId = {
//     ...ticket,
//     id: `TICK-${Date.now()}`,
//     ticketNumber: `FX-${Date.now().toString().slice(-8)}`,
//     isUsed: false,
//     createdAt: new Date().toISOString(),
//   };
//   const response = await api.post('/tickets', ticketWithId);
//   return response.data;
// };

// export const getTicketById = async (id: string): Promise<Ticket> => {
//   const response = await api.get(`/tickets/${id}`);
//   return response.data;
// };

// export const getAllTickets = async (): Promise<Ticket[]> => {
//   const response = await api.get('/tickets');
//   return response.data;
// };

// // ==================== REFUND ====================
// export const refundReservation = async (reservationId: string): Promise<boolean> => {
//   try {
//     const reservation = await getReservationById(reservationId);
    
//     // Vérifier le délai de 10 minutes
//     const createdAt = new Date(reservation.createdAt!);
//     const now = new Date();
//     const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
//     if (diffMinutes > 10) {
//       throw new Error('Refund period (10 minutes) has expired');
//     }
    
//     // Mettre à jour le statut de la réservation
//     await updateReservationStatus(reservationId, 'cancelled');
    
//     // Libérer le siège
//     const trip = await getTripById(reservation.tripId);
//     const updatedOccupiedSeats = trip.occupiedSeats.filter(
//       seat => seat !== reservation.selectedSeat
//     );
//     await api.patch(`/trips/${reservation.tripId}`, {
//       occupiedSeats: updatedOccupiedSeats,
//       availableSeats: trip.availableSeats + 1,
//     });
    
//     // Mettre à jour le paiement
//     const payments = await getPaymentsByReservationId(reservationId);
//     if (payments.length > 0) {
//       await updatePaymentStatus(payments[0].id!, 'refunded');
//     }
    
//     return true;
//   } catch (error) {
//     console.error('Refund failed:', error);
//     return false;
//   }
// };

// export default api;
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== TYPES ====================
export interface Admin {
  id?: number;
  email: string;
  password: string;
}

export interface Destination {
  id: number;
  city: string;
}

export interface Bus {
  id: number;
  busName: string;
  type: 'standard' | 'vip';
  price: number;
  totalSeats: number;
  features: string[];
}

export interface Trip {
  id?: number;
  busId: number;
  departure: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  occupiedSeats: string[];
}

export interface Passenger {
  id?: string;
  firstName: string;
  lastName: string;
  cniKit: string;
  gender: string;
  civility: string;
  email: string;
  phone: string;
  createdAt?: string;
}

export interface Reservation {
  id?: string;
  passengerId: string;
  tripId: number;
  busId: number;
  selectedSeat: string;
  departure: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
}

export interface Payment {
  id?: string;
  reservationId: string;
  amount: number;
  method: 'MTN' | 'Orange';
  phoneNumber: string;
  transactionId: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  createdAt?: string;
  refundedAt?: string;
}

export interface Ticket {
  id?: string;
  reservationId: string;
  passengerId: string;
  qrCode: string;
  ticketNumber: string;
  busName: string;
  departure: string;
  destination: string;
  date: string;
  departureTime: string;
  selectedSeat: string;
  price: number;
  passengerName: string;
  isUsed: boolean;
  createdAt?: string;
}

// ==================== ADMIN ====================
export const loginAdmin = async (email: string, password: string): Promise<Admin | null> => {
  try {
    const response = await api.get('/admins', {
      params: { email, password }
    });
    
    if (response.data.length > 0) {
      return response.data[0];
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// ==================== DESTINATIONS ====================
export const getDestinations = async (): Promise<Destination[]> => {
  const response = await api.get('/destinations');
  return response.data;
};

// ==================== BUSES ====================
export const getBuses = async (): Promise<Bus[]> => {
  const response = await api.get('/buses');
  return response.data;
};

export const getBusById = async (id: number): Promise<Bus> => {
  const response = await api.get(`/buses/${id}`);
  return response.data;
};

// ==================== TRIPS ====================
export const searchTrips = async (
  departure: string,
  destination: string,
  date: string
): Promise<Trip[]> => {
  try {
    const response = await api.get('/trips', {
      params: { departure, destination, date },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching trips:', error);
    return [];
  }
};

export const getTripById = async (id: number): Promise<Trip> => {
  const response = await api.get(`/trips/${id}`);
  return response.data;
};

export const createTrip = async (trip: Trip): Promise<Trip> => {
  const response = await api.post('/trips', trip);
  return response.data;
};

export const updateTrip = async (id: number, trip: Partial<Trip>): Promise<Trip> => {
  const response = await api.patch(`/trips/${id}`, trip);
  return response.data;
};

// ==================== PASSENGERS ====================
export const createPassenger = async (passenger: Passenger): Promise<Passenger> => {
  const passengerWithId = {
    ...passenger,
    id: `PASS-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const response = await api.post('/passengers', passengerWithId);
  return response.data;
};

export const getPassengerById = async (id: string): Promise<Passenger> => {
  const response = await api.get(`/passengers/${id}`);
  return response.data;
};

// ==================== RESERVATIONS ====================
export const createReservation = async (reservation: Reservation): Promise<Reservation> => {
  try {
    const reservationWithId = {
      ...reservation,
      id: `RES-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    // Créer la réservation
    const response = await api.post('/reservations', reservationWithId);
    
    // Mettre à jour les sièges occupés du trip
    const trip = await getTripById(reservation.tripId);
    const updatedOccupiedSeats = [...trip.occupiedSeats, reservation.selectedSeat];
    await updateTrip(reservation.tripId, {
      occupiedSeats: updatedOccupiedSeats,
      availableSeats: trip.availableSeats - 1,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

export const getReservationById = async (id: string): Promise<Reservation> => {
  const response = await api.get(`/reservations/${id}`);
  return response.data;
};

export const updateReservationStatus = async (
  id: string,
  status: 'confirmed' | 'cancelled'
): Promise<Reservation> => {
  const response = await api.patch(`/reservations/${id}`, { status });
  return response.data;
};

export const getAllReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/reservations');
  return response.data;
};

// ==================== PAYMENTS ====================
export const createPayment = async (payment: Payment): Promise<Payment> => {
  const paymentWithId = {
    ...payment,
    id: `PAY-${Date.now()}`,
    transactionId: `NOTPAY-${Math.floor(Math.random() * 999999)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const response = await api.post('/payments', paymentWithId);
  return response.data;
};

export const updatePaymentStatus = async (
  id: string,
  status: 'success' | 'failed' | 'refunded'
): Promise<Payment> => {
  const updateData: any = { status };
  if (status === 'refunded') {
    updateData.refundedAt = new Date().toISOString();
  }
  const response = await api.patch(`/payments/${id}`, updateData);
  return response.data;
};

export const getPaymentsByReservationId = async (reservationId: string): Promise<Payment[]> => {
  const response = await api.get(`/payments?reservationId=${reservationId}`);
  return response.data;
};

export const getAllPayments = async (): Promise<Payment[]> => {
  const response = await api.get('/payments');
  return response.data;
};

// ==================== TICKETS ====================
// Fonction pour générer le code QR (en format data URL)
const generateQRCode = (data: string): string => {
  // Simple QR code generation using a data format
  // In production, you would use a library like qrcode
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
};

export const createTicket = async (
  reservation: Reservation,
  passenger: Passenger,
  busName: string
): Promise<Ticket> => {
  const ticketNumber = `FX-${Date.now().toString().slice(-8)}`;
  const qrData = JSON.stringify({
    ticketNumber,
    reservationId: reservation.id,
    passengerId: passenger.id,
    seat: reservation.selectedSeat,
    date: reservation.date
  });
  
  const ticketWithId: Ticket = {
    id: `TICK-${Date.now()}`,
    reservationId: reservation.id!,
    passengerId: passenger.id!,
    ticketNumber,
    qrCode: generateQRCode(qrData),
    busName,
    departure: reservation.departure,
    destination: reservation.destination,
    date: reservation.date,
    departureTime: reservation.departureTime,
    selectedSeat: reservation.selectedSeat,
    price: reservation.price,
    passengerName: `${passenger.firstName} ${passenger.lastName}`,
    isUsed: false,
    createdAt: new Date().toISOString(),
  };
  
  const response = await api.post('/tickets', ticketWithId);
  return response.data;
};

export const getTicketById = async (id: string): Promise<Ticket> => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const getTicketByReservationId = async (reservationId: string): Promise<Ticket | null> => {
  const response = await api.get(`/tickets?reservationId=${reservationId}`);
  return response.data.length > 0 ? response.data[0] : null;
};

export const getAllTickets = async (): Promise<Ticket[]> => {
  const response = await api.get('/tickets');
  return response.data;
};

// ==================== REFUND ====================
export const refundReservation = async (reservationId: string): Promise<boolean> => {
  try {
    const reservation = await getReservationById(reservationId);
    
    // Vérifier le délai de 10 minutes
    const createdAt = new Date(reservation.createdAt!);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (diffMinutes > 10) {
      throw new Error('Refund period (10 minutes) has expired');
    }
    
    // Mettre à jour le statut de la réservation
    await updateReservationStatus(reservationId, 'cancelled');
    
    // Libérer le siège
    const trip = await getTripById(reservation.tripId);
    const updatedOccupiedSeats = trip.occupiedSeats.filter(
      seat => seat !== reservation.selectedSeat
    );
    await updateTrip(reservation.tripId, {
      occupiedSeats: updatedOccupiedSeats,
      availableSeats: trip.availableSeats + 1,
    });
    
    // Mettre à jour le paiement
    const payments = await getPaymentsByReservationId(reservationId);
    if (payments.length > 0) {
      await updatePaymentStatus(payments[0].id!, 'refunded');
    }
    
    return true;
  } catch (error) {
    console.error('Refund failed:', error);
    return false;
  }
};

export default api;