-- WallCraft AI Database Schema
-- Run this SQL script in Supabase SQL Editor to create all tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Create posters table
CREATE TABLE IF NOT EXISTS posters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    image_url VARCHAR(500) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    price FLOAT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    orientation VARCHAR(20) NOT NULL,
    style VARCHAR(100) NOT NULL,
    theme VARCHAR(100) NOT NULL,
    rating FLOAT DEFAULT 0.0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on category_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_posters_category_id ON posters(category_id);

-- Create poster_tags table
CREATE TABLE IF NOT EXISTS poster_tags (
    id SERIAL PRIMARY KEY,
    poster_id INTEGER NOT NULL REFERENCES posters(id),
    tag VARCHAR(100) NOT NULL
);

-- Create index on tag for faster lookups
CREATE INDEX IF NOT EXISTS idx_poster_tags_tag ON poster_tags(tag);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    poster_id INTEGER NOT NULL REFERENCES posters(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    total_amount FLOAT NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    poster_id INTEGER NOT NULL REFERENCES posters(id),
    quantity INTEGER DEFAULT 1,
    price FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    payment_provider VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Create ai_room_sessions table
CREATE TABLE IF NOT EXISTS ai_room_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    wall_image_path VARCHAR(500) NOT NULL,
    wall_color VARCHAR(20),
    layout_style VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_room_sessions_user_id ON ai_room_sessions(user_id);

-- Create ai_layouts table
CREATE TABLE IF NOT EXISTS ai_layouts (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES ai_room_sessions(id),
    layout_type VARCHAR(100) NOT NULL,
    layout_metadata_json TEXT NOT NULL,
    generated_preview_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_layouts_session_id ON ai_layouts(session_id);

-- Insert sample categories
INSERT INTO categories (name, slug) VALUES
    ('Dark Aesthetic', 'dark-aesthetic'),
    ('Gaming', 'gaming'),
    ('Minimal', 'minimal'),
    ('Luxury', 'luxury'),
    ('Anime', 'anime'),
    ('Movies', 'movies'),
    ('Music', 'music')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample posters
INSERT INTO posters (title, description, image_url, category_id, price, width, height, orientation, style, theme, rating, is_featured) VALUES
    ('Neon Cyberpunk', 'A stunning neon-lit cyberpunk aesthetic poster', 'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=300&h=450&fit=crop', 1, 299.99, 300, 450, 'portrait', 'cinematic', 'dark', 4.8, true),
    ('Gaming Legend', 'Perfect for gaming enthusiasts', 'https://images.unsplash.com/photo-1538481143235-5d630a3663d7?w=300&h=450&fit=crop', 2, 249.99, 300, 450, 'portrait', 'cinematic', 'dark', 4.6, true),
    ('Minimal Zen', 'Clean and minimalist design', 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=450&fit=crop', 3, 199.99, 300, 450, 'portrait', 'minimal', 'light', 4.5, false),
    ('Luxury Gold', 'Elegant luxury design with gold accents', 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=450&fit=crop', 4, 399.99, 300, 450, 'portrait', 'luxury', 'colorful', 4.9, true),
    ('Anime Dreams', 'Beautiful anime-inspired artwork', 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=450&fit=crop', 5, 229.99, 300, 450, 'portrait', 'collage', 'colorful', 4.7, false),
    ('Movie Magic', 'Iconic movie poster design', 'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=300&h=450&fit=crop', 6, 319.99, 300, 450, 'portrait', 'cinematic', 'dark', 4.8, true),
    ('Music Vibes', 'Music-themed poster for music lovers', 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=450&fit=crop', 7, 259.99, 300, 450, 'portrait', 'collage', 'colorful', 4.6, false)
ON CONFLICT DO NOTHING;

-- Insert sample poster tags
INSERT INTO poster_tags (poster_id, tag) VALUES
    (1, 'cyberpunk'),
    (1, 'neon'),
    (2, 'gaming'),
    (2, 'esports'),
    (3, 'zen'),
    (3, 'minimalist'),
    (4, 'luxury'),
    (4, 'gold'),
    (5, 'anime'),
    (5, 'manga'),
    (6, 'movies'),
    (6, 'cinema'),
    (7, 'music'),
    (7, 'audio')
ON CONFLICT DO NOTHING;

-- Print success message
SELECT 'Database schema created successfully!' as status;
