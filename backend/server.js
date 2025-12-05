const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Middleware CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ==================== ROUTES PERSONNALISÉES ====================

// 🔹 Route: Rechercher des voyages disponibles
server.get('/api/trips/search', (req, res) => {
  const { departure, destination, date } = req.query;
  const db = router.db;
  
  let trips = db.get('trips').value();
  
  if (departure) {
    trips = trips.filter(t => t.departure.toLowerCase() === departure.toLowerCase());
  }
  
  if (destination) {
    trips = trips.filter(t => t.destination.toLowerCase() === destination.toLowerCase());
  }
  
  if (date) {
    trips = trips.filter(t => t.date === date);
  }
  
  // Filtrer seulement les voyages avec des sièges disponibles
  trips = trips.filter(t => t.availableSeats > 0);
  
  res.json(trips);
});

// 🔹 Route: Créer une réservation
server.post('/api/reservations', (req, res) => {
  const db = router.db;
  const reservation = req.body;
  
  // Vérifier si le voyage existe et a des sièges disponibles
  const trip = db.get('trips').find({ id: reservation.tripId }).value();
  
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  
  if (trip.availableSeats <= 0) {
    return res.status(400).json({ error: 'No available seats' });
  }
  
  // Vérifier si le siège est déjà occupé
  const existingReservation = db.get('reservations')
    .find({ tripId: reservation.tripId, selectedSeat: reservation.selectedSeat })
    .value();
    
  if (existingReservation) {
    return res.status(400).json({ error: 'Seat already taken' });
  }
  
  // Créer la réservation avec statut "pending"
  const newReservation = {
    id: Date.now(),
    ...reservation,
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // Expire dans 10 minutes
  };
  
  db.get('reservations').push(newReservation).write();
  
  // Décrémenter les sièges disponibles (temporairement)
  db.get('trips')
    .find({ id: reservation.tripId })
    .assign({ availableSeats: trip.availableSeats - 1 })
    .write();
  
  res.status(201).json(newReservation);
});

// 🔹 Route: Vérifier le statut d'une réservation
server.get('/api/reservations/:id', (req, res) => {
  const db = router.db;
  const reservation = db.get('reservations').find({ id: parseInt(req.params.id) }).value();
  
  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  
  res.json(reservation);
});

// 🔹 Route: Annuler une réservation et effectuer un remboursement
server.post('/api/reservations/:id/cancel', async (req, res) => {
  const db = router.db;
  const reservationId = parseInt(req.params.id);
  const reservation = db.get('reservations').find({ id: reservationId }).value();
  
  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  
  // Vérifier si la réservation peut être annulée (dans les 10 minutes)
  const createdAt = new Date(reservation.createdAt);
  const now = new Date();
  const minutesPassed = (now - createdAt) / (1000 * 60);
  
  if (minutesPassed > 10) {
    return res.status(400).json({ 
      error: 'Cancellation period expired',
      message: 'You can only cancel within 10 minutes of booking'
    });
  }
  
  // Vérifier si le paiement existe
  const payment = db.get('payments').find({ reservationId }).value();
  
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  
  // Simuler le remboursement via NotchPay
  try {
    // Dans un cas réel, vous appelleriez l'API NotchPay pour le remboursement
    // const refund = await notchpayRefund(payment.transactionId);
    
    // Mettre à jour le statut de la réservation
    db.get('reservations')
      .find({ id: reservationId })
      .assign({ 
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      })
      .write();
    
    // Mettre à jour le statut du paiement
    db.get('payments')
      .find({ reservationId })
      .assign({ 
        status: 'refunded',
        refundedAt: new Date().toISOString()
      })
      .write();
    
    // Remettre le siège disponible
    const trip = db.get('trips').find({ id: reservation.tripId }).value();
    db.get('trips')
      .find({ id: reservation.tripId })
      .assign({ availableSeats: trip.availableSeats + 1 })
      .write();
    
    res.json({ 
      success: true,
      message: 'Reservation cancelled and refund processed',
      refundAmount: payment.amount
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Refund processing failed' });
  }
});

// 🔹 Route: Initier un paiement NotchPay
server.post('/api/payments/initiate', async (req, res) => {
  const { reservationId, amount, phone, paymentMethod } = req.body;
  const db = router.db;
  
  const reservation = db.get('reservations').find({ id: reservationId }).value();
  
  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  
  try {
    // 🔥 INTÉGRATION NOTCHPAY - À CONFIGURER AVEC VOTRE CLÉ API
    // Documentation: https://developer.notchpay.co/
    
    // Simuler l'appel à l'API NotchPay
    const notchpayResponse = {
      status: 'success',
      transactionId: 'NOTCHPAY-' + Math.floor(Math.random() * 999999),
      reference: 'REF-' + Date.now(),
      amount: amount,
      currency: 'XAF',
      phone: phone,
      authorization_url: 'https://pay.notchpay.co/...' // URL de paiement NotchPay
    };
    
    // Enregistrer le paiement
    const payment = {
      id: Date.now(),
      reservationId,
      transactionId: notchpayResponse.transactionId,
      reference: notchpayResponse.reference,
      amount,
      phone,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    db.get('payments').push(payment).write();
    
    res.json({
      success: true,
      payment: payment,
      authorizationUrl: notchpayResponse.authorization_url
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// 🔹 Route: Vérifier le statut d'un paiement
server.post('/api/payments/verify', async (req, res) => {
  const { transactionId } = req.body;
  const db = router.db;
  
  try {
    // Dans un cas réel, vous vérifieriez via l'API NotchPay
    // const status = await notchpayVerify(transactionId);
    
    // Simuler une vérification réussie
    const payment = db.get('payments').find({ transactionId }).value();
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Mettre à jour le statut du paiement
    db.get('payments')
      .find({ transactionId })
      .assign({ 
        status: 'completed',
        completedAt: new Date().toISOString()
      })
      .write();
    
    // Mettre à jour le statut de la réservation
    db.get('reservations')
      .find({ id: payment.reservationId })
      .assign({ status: 'confirmed' })
      .write();
    
    // Générer le ticket
    const reservation = db.get('reservations').find({ id: payment.reservationId }).value();
    const trip = db.get('trips').find({ id: reservation.tripId }).value();
    
    const ticket = {
      id: Date.now(),
      ticketNumber: 'TKT-' + Date.now(),
      reservationId: payment.reservationId,
      transactionId: transactionId,
      passengerInfo: reservation.passengerInfo,
      tripInfo: {
        departure: trip.departure,
        destination: trip.destination,
        date: trip.date,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        busName: trip.busName
      },
      selectedSeat: reservation.selectedSeat,
      price: payment.amount,
      qrCode: `QR-${transactionId}`, // Dans un vrai cas, générer un vrai QR code
      status: 'valid',
      createdAt: new Date().toISOString()
    };
    
    db.get('tickets').push(ticket).write();
    
    res.json({
      success: true,
      payment: payment,
      ticket: ticket
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// 🔹 Route: Récupérer un ticket
server.get('/api/tickets/:ticketNumber', (req, res) => {
  const db = router.db;
  const ticket = db.get('tickets').find({ ticketNumber: req.params.ticketNumber }).value();
  
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  res.json(ticket);
});

// Utiliser le routeur par défaut pour les autres routes
server.use('/api', router);

// Démarrer le serveur
const PORT = 5000;
server.listen(PORT, () => {
  console.log(` JSON Server is running on http://localhost:${PORT}`);
  console.log(` Database: db.json`);
  console.log(` API Endpoints:`);
  console.log(`   - GET    /api/trips`);
 // console.log(`   - GET    /api/trips/search?departure=Yaoundé&destination=Douala&date=2025-11-10`);
  console.log(`   - POST   /api/reservations`);
  console.log(`   - GET    /api/reservations/:id`);
  console.log(`   - POST   /api/reservations/:id/cancel`);
  console.log(`   - POST   /api/payments/initiate`);
  console.log(`   - POST   /api/payments/verify`);
  console.log(`   - GET    /api/tickets/:ticketNumber`);
});