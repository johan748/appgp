import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'appgp',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test database connection
export async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully');
        client.release();
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

// Database schema initialization
export async function initializeDatabase() {
    const createTablesQuery = `
        -- Enable UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create users table
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            related_entity_id UUID,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create unions table
        CREATE TABLE IF NOT EXISTS unions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) NOT NULL,
            evangelism_department_head VARCHAR(100) NOT NULL,
            config JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create associations table
        CREATE TABLE IF NOT EXISTS associations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) NOT NULL,
            department_head VARCHAR(100) NOT NULL,
            union_id UUID REFERENCES unions(id) ON DELETE CASCADE,
            membership_count INTEGER DEFAULT 0,
            config JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create zones table
        CREATE TABLE IF NOT EXISTS zones (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) NOT NULL,
            director_id UUID REFERENCES users(id) ON DELETE SET NULL,
            association_id UUID REFERENCES associations(id) ON DELETE CASCADE,
            goals JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create districts table
        CREATE TABLE IF NOT EXISTS districts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) NOT NULL,
            pastor_id UUID REFERENCES users(id) ON DELETE SET NULL,
            zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
            goals JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create churches table
        CREATE TABLE IF NOT EXISTS churches (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) NOT NULL,
            district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
            director_id UUID REFERENCES users(id) ON DELETE SET NULL,
            pastor_id UUID REFERENCES users(id) ON DELETE SET NULL,
            address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create small_groups table
        CREATE TABLE IF NOT EXISTS small_groups (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) NOT NULL,
            motto TEXT,
            verse TEXT,
            meeting_day VARCHAR(20),
            meeting_time VARCHAR(10),
            church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
            leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
            goals JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create members table
        CREATE TABLE IF NOT EXISTS members (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            cedula VARCHAR(20) UNIQUE NOT NULL,
            birth_date DATE,
            phone VARCHAR(20),
            email VARCHAR(100),
            address TEXT,
            is_baptized BOOLEAN DEFAULT false,
            gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
            role VARCHAR(30) NOT NULL,
            gp_id UUID REFERENCES small_groups(id) ON DELETE CASCADE,
            leadership_progress JSONB,
            friend_progress JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create missionary_pairs table
        CREATE TABLE IF NOT EXISTS missionary_pairs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            gp_id UUID REFERENCES small_groups(id) ON DELETE CASCADE,
            member1_id UUID REFERENCES members(id) ON DELETE CASCADE,
            member2_id UUID REFERENCES members(id) ON DELETE CASCADE,
            studies_given INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create weekly_reports table
        CREATE TABLE IF NOT EXISTS weekly_reports (
