-- Habilitar la extensión para generar UUIDs automáticamente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. UNIONES
CREATE TABLE unions (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    evangelism_department_head VARCHAR(100),
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASOCIACIONES
CREATE TABLE associations (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_head VARCHAR(100),
    union_id TEXT REFERENCES unions(id) ON DELETE CASCADE,
    membership_count INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ZONAS
CREATE TABLE zones (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    association_id TEXT REFERENCES associations(id) ON DELETE CASCADE,
    director_id UUID REFERENCES auth.users(id), -- Vinculado a Auth de Supabase
    goals JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DISTRITOS
CREATE TABLE districts (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    zone_id TEXT REFERENCES zones(id) ON DELETE CASCADE,
    pastor_id UUID REFERENCES auth.users(id),
    goals JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. IGLESIAS
CREATE TABLE churches (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district_id TEXT REFERENCES districts (id) ON DELETE CASCADE,
    director_id UUID REFERENCES auth.users (id),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GRUPOS PEQUEÑOS
CREATE TABLE small_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    motto TEXT,
    verse TEXT,
    meeting_day VARCHAR(20),
    meeting_time TIME,
    church_id TEXT REFERENCES churches(id) ON DELETE CASCADE,
    leader_id UUID REFERENCES auth.users(id),
    goals JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MIEMBROS
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    cedula VARCHAR(20) UNIQUE,
    birth_date DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    is_baptized BOOLEAN DEFAULT false,
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    role VARCHAR(50) DEFAULT 'MIEMBRO',
    gp_id UUID REFERENCES small_groups(id) ON DELETE SET NULL,
    leadership_progress JSONB DEFAULT '{}'::jsonb,
    friend_progress JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAREJAS MISIONERAS
CREATE TABLE missionary_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    gp_id UUID REFERENCES small_groups (id) ON DELETE CASCADE,
    member1_id UUID REFERENCES members (id) ON DELETE CASCADE,
    member2_id UUID REFERENCES members (id) ON DELETE CASCADE,
    studies_given INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);