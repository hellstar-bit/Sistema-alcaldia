// backend/src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  
  // Configuración hardcoded para Transaction Pooler
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 6543,
  username: 'postgres.knditzgnblymqvmnmbmc',
  password: 'r1PxPqL3zXHb0dxb',
  database: 'postgres',
  
  // Entidades
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  
  // Configuración de desarrollo
  synchronize: process.env.NODE_ENV === 'development',
  logging: ['error', 'warn', 'migration'],
  
  // SSL deshabilitado para Transaction Pooler
  ssl: false,
  
  // Configuración específica del pool
  extra: {
    // Pool configuration optimizado para Transaction Pooler
    max: 2,                        // Solo 2 conexiones máximo
    min: 1,                        // 1 conexión mínimo
    idleTimeoutMillis: 30000,      // 30 segundos idle
    connectionTimeoutMillis: 15000, // 15 segundos timeout
    acquireTimeoutMillis: 15000,    // 15 segundos para adquirir conexión
    
    // Configuración del cliente PostgreSQL
    application_name: 'cartera_nestjs',
    
    // Configuración específica para evitar SCRAM issues
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    
    // Timeouts de query
    query_timeout: 30000,
    statement_timeout: 30000,
    
    // Configuración de transacciones
    idle_in_transaction_session_timeout: 30000,
    
    // Encoding
    client_encoding: 'UTF8',
  },
  
  // Configuración de retry
  retryAttempts: 3,
  retryDelay: 2000,
  
  // Otras configuraciones
  dropSchema: false,
  migrationsRun: false,
  installExtensions: false,
  maxQueryExecutionTime: 25000,
  verboseRetryLog: true,
};