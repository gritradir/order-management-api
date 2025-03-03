# Order Management API

A backend service for managing orders

## Features

- Create and retrieve orders with unique human-readable IDs
- Filter orders by country and description
- Estonia-first sorting with subsequent ordering by payment due date
- Validation to prevent duplicate order numbers

## Running the Application

### Prerequisites
- Be aware of postgres server running locally, that may create port collision between the container and the local server which may lead to unintended behavior

### Local Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Run tests
npm test
```

### Using Docker

```bash
docker compose up --build -d
```

The API will be available at http://localhost:3000

## API Endpoints

- `POST /orders` - Create a new order
- `GET /orders` - Get all orders with optional filtering
- `GET /orders/unique/:id` - Get order by unique ID
- `GET /orders/number/:orderNumber` - Get order by order number

## Environment Variables

Create a `.env` file in the root directory:

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=orders

# API
PORT=3000
```

## Example Request

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ORD-12345",
    "paymentDescription": "Monthly subscription",
    "streetAddress": "123 Main St",
    "town": "Tallinn",
    "country": "Estonia",
    "amount": 99.99,
    "currency": "EUR",
    "paymentDueDate": "2023-12-31"
  }'
```