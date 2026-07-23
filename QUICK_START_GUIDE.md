# Agency Dashboard - Quick Start Guide

## 🚀 Getting Started

### 1. Add Route to Your Router
Add this to your `src/App.tsx` or main routing file:

```typescript
import AgencyDashboard from './components/pages/AgencyDashboard';

// In your route configuration:
<Route path="/agency/dashboard" element={<AgencyDashboard />} />
```

### 2. Access the Dashboard
Navigate to `/agency/dashboard` when logged in as an agency user.

---

## 📁 File Structure

```
src/
├── components/
│   ├── pages/
│   │   └── AgencyDashboard.tsx          ← Main container
│   └── agency/
│       ├── AgencyStatsTab.tsx           ← Overview/Stats
│       ├── AgencyTripsTab.tsx           ← Trip management
│       ├── AgencyPassengersTab.tsx      ← Passenger management
│       ├── AgencyPromotionsTab.tsx      ← Promotions & Payments
│       └── AgencyProfileTab.tsx         ← Profile/Account
└── services/
    └── api.ts                            ← 31 new endpoints added
```

---

## 🎯 Component Overview

### AgencyDashboard (Main)
The container component with sidebar navigation and tab system.

**Tabs:**
1. **Overview (📊)** → AgencyStatsTab
2. **Voyages (🚌)** → AgencyTripsTab
3. **Passagers (👥)** → AgencyPassengersTab
4. **Commercial (💰)** → AgencyPromotionsTab
5. **Profil (⚙️)** → AgencyProfileTab

### AgencyStatsTab
Displays:
- 4 KPI cards (Reservations, Revenue, Fill Rate, Active Trips)
- Trip status breakdown
- Recent reservations table

### AgencyTripsTab
Displays:
- All trips in a table
- Create new trip modal
- Trip actions (view passengers, submit, cancel)

### AgencyPassengersTab
Displays:
- Trip selector with date filter
- Passenger list for selected trip
- Boarding validation actions
- QR code scanner button

### AgencyPromotionsTab
Displays:
- Promotions table with CRUD operations
- Create/edit promotion modal
- Payments summary table

### AgencyProfileTab
Displays:
- Agency information (read-only)
- Status badge
- Contact information
- Status-specific messages

---

## 🔗 API Endpoints Added

### Promotions (6 endpoints)
```typescript
getPromotions()
createPromotion(data)
updatePromotion(id, data)
deletePromotion(id)
togglePromotion(id)
applyPromoCode(data)
```

### Agency Trips (6 endpoints)
```typescript
createTrip(data)
submitTrip(id)
cancelTrip(id)
updateTrip(id, data)
getTripPassengers(id)
getBuses()
```

### Disputes (2 endpoints)
```typescript
getMyDisputes()
createDispute(data)
```

### Admin Agencies (5 endpoints)
```typescript
adminGetAgencies(params?)
adminGetAgencyStats()
adminApproveAgency(id)
adminSuspendAgency(id)
adminRejectAgency(id)
```

### Admin Disputes (4 endpoints)
```typescript
adminGetDisputes(params?)
adminGetDisputeStats()
adminGetDispute(id)
adminUpdateDispute(id, data)
```

### Admin Trip Validation (3 endpoints)
```typescript
adminGetPendingTrips()
adminApproveTrip(id)
adminRejectTrip(id, data)
```

---

## 🎨 Design Features

### Colors
- **Primary:** Dark blue gradient sidebar (#1e40af)
- **Success:** Green (#10b981)
- **Warning:** Yellow (#fbbf24)
- **Error:** Red (#ef4444)
- **Info:** Blue (#3b82f6)

### Responsive
- Mobile-first design
- Sidebar navigation
- Horizontal scrolling tables on mobile
- Flexible layouts

### Accessibility
- Full i18n translation support
- Semantic HTML
- Clear labels and headings
- Emoji icons for visual enhancement

---

## 🛠️ Key Features

### AgencyDashboard
- ✅ Responsive sidebar with 5 tabs
- ✅ Top navbar with agency name
- ✅ Tab switching
- ✅ Logout button
- ✅ Agency profile fetching

### AgencyStatsTab
- ✅ 4 KPI cards with icons
- ✅ Trip status breakdown
- ✅ Recent reservations table
- ✅ Status color coding

### AgencyTripsTab
- ✅ Trip management table
- ✅ Create new trip modal
- ✅ Bus selector dropdown
- ✅ Trip actions (view, submit, cancel)

### AgencyPassengersTab
- ✅ Trip selection interface
- ✅ Date filter
- ✅ Passenger table with full info
- ✅ Boarding validation
- ✅ QR scanner link

### AgencyPromotionsTab
- ✅ Promotion CRUD operations
- ✅ Create/edit modal
- ✅ Toggle active/inactive
- ✅ Payments summary
- ✅ Payment status tracking

### AgencyProfileTab
- ✅ Agency information display
- ✅ Status badge with color coding
- ✅ Contact info cards
- ✅ Status-specific messages
- ✅ Read-only view

---

## 📝 Translation Keys Used

Make sure these exist in your i18n locales:

```
agency.dashboard
agency.overview
agency.myTrips
agency.profile
agency.noTrips
agency.noReservations
agency.totalReservations
agency.totalTrips
common.loading
common.cancel
common.save
common.logout
statuses.pending
statuses.confirmed
statuses.cancelled
statuses.reserved_at_counter
```

---

## ⚙️ Backend Requirements

Ensure your Laravel backend implements these endpoints:

### Agency Endpoints
- `GET /agency/stats` - Agency statistics
- `GET /agency/trips` - List agency trips
- `POST /agency/trips` - Create trip
- `PUT /agency/trips/{id}` - Update trip
- `POST /agency/trips/{id}/submit` - Submit trip for validation
- `POST /agency/trips/{id}/cancel` - Cancel trip
- `GET /agency/trips/{id}/passengers` - Get trip passengers
- `GET /agency/buses` - List agency buses
- `GET /agency/reservations` - List agency reservations
- `GET /agency/payments` - List agency payments
- `GET /agency/promotions` - List promotions
- `POST /agency/promotions` - Create promotion
- `PUT /agency/promotions/{id}` - Update promotion
- `DELETE /agency/promotions/{id}` - Delete promotion
- `POST /agency/promotions/{id}/toggle` - Toggle promotion status

### Admin Endpoints
- `GET /admin/agencies` - List agencies
- `GET /admin/agencies/stats` - Agency statistics
- `POST /admin/agencies/{id}/approve` - Approve agency
- `POST /admin/agencies/{id}/suspend` - Suspend agency
- `POST /admin/agencies/{id}/reject` - Reject agency
- `GET /admin/disputes` - List disputes
- `GET /admin/disputes/stats` - Dispute statistics
- `GET /admin/disputes/{id}` - Get dispute details
- `PUT /admin/disputes/{id}` - Update dispute
- `GET /admin/trips/pending` - List pending trips
- `POST /admin/trips/{id}/approve` - Approve trip
- `POST /admin/trips/{id}/reject` - Reject trip

---

## 🐛 Troubleshooting

### Components Not Rendering
- Ensure route is properly configured
- Check that auth token is valid
- Verify user role is 'agence'

### API Errors
- Check backend endpoints are implemented
- Verify CORS configuration
- Check auth token in localStorage/sessionStorage

### Translation Issues
- Ensure translation keys exist in i18n files
- Verify i18n config is loaded
- Check language setting

### Styling Issues
- Ensure Tailwind CSS is configured
- Verify PostCSS config includes tailwindcss
- Check for conflicting styles

---

## 📚 Documentation

For detailed information, see:
- `AGENCY_DASHBOARD_IMPLEMENTATION.md` - Full implementation details
- `CREATION_CHECKLIST.md` - Complete feature checklist

---

## ✨ Tips & Best Practices

1. **Testing Forms:** All forms have validation. Test with edge cases.
2. **Loading States:** Components show loading messages. Test network delays.
3. **Error Handling:** Check console for error logs if API calls fail.
4. **Responsive Design:** Test on mobile, tablet, and desktop views.
5. **i18n:** Always use translation keys, never hardcode text.
6. **Status Colors:** Use consistent color scheme across the app.

---

## 🎉 You're Ready!

Your agency dashboard is now ready to use. Start by:
1. Ensuring backend APIs are implemented
2. Testing the dashboard with agency credentials
3. Verifying all features work as expected
4. Checking translations are complete

Happy coding! 🚀
