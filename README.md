# DRS Cup 2026 - Karting Championship Management System

Admin-controlled karting championship management platform.

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- PostgreSQL
- Prisma ORM
- JWT authentication (jsonwebtoken for Node.js, jose for Edge Runtime)
- Tailwind CSS
- lucide-react (icon library for UI components)
- react-hot-toast (toast notification system)

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Random secret for JWT signing (use a strong random string in production)
- `SEED_ADMIN_EMAIL`: Email for initial admin user
- `SEED_ADMIN_PASSWORD`: Password for initial admin user

3. Run database migrations:
```bash
npm run db:migrate
```

4. Seed initial admin user:
```bash
npm run db:seed
```

### Development

Start the development server:
```bash
npm run dev
```

Access the admin login at: http://localhost:3000/login

## Database Management

### Run migrations
```bash
npm run db:migrate
```

### Seed admin user
```bash
npm run db:seed
```

### Reset database (development only)
```bash
npm run db:reset
```

This will drop the database, recreate it, run migrations, and seed the admin user.

### Open Prisma Studio
```bash
npm run db:studio
```

## Authentication

- Admin-only authentication via JWT
- Tokens stored in HTTP-only cookies
- 7-day token expiration
- Passwords hashed with bcrypt (12 rounds)
- Route protection via Next.js middleware
- Rate limiting on login endpoint (5 attempts per minute)
- Edge Runtime compatible token verification (using jose)

### Authentication Endpoints

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current session info

### Route Protection

All routes under `/admin/*` are protected and require authentication. Unauthenticated users are automatically redirected to `/login`.

The `/login` route is isolated from admin routes and uses a dedicated auth layout (no sidebar). Authenticated users accessing `/login` are automatically redirected to `/admin`.

API routes under `/api/admin/*` return 401 Unauthorized if not authenticated.

The middleware uses Edge Runtime compatible JWT verification (jose library) for optimal performance.

## Layout Structure

The application uses Next.js route groups to separate authentication and admin layouts:

- **Auth Layout** (`app/(auth)/layout.tsx`): Clean, standalone layout for authentication pages with no sidebar or navigation
- **Admin Layout** (`app/admin/layout.tsx`): Includes sidebar navigation and applies only to `/admin/*` routes

This ensures proper layout boundaries - the sidebar never appears on auth pages, and admin pages always include the sidebar.

## Admin Interface

The admin panel features a modern sidebar layout with persistent navigation.

### Layout Structure

- **Sidebar Navigation**: Fixed left sidebar with collapsible functionality
- **Main Content Area**: Adjusts automatically based on sidebar state
- **Responsive Design**: Smooth transitions and animations

### Sidebar Features

- **Logo Header**: Brand logo displayed in sidebar header (replaces text)
  - Expanded state: Full logo (140x35px)
  - Collapsed state: Smaller centered logo (32x32px) with toggle button below
- **Collapsible**: Toggle between expanded (256px) and collapsed (64px) states
- **Toggle Icon**: Chevron icon with smooth rotation animation (lucide-react)
- **State Persistence**: Sidebar state saved in localStorage
- **Active Route Highlighting**: Current page highlighted in brand red
- **Smooth Animations**: CSS transitions for width and content fade
- **No Scrollbars**: Sidebar navigation scrollbar is hidden while maintaining scroll functionality

### Navigation Menu

- Dashboard → `/admin`
- Drivers → `/admin/drivers`
- Tracks → `/admin/tracks` (placeholder)
- Rounds → `/admin/rounds` (placeholder)
- Standings → `/admin/standings` (placeholder)

### Logout

Logout button located at the bottom of the sidebar for easy access. Upon logout, users are redirected to `/login`.

## Driver Management

Drivers are managed exclusively by administrators. Drivers do not have user accounts and are permanent entities that will be linked to races and results.

### Database Model

The `Driver` model includes:
- `id` - UUID primary key
- `fullName` - Required driver name
- `profileImageUrl` - Optional profile image URL
- `weight` - Optional weight in kg
- `height` - Optional height in cm
- `notes` - Optional notes about the driver
- `createdAt` / `updatedAt` - Timestamps

### Driver Management Endpoints

All endpoints require authentication and are located under `/api/admin/drivers`:

- `GET /api/admin/drivers` - List all drivers
- `POST /api/admin/drivers` - Create a new driver
- `GET /api/admin/drivers/:id` - Get driver details
- `PUT /api/admin/drivers/:id` - Update driver
- `DELETE /api/admin/drivers/:id` - Delete driver

### Driver Management Pages

- `/admin/drivers` - Drivers list with table view
- `/admin/drivers/new` - Create new driver form
- `/admin/drivers/:id` - View driver details
- `/admin/drivers/:id/edit` - Edit driver form

All driver management pages are protected by authentication middleware.

## Project Structure

```
/app
  /(auth)           # Route group for authentication pages
    layout.tsx      # Auth layout (no sidebar, clean standalone)
    /login
      page.tsx     # Login page at /login route
  /admin
    layout.tsx      # Admin layout with sidebar (applies to /admin/*)
    /drivers
      page.tsx
      /new
        page.tsx
      /[id]
        page.tsx
        /edit
          page.tsx
    page.tsx
  /api
    /admin
      /drivers
        route.ts
        /[id]
          route.ts
    /auth
      login/route.ts
      logout/route.ts
      me/route.ts
  layout.tsx        # Root layout
  globals.css
  page.tsx

/public
  [logo files]      # Brand logo assets (used in sidebar and login page)

/prisma
  schema.prisma
  seed.ts

/components
  /admin
    Sidebar.tsx      # Main sidebar navigation component with logo
    SidebarLink.tsx  # Reusable navigation link component

/lib
  auth.ts          # JWT authentication (Node.js + Edge Runtime)
  db.ts            # Prisma client
  password.ts      # Password hashing
  rate-limit.ts    # Rate limiting utility
  env.ts           # Environment variable validation
  theme.ts         # Brand theme configuration
  theme-utils.ts   # Theme helper functions

middleware.ts      # Route protection middleware
```

## Security Features

- **Route Protection**: All admin routes protected via middleware
- **Rate Limiting**: Login endpoint protected against brute force (5 attempts/minute)
- **Secure Cookies**: HTTP-only, secure in production, SameSite protection
- **JWT Hardening**: Proper claims (sub), issuer verification, explicit expiration
- **Environment Validation**: Fails fast if required env vars are missing
- **Edge Runtime Support**: Middleware uses jose for Edge-compatible JWT verification

## Features

### Admin Interface

- Modern sidebar navigation with collapsible functionality
- Brand logo in sidebar header (replaces text header)
- Professional toggle icon with smooth rotation animation
- Persistent sidebar state (localStorage)
- Active route highlighting
- Smooth CSS transitions and animations
- Hidden scrollbars for clean appearance
- Text-only navigation (except toggle icon)
- Consistent dark theme with brand colors
- Improved button contrast for better readability

### Authentication Pages

- Standalone login page with brand logo
- Clean, isolated layout (no sidebar or admin navigation)
- Professional design with brand colors
- Automatic redirect for authenticated users

### User Experience

- **Toast Notifications**: All user feedback via toast system (no browser alerts)
- **Icon Actions**: Standard icons for View (Eye), Edit (Pencil), Delete (Trash2)
- **Confirmation Flow**: Delete actions use toast-based confirmation with Confirm/Cancel buttons
- **Accessibility**: All action buttons include aria-labels and title attributes
- **Error Handling**: All errors displayed via toast notifications

### Driver Management

- Full CRUD operations for drivers
- Optional fields support (weight, height, notes, profile image)
- Input validation on both client and server
- Icon-based action buttons (View, Edit, Delete)
- Toast-based delete confirmation (no browser dialogs)
- Success and error notifications via toast system
- Clean, professional UI following project conventions

### Future Features

- Race management
- Results tracking
- Points calculation
- Session management

## Logo System

The application uses a brand logo that appears in:

- **Login Page**: Displayed at the top of the login form (160x40px)
- **Sidebar Header**: Replaces text header "DRS Cup 2026"
  - Expanded sidebar: Full logo (140x35px)
  - Collapsed sidebar: Smaller centered logo (32x32px)

The logo maintains aspect ratio and scales responsively. To replace the logo, update the image source path in the relevant components (Sidebar and Login page) and swap the file in the `/public` directory.

## Development Notes

### Layout Separation

The application uses Next.js route groups to ensure clean layout boundaries:

- `app/(auth)/layout.tsx`: Renders only children, no sidebar or navigation
- `app/admin/layout.tsx`: Includes sidebar and applies only to `/admin/*` routes

This prevents layout leakage - the sidebar will never appear on auth pages, and admin pages always include the sidebar.

### Edge Runtime Compatibility

The middleware runs in Edge Runtime, which doesn't support Node.js crypto APIs. Therefore:
- API routes use `jsonwebtoken` (Node.js runtime)
- Middleware uses `jose` library (Edge Runtime, Web Crypto API)

Both libraries verify tokens with the same secret and issuer, ensuring consistency across runtimes.

### Database Models

- **AdminUser**: Administrator accounts with email and password authentication
- **Driver**: Driver profiles managed by administrators (no user accounts)
