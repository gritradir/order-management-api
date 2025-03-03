CREATE TABLE IF NOT EXISTS orders (
    "orderNumber" VARCHAR(50) PRIMARY KEY NOT NULL,
    "paymentDescription" TEXT NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "town" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "amount" NUMERIC(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "paymentDueDate" DATE NOT NULL,
	"uniqueId" VARCHAR(50) NOT NULL,
    
    -- Additional helpful columns (optional)
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_payment_due_date ON orders(payment_due_date);
CREATE INDEX IF NOT EXISTS idx_orders_country ON orders(country);

-- Add comments for documentation
COMMENT ON TABLE orders IS 'Stores order information including payment details and shipping address';
COMMENT ON COLUMN orders.order_number IS 'Unique identifier for the order';
COMMENT ON COLUMN orders.payment_description IS 'Description of the payment or order';
COMMENT ON COLUMN orders.street_address IS 'Street address for shipping or billing';
COMMENT ON COLUMN orders.town IS 'Town or city for shipping or billing';
COMMENT ON COLUMN orders.country IS 'Country for shipping or billing';
COMMENT ON COLUMN orders.amount IS 'Order amount in the specified currency';
COMMENT ON COLUMN orders.currency IS 'Three-letter currency code (e.g., USD, EUR, GBP)';
COMMENT ON COLUMN orders.payment_due_date IS 'Date when payment is due';