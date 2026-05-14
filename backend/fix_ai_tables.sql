-- Fix timezone issue in ai_room_sessions table
-- Run this in Supabase SQL Editor

-- Drop dependent tables first
DROP TABLE IF EXISTS ai_layouts CASCADE;
DROP TABLE IF EXISTS ai_room_sessions CASCADE;

-- Recreate ai_room_sessions with correct timezone
CREATE TABLE ai_room_sessions (
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
CREATE INDEX idx_ai_room_sessions_user_id ON ai_room_sessions(user_id);

-- Recreate ai_layouts table
CREATE TABLE ai_layouts (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES ai_room_sessions(id),
    layout_type VARCHAR(100) NOT NULL,
    layout_metadata_json TEXT NOT NULL,
    generated_preview_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on session_id for faster lookups
CREATE INDEX idx_ai_layouts_session_id ON ai_layouts(session_id);

SELECT 'Tables recreated successfully!' as status;
