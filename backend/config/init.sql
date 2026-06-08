-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255),
    phone               VARCHAR(15),
    profile_pic         VARCHAR(500),
    is_email_verified   BOOLEAN DEFAULT FALSE,
    google_id           VARCHAR(255) UNIQUE,
    avg_rating          DECIMAL(3,2) DEFAULT 0.00,
    total_rides         INT DEFAULT 0,
    is_admin            BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- 2. DRIVER VERIFICATIONS
CREATE TABLE IF NOT EXISTS driver_verifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number      VARCHAR(50) NOT NULL,
    license_expiry      DATE NOT NULL,
    license_image_url   VARCHAR(500),
    aadhar_number       VARCHAR(12) NOT NULL UNIQUE,
    aadhar_image_url    VARCHAR(500),
    status              VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason    TEXT,
    reviewed_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at        TIMESTAMP DEFAULT NOW(),
    reviewed_at         TIMESTAMP
);

-- 3. VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_name        VARCHAR(100) NOT NULL,
    vehicle_number      VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type        VARCHAR(20) DEFAULT 'CAR' CHECK (vehicle_type IN ('CAR', 'SUV', 'BIKE')),
    total_seats         INT NOT NULL CHECK (total_seats > 0 AND total_seats <= 7),
    color               VARCHAR(50),
    vehicle_image_url   VARCHAR(500),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- 4. RIDES
CREATE TABLE IF NOT EXISTS rides (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id          UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    origin              VARCHAR(255) NOT NULL,
    destination         VARCHAR(255) NOT NULL,
    origin_lat          DECIMAL(9,6),
    origin_lng          DECIMAL(9,6),
    destination_lat     DECIMAL(9,6),
    destination_lng     DECIMAL(9,6),
    departure_time      TIMESTAMP NOT NULL,
    estimated_duration  INT,
    total_seats         INT NOT NULL CHECK (total_seats > 0),
    available_seats     INT NOT NULL CHECK (available_seats >= 0),
    total_trip_cost     DECIMAL(10,2) NOT NULL,
    price_per_seat      DECIMAL(10,2) NOT NULL CHECK (price_per_seat > 0),
    description         TEXT,
    status              VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FULL', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    CONSTRAINT available_not_exceed_total CHECK (available_seats <= total_seats)
);

-- 5. RIDE WAYPOINTS
CREATE TABLE IF NOT EXISTS ride_waypoints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id         UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    location_name   VARCHAR(255) NOT NULL,
    lat             DECIMAL(9,6),
    lng             DECIMAL(9,6),
    stop_order      INT NOT NULL,
    CONSTRAINT unique_stop_order UNIQUE (ride_id, stop_order)
);

-- 6. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id             UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    traveler_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seats_booked        INT NOT NULL CHECK (seats_booked > 0),
    pickup_point        VARCHAR(255),
    drop_point          VARCHAR(255),
    total_fare          DECIMAL(10,2) NOT NULL,
    status              VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED')),
    cancelled_by        VARCHAR(20) CHECK (cancelled_by IN ('DRIVER', 'TRAVELER', 'SYSTEM')),
    cancellation_reason TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id              UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    traveler_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    razorpay_order_id       VARCHAR(255) NOT NULL UNIQUE,
    razorpay_payment_id     VARCHAR(255) UNIQUE,
    razorpay_signature      VARCHAR(500),
    amount                  DECIMAL(10,2) NOT NULL,
    currency                VARCHAR(10) DEFAULT 'INR',
    status                  VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    payment_method          VARCHAR(50),
    paid_at                 TIMESTAMP,
    created_at              TIMESTAMP DEFAULT NOW()
);

-- 8. REFUNDS
CREATE TABLE IF NOT EXISTS refunds (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id          UUID NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
    booking_id          UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    razorpay_refund_id  VARCHAR(255) UNIQUE,
    refund_amount       DECIMAL(10,2) NOT NULL,
    status              VARCHAR(20) DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'SUCCESS', 'FAILED')),
    reason              TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('BOOKING', 'PAYMENT', 'RIDE', 'VERIFICATION', 'SYSTEM')),
    is_read         BOOLEAN DEFAULT FALSE,
    related_id      UUID,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 10. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating          INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT,
    reviewer_role   VARCHAR(20) NOT NULL CHECK (reviewer_role IN ('DRIVER', 'TRAVELER')),
    created_at      TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_review UNIQUE (booking_id, reviewer_id)
);

-- 11. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   VARCHAR(500) NOT NULL UNIQUE,
    device_info     VARCHAR(255),
    ip_address      VARCHAR(50),
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);




ALTER TABLE rides
ADD COLUMN total_trip_cost DECIMAL(10,2) NOT NULL DEFAULT 0;