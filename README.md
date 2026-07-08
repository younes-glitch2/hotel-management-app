# Hotel Management System

A comprehensive hotel management application built with Node.js and Express, featuring check-in/check-out management, billing, and invoice generation.

## Features

### Core Features
- **Guest Management**: Create, update, and manage guest profiles
- **Room Management**: Manage room inventory, types, pricing, and status
- **Reservations**: Create and manage room reservations
- **Check-In/Check-Out**: Complete check-in and check-out workflows
- **Billing**: Generate invoices and track charges
- **Payments**: Record payments and track payment status
- **Invoices**: Generate detailed invoices with PDF support
- **Reports**: Daily billing reports and statistics

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **PDF Generation**: PDFKit
- **Authentication**: JWT (prepared)
- **Email**: Nodemailer (prepared)

## Installation

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/younes-glitch2/hotel-management-app.git
   cd hotel-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials and other settings.

4. **Create database and tables**
   ```bash
   psql -U postgres -f src/config/schema.sql
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### Check-In
- `POST /api/check-in` - Check in a guest
- `GET /api/check-in/active` - Get all active stays
- `GET /api/check-in/:id` - Get specific stay log

### Check-Out
- `POST /api/check-out` - Check out a guest and generate invoice
- `GET /api/check-out/:stay_log_id` - Get checkout status

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice details
- `GET /api/invoices/:id/pdf` - Download invoice as PDF
- `POST /api/invoices/:id/payment` - Record payment
- `GET /api/invoices/guest/:guest_id` - Get guest invoices
- `GET /api/invoices/summary/statistics` - Get invoice summary

### Billing
- `GET /api/billing/:guest_id` - Get billing info for guest
- `GET /api/billing/invoice/:invoice_id` - Get invoice billing details
- `POST /api/billing/:invoice_id/discount` - Apply discount
- `GET /api/billing/:guest_id/payments` - Get payment history
- `GET /api/billing/report/daily` - Get daily billing report

### Guests
- `GET /api/guests` - Get all guests
- `POST /api/guests` - Create new guest
- `GET /api/guests/:id` - Get guest details
- `PUT /api/guests/:id` - Update guest

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room
- `GET /api/rooms?status=available` - Filter rooms by status

### Reservations
- `GET /api/reservations` - Get all reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/:id` - Get reservation details
- `PUT /api/reservations/:id` - Update reservation

## Database Schema

### Tables
- `users` - Staff/employee accounts
- `rooms` - Hotel room inventory
- `guests` - Guest profiles
- `reservations` - Room reservations
- `stay_logs` - Check-in/check-out logs
- `services` - Available services
- `service_charges` - Charges added to stays
- `invoices` - Invoice records
- `invoice_items` - Invoice line items
- `payments` - Payment records

## Example Usage

### 1. Create a Guest
```bash
curl -X POST http://localhost:5000/api/guests \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "id_type": "passport",
    "id_number": "ABC123456",
    "address": "123 Main St",
    "city": "New York",
    "country": "USA"
  }'
```

### 2. Create a Room
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "room_number": "101",
    "room_type": "double",
    "capacity": 2,
    "price_per_night": 150.00,
    "amenities": "AC, TV, WiFi, Bathroom"
  }'
```

### 3. Create a Reservation
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guest_id": "guest_uuid",
    "room_id": "room_uuid",
    "check_in_date": "2024-01-15",
    "check_out_date": "2024-01-20",
    "number_of_guests": 2,
    "total_price": 750.00
  }'
```

### 4. Check-In Guest
```bash
curl -X POST http://localhost:5000/api/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "reservation_id": "reservation_uuid",
    "check_in_staff_id": "staff_uuid",
    "notes": "Guest arrived early"
  }'
```

### 5. Check-Out Guest
```bash
curl -X POST http://localhost:5000/api/check-out \
  -H "Content-Type: application/json" \
  -d '{
    "stay_log_id": "stay_log_uuid",
    "check_out_staff_id": "staff_uuid",
    "notes": "Guest satisfied with service",
    "additional_charges": [
      {
        "description": "Room Service",
        "quantity": 2,
        "unit_price": 25.00,
        "total_price": 50.00
      }
    ]
  }'
```

## Testing

Run tests with:
```bash
npm test
```

## Project Structure

```
hotel-management-app/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── schema.sql
│   ├── models/
│   │   ├── Guest.js
│   │   ├── Room.js
│   │   ├── Reservation.js
│   │   ├── StayLog.js
│   │   ├── Invoice.js
│   │   └── Payment.js
│   ├── controllers/
│   │   ├── checkInController.js
│   │   ├── checkOutController.js
│   │   ├── invoiceController.js
│   │   └── billingController.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── checkInRoutes.js
│   │   ├── checkOutRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── guestRoutes.js
│   │   └── reservationRoutes.js
│   └── index.js
├── package.json
├── .env.example
└── README.md
```

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Email notifications for invoices and payments
- [ ] Advanced reporting and analytics
- [ ] Multi-property support
- [ ] Mobile app
- [ ] Payment gateway integration
- [ ] Revenue management system
- [ ] Housekeeping management
- [ ] Inventory management
- [ ] Frontend dashboard

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.
