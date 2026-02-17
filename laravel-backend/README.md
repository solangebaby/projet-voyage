# Finexs Voyage - Laravel 10 Backend API

Complete Laravel 10 + MySQL backend for the Finexs Voyage bus ticket booking system.

## 🚀 Features

- **Authentication**: Laravel Sanctum with JWT tokens
- **User Management**: Admin and Voyageur (Traveler) roles
- **Trip Management**: CRUD operations for trips, buses, destinations
- **Booking System**: Seat reservation with 10-minute hold
- **Payment Integration**: NotchPay (MTN, Orange Money)
- **Ticket Generation**: QR code tickets
- **Refund System**: Automatic refunds within 10 minutes

## 📋 Requirements

- PHP 8.2+
- MySQL 5.7+
- Composer
- Laravel 10

## 🛠️ Installation

### 1. Install Dependencies
```bash
cd finexs-voyage/laravel-backend
composer install
```

### 2. Configure Environment
```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` file:
```env
APP_NAME="Finexs Voyage"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=finexs_voyage
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000
```

### 3. Create Database
```bash
mysql -u root -p
CREATE DATABASE finexs_voyage;
exit;
```

### 4. Run Migrations
```bash
php artisan migrate
```

### 5. Seed Database
```bash
php artisan db:seed
```

This creates:
- Admin user: `admin@finexsvoyage.com` / `admin123`
- Test user: `jean@example.com` / `password`
- Sample destinations, buses, and trips

### 6. Configure CORS
Edit `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 7. Start Server
```bash
php artisan serve
```

API runs on: `http://localhost:8000`

## 📚 API Endpoints

### Authentication

#### Register
```http
POST /api/register
Content-Type: application/json

{
  "name": "Dupont",
  "first_name": "Marie",
  "email": "marie@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "+237612345678",
  "cni_number": "123456789",
  "civility": "Mme",
  "gender": "F"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@finexsvoyage.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "1|abc123..."
  }
}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer {token}
```

#### Get Current User
```http
GET /api/user
Authorization: Bearer {token}
```

### Destinations

#### List Destinations
```http
GET /api/destinations
```

#### Create Destination (Admin)
```http
POST /api/destinations
Authorization: Bearer {token}
Content-Type: application/json

{
  "city_name": "Garoua"
}
```

### Buses

#### List Buses
```http
GET /api/buses
```

#### Get Bus Details
```http
GET /api/buses/{id}
```

#### Create Bus (Admin)
```http
POST /api/buses
Authorization: Bearer {token}

{
  "bus_name": "Express VIP",
  "matricule": "EXP-002",
  "type": "vip",
  "total_seats": 35,
  "price": 15000,
  "features": ["WiFi", "AC", "Reclining seats"]
}
```

### Trips

#### List All Trips
```http
GET /api/trips
```

#### Search Trips
```http
GET /api/trips/search?departure=Douala&destination=Yaoundé&date=2026-02-20
```

#### Get Trip Details
```http
GET /api/trips/{id}
```

#### Create Trip (Admin)
```http
POST /api/trips
Authorization: Bearer {token}

{
  "bus_id": 1,
  "departure_id": 1,
  "destination_id": 2,
  "departure_date": "2026-02-25",
  "departure_time": "08:00",
  "arrival_date": "2026-02-25",
  "arrival_time": "11:30",
  "distance_km": 250
}
```

### Reservations

#### Create Reservation
```http
POST /api/reservations
Authorization: Bearer {token}

{
  "trip_id": 1,
  "selected_seat": "A5"
}

Response:
{
  "success": true,
  "message": "Reservation created successfully",
  "data": {
    "id": 1,
    "user_id": 2,
    "trip_id": 1,
    "selected_seat": "A5",
    "status": "pending",
    "expires_at": "2026-01-18 14:00:00"
  }
}
```

#### Get Reservation
```http
GET /api/reservations/{id}
Authorization: Bearer {token}
```

#### Get User Reservations
```http
GET /api/reservations/user/{userId}
Authorization: Bearer {token}
```

#### Cancel Reservation (with refund)
```http
POST /api/reservations/{id}/cancel
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Reservation cancelled and refund processed",
  "refund_amount": 5000
}
```

### Payments

#### Initiate Payment
```http
POST /api/payments/initiate
Authorization: Bearer {token}

{
  "reservation_id": 1,
  "amount": 5000,
  "method": "MTN",
  "phone_number": "+237612345678"
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "transaction_id": "NOTCHPAY-1705584123456",
    "reference": "REF-1705584123",
    "status": "pending"
  },
  "authorization_url": "https://pay.notchpay.co/..."
}
```

#### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer {token}

{
  "transaction_id": "NOTCHPAY-1705584123456"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment": {...},
    "ticket": {
      "id": 1,
      "ticket_number": "TKT-1705584200123",
      "qr_code": "QR-NOTCHPAY-1705584123456",
      "status": "valid"
    }
  }
}
```

#### Payment Webhook (NotchPay)
```http
POST /api/payments/webhook
Content-Type: application/json

{
  "transaction_id": "NOTCHPAY-123",
  "status": "completed"
}
```

### Tickets

#### Get Ticket by Number
```http
GET /api/tickets/TKT-1705584200123
```

#### Get User Tickets
```http
GET /api/tickets/user/{userId}
Authorization: Bearer {token}
```

## 🗄️ Database Schema

### Users
- id, name, first_name, email, phone
- cni_number, civility, gender
- role (admin, voyageur)
- status (active, pending)
- password, timestamps

### Destinations
- id, city_name, timestamps

### Buses
- id, bus_name, matricule, type
- total_seats, price, features (JSON)
- timestamps

### Trips
- id, bus_id, departure_id, destination_id
- departure_date, departure_time
- arrival_date, arrival_time
- available_seats, occupied_seats (JSON)
- distance_km, status
- timestamps

### Reservations
- id, user_id, trip_id
- selected_seat, status
- expires_at, cancelled_at
- timestamps

### Payments
- id, reservation_id
- transaction_id, reference
- amount, currency, method
- phone_number, status
- completed_at, refunded_at
- timestamps

### Tickets
- id, reservation_id
- ticket_number, qr_code
- status
- timestamps

### Comments
- id, user_id, trip_id
- content, rating
- timestamps

## 🔒 Authentication

All protected routes require Bearer token:
```http
Authorization: Bearer {token}
```

Get token from login response and store in frontend.

## 👥 User Roles

### Admin
- Create/edit/delete trips
- Create/edit/delete buses
- Create/edit/delete destinations
- View all reservations

### Voyageur (Traveler)
- Search trips
- Create reservations
- Make payments
- View own tickets
- Cancel reservations (within 10 min)

## 💳 Payment Flow

1. User selects trip and seat
2. Creates reservation (10-min hold)
3. Initiates payment with NotchPay
4. Redirects to NotchPay payment page
5. User completes payment
6. NotchPay webhook updates status
7. System generates ticket with QR code
8. User receives ticket

## ↩️ Refund Policy

- Cancellations allowed within 10 minutes
- Automatic refund processing
- Seat returned to available pool
- Reservation marked as cancelled

## 🧪 Testing

### Test Accounts
- Admin: `admin@finexsvoyage.com` / `admin123`
- User: `jean@example.com` / `password`

### Test API with Postman
1. Import endpoints
2. Login to get token
3. Set Authorization header
4. Test endpoints

## 🚀 Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Configure real database
4. Set up NotchPay API keys
5. Configure CORS for production domain
6. Run migrations on production DB
7. Optimize: `php artisan optimize`

## 📝 Notes

- NotchPay integration is simulated (add real API keys in production)
- QR codes generated as strings (implement QR generator library)
- Seat expiration cleanup requires job scheduler
- Add email notifications for bookings
- Implement real-time seat availability with WebSockets

## 🔧 Troubleshooting

### CORS Issues
Check `config/cors.php` and ensure frontend URL is in `allowed_origins`

### Token Issues
Ensure `SANCTUM_STATEFUL_DOMAINS` includes frontend domain

### Database Connection
Verify MySQL service is running and credentials are correct

## 📧 Support

For issues or questions, contact development team.

---

**Built with Laravel 10 & MySQL**
