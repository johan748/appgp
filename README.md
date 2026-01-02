# AppGP - Sistema de Gestión Integral de Grupos Pequeños

## Descripción

AppGP es un sistema de gestión integral para organizaciones religiosas que permite el seguimiento y administración de grupos pequeños, miembros, reportes, y actividades misioneras a nivel de unión, asociación, zona, distrito, iglesia y grupos pequeños.

## Características Principales

### 🏗️ Arquitectura Moderna

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + PostgreSQL (Supabase/Neon)
- **Despliegue**: Netlify/Vercel (Frontend) + Railway (Backend)
- **Base de Datos**: PostgreSQL con Supabase/Neon para alta disponibilidad

### 👥 Roles de Usuario

- **Administrador**: Gestión completa del sistema
- **Unión**: Visión general de múltiples asociaciones
- **Asociación**: Gestión de zonas y distritos
- **Zona**: Supervisión de distritos
- **Pastor**: Gestión de iglesias y grupos pequeños
- **Director de Ministerio de Personas**: Administración de grupos pequeños
- **Líder de Grupo Pequeño**: Gestión diaria de su grupo

### 📊 Funcionalidades Clave

#### Gestión de Datos

- **Jerarquía Organizacional**: Unión → Asociación → Zona → Distrito → Iglesia → Grupo Pequeño
- **Usuarios y Roles**: Sistema de autenticación por roles
- **Miembros**: Registro, progreso espiritual, desarrollo de liderazgo
- **Reportes Semanales**: Asistencia, estudios bíblicos, bautismos, invitados

#### Seguimiento y Reportes

- **Reportes Automáticos**: Generación automática de reportes por niveles
- **Metas y Progresos**: Seguimiento de metas por periodo (anual, semestral, trimestral, etc.)
- **Parejas Misioneras**: Registro y seguimiento de actividades evangelísticas
- **Amigos y No Bautizados**: Proceso de discipulado y seguimiento

#### Herramientas de Administración

- **Dashboard**: Paneles de control por roles
- **Configuración**: Gestión de metas, usuarios, y configuraciones generales
- **Backup y Restauración**: Copias de seguridad en la nube
- **Alertas**: Sistema de alertas tempranas para seguimiento

## Tecnologías Utilizadas

### Frontend

- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático para mayor seguridad
- **Vite**: Entorno de desarrollo rápido
- **Lucide React**: Iconos
- **Tailwind CSS**: Estilos (implícito en clases)
- **React Router**: Navegación
- **Axios**: Comunicación HTTP

### Backend

- **Node.js**: Entorno de ejecución
- **Express**: Framework web
- **PostgreSQL**: Base de datos relacional
- **Neon**: Proveedor de PostgreSQL en la nube
- **JWT**: Autenticación
- **bcrypt**: Encriptación de contraseñas

### Despliegue

- **Vercel**: Despliegue frontend (Recomendado)
- **Netlify**: Despliegue frontend alternativo
- **Railway**: Despliegue backend
- **Supabase**: Base de datos PostgreSQL serverless
- **GitHub**: Control de versiones

## Estructura del Proyecto

```
AppGP/
├── src/
│   ├── components/          # Componentes React
│   │   └── panels/         # Paneles por roles
│   ├── context/            # Contextos de React
│   ├── services/           # Servicios API
│   ├── types/              # Tipos TypeScript
│   └── pages/              # Páginas principales
├── public/                 # Recursos estáticos
├── src/services/
│   ├── api.ts             # Cliente API
│   ├── realBackend.ts     # Backend real
│   └── mockBackend.ts     # Backend mock (para desarrollo)
└── deployment/
    ├── backend/           # Código backend
    └── database/          # Migraciones y esquemas
```

## Configuración del Entorno

### Variables de Entorno

#### Frontend (.env)

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_VERSION=v1

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_REAL_TIME_UPDATES=true
VITE_USE_REAL_BACKEND=true
```

#### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/appgp_db
NEON_DATABASE_URL=postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/appgp?sslmode=require

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
```

## Instalación y Ejecución

### Requisitos Previos

- Node.js 18+
- npm o yarn
- PostgreSQL (para desarrollo local)

### Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd AppGP
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Ejecutar en desarrollo**

```bash
npm run dev
```

5. **Construir para producción**

```bash
npm run build
```

## Despliegue

### Frontend en Netlify

1. Conectar repositorio a Netlify
2. Configurar variables de entorno en Netlify Dashboard
3. Configurar build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Backend en Railway

1. Conectar repositorio a Railway
2. Configurar variables de entorno
3. Conectar base de datos Neon
4. Desplegar

## API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token

### Usuarios

- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Entidades Principales

- `GET /api/unions` - Uniones
- `GET /api/associations` - Asociaciones
- `GET /api/zones` - Zonas
- `GET /api/districts` - Distritos
- `GET /api/churches` - Iglesias
- `GET /api/small-groups` - Grupos Pequeños
- `GET /api/members` - Miembros
- `GET /api/reports` - Reportes

## Seguridad

### Medidas Implementadas

- **JWT Authentication**: Tokens con expiración
- **HTTPS**: Comunicación segura
- **CSP Headers**: Protección contra XSS
- **Input Validation**: Validación de datos
- **Password Hashing**: Contraseñas encriptadas

### Consideraciones de Seguridad

- No almacenar tokens en localStorage en producción (usar httpOnly cookies)
- Implementar rate limiting en el backend
- Validar todos los inputs del usuario
- Usar HTTPS en todos los entornos

## Contribución

1. **Crear un fork** del proyecto
2. **Crear una rama** para tu feature: `git checkout -b feature/nombre-feature`
3. **Hacer commits** descriptivos: `git commit -m "Añadir feature X"`
4. **Subir cambios**: `git push origin feature/nombre-feature`
5. **Crear un Pull Request**

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## Soporte

Para soporte técnico o preguntas sobre el proyecto:

- **Issues**: Reportar bugs o solicitar features
- **Email**: [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)
- **Documentación**: [Enlace a documentación](#)

## Contribuidores

- [Tu Nombre] - Desarrollador Principal
- [Contribuidores](https://github.com/tu-usuario/AppGP/contributors)

---

**AppGP** - Transformando la gestión de grupos pequeños en una experiencia integral y colaborativa.
