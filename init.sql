-- CroweCad Database Initialization Script

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE skill_category AS ENUM (
    'geometric_algorithms',
    'autolisp_patterns',
    'spatial_operations',
    'cad_commands',
    'parametric_templates',
    'drawing',
    'calculation',
    'transformation',
    'selection',
    'modification'
);

-- Skills table for persistent storage
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category skill_category NOT NULL,
    description TEXT,
    implementation TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    keywords TEXT[],
    confidence DECIMAL(3,2) DEFAULT 0.5,
    usage_count INTEGER DEFAULT 0,
    repository VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    embedding VECTOR(1536) -- For semantic search
);

-- Create indexes
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_keywords ON skills USING GIN(keywords);
CREATE INDEX idx_skills_confidence ON skills(confidence DESC);
CREATE INDEX idx_skills_usage ON skills(usage_count DESC);

-- Assistant threads table
CREATE TABLE IF NOT EXISTS assistant_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Training history table
CREATE TABLE IF NOT EXISTS training_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern TEXT NOT NULL,
    category skill_category NOT NULL,
    name VARCHAR(255),
    description TEXT,
    added_skills JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255)
);

-- Query history for analytics
CREATE TABLE IF NOT EXISTS query_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    context JSONB,
    response TEXT,
    code_blocks JSONB,
    relevant_skills JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER,
    user_id VARCHAR(255)
);

-- File analysis history
CREATE TABLE IF NOT EXISTS file_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    entities JSONB,
    layers JSONB,
    ai_insights TEXT,
    suggested_operations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255)
);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default skills
INSERT INTO skills (name, category, description, implementation, language, keywords, confidence)
VALUES 
    ('lineIntersection', 'geometric_algorithms', 'Calculate intersection point of two lines', 
     'function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) { /* implementation */ }',
     'javascript', ARRAY['line', 'intersection', 'geometry'], 1.0),
    
    ('drawCircle', 'autolisp_patterns', 'Draw a circle with AutoLISP',
     '(defun c:drawcircle () (command "circle" (getpoint) (getdist)))',
     'lisp', ARRAY['circle', 'draw', 'autolisp'], 1.0),
    
    ('offsetPolyline', 'geometric_algorithms', 'Offset a polyline by distance',
     'function offsetPolyline(points, distance) { /* implementation */ }',
     'javascript', ARRAY['offset', 'polyline', 'distance'], 1.0)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crowecad;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crowecad;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO crowecad;