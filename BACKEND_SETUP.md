# Backend Setup for AppGP

## Descripción

Este documento proporciona las instrucciones para configurar el backend de AppGP utilizando Node.js, Express y PostgreSQL con Neon.

## Estructura del Backend

```
backend/
├── src/
│   ├── controllers/          # Controladores de rutas
│   ├── models/              # Modelos de datos
│   ├── routes/              # Definición de rutas
│   ├── middleware/          # Middleware personalizado
│   ├── utils/               # Utilidades
│   ├── config/              # Configuración
│   └── app.ts               # Aplicación principal
├── migrations/              # Migraciones de base de datos
├── seeds/                   # Datos de inicialización
├── tests/                   # Pruebas
└── package.json
```

## Requisitos del Backend

### Dependencias Principales

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.7",
    "@types/express": "^4.17.21",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "nodemon": "^3.1.0",
    "typescript": "^5.4.5",
    "ts-node": "^10.9.2"
  }
}
```

## Configuración del Backend

### Variables de Entorno (.env)

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/appgp_db
NEON_DATABASE_URL=postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/appgp?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

## Modelos de Base de Datos

### Esquema Principal

```sql
-- Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    related_entity_id VARCHAR(50), -- ID de la entidad que gestiona
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Uniones
CREATE TABLE unions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    evangelism_department_head VARCHAR(100),
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Asociaciones
CREATE TABLE associations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_head VARCHAR(100),
    union_id VARCHAR(50) REFERENCES unions(id),
    membership_count INTEGER DEFAULT 0,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Zonas
CREATE TABLE zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    director_id INTEGER REFERENCES users(id),
    association_id VARCHAR(50) REFERENCES associations(id),
    goals JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Distritos
CREATE TABLE districts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pastor_id INTEGER REFERENCES users(id),
    zone_id VARCHAR(50) REFERENCES zones(id),
    goals JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Iglesias
CREATE TABLE churches (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district_id VARCHAR(50) REFERENCES districts(id),
    director_id INTEGER REFERENCES users(id),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Grupos Pequeños
CREATE TABLE small_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    motto TEXT,
    verse TEXT,
    meeting_day VARCHAR(20),
    meeting_time VARCHAR(10),
    church_id VARCHAR(50) REFERENCES churches(id),
    leader_id INTEGER REFERENCES users(id),
    goals JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Miembros
CREATE TABLE members (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    cedula VARCHAR(20) UNIQUE,
    birth_date DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    is_baptized BOOLEAN DEFAULT false,
    gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
    role VARCHAR(50) DEFAULT 'MIEMBRO',
    gp_id VARCHAR(50) REFERENCES small_groups(id),
    leadership_progress JSONB,
    friend_progress JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Parejas Misioneras
CREATE TABLE missionary_pairs (
    id VARCHAR(50) PRIMARY KEY,
    gp_id VARCHAR(50) REFERENCES small_groups(id),
    member1_id VARCHAR(50) REFERENCES members(id),
    member2_id VARCHAR(50) REFERENCES members(id),
    studies_given INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reportes Semanales
```
