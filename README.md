# Africa TV ERP System

A comprehensive, sophisticated ERP system designed specifically for Africa TV, a large television station. This system includes all essential modules for managing a modern TV station operation.

## Features

### Core Modules

1. **Dashboard** - Real-time overview of station operations, metrics, and performance
2. **Content Management** - Manage videos, images, and documents
3. **Scheduling** - Program scheduling and calendar management
4. **Broadcast Control** - Live broadcast control and transmission management
5. **Personnel & HR** - Employee management and human resources
6. **Finance** - Financial tracking, revenue, expenses, and reports
7. **Inventory** - Equipment and supplies management
8. **CCTV Monitoring** - Multi-camera surveillance system with recording and backup
9. **Attendance System** - Fingerprint-based attendance with overtime calculation
10. **Contacts & Orders** - Website contact and order management
11. **Reports** - Comprehensive reporting system
12. **Analytics** - Detailed analytics and insights
13. **Settings** - System configuration and preferences

### Special Features

#### CCTV Monitoring System
- Support for 10+ CCTV cameras
- Individual camera controls (play, pause, record, stop)
- Separate backup for each camera
- Real-time monitoring
- Detailed reports and logs
- Camera configuration management

#### Attendance System
- Fingerprint device integration
- Automatic time tracking (morning, afternoon, evening)
- Overtime calculation (automatic after 12:00 PM)
- Employee check-in/check-out management
- Monthly attendance reports

#### Multi-Language Support
- **English** - Full support
- **Amharic (አማርኛ)** - Full support
- **Arabic (العربية)** - Full support with RTL support

### Design Features

- **Beautiful Animations** - Smooth, sophisticated animations throughout
- **Glossy UI** - Modern, polished interface design
- **Responsive Design** - Works on all devices
- **Dynamic Sidebar** - Animated sidebar with smooth transitions
- **Glassmorphism Effects** - Modern visual effects
- **Brand Integration** - Africa TV branding with proper logo usage

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Query** - Data fetching and state management
- **Recharts** - Charting library
- **i18next** - Internationalization
- **Zustand** - State management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd africa-tv-erp
```

2. Install dependencies
```bash
npm install
```

3. Copy logo files to public folder
```bash
# Ensure logos are in public/Logo/
# - Transparant Brand Logo.png (for white backgrounds)
# - Transparant Brand White Logo.png (for dark backgrounds)
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
africa-tv-erp/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard module
│   ├── cctv/              # CCTV monitoring
│   ├── attendance/        # Attendance system
│   ├── contacts/          # Contacts & orders
│   ├── content/           # Content management
│   ├── scheduling/        # Program scheduling
│   ├── broadcast/         # Broadcast control
│   ├── personnel/         # HR management
│   ├── finance/           # Financial management
│   ├── inventory/         # Inventory management
│   ├── reports/           # Reports
│   ├── analytics/         # Analytics
│   └── settings/          # Settings
├── components/            # React components
│   ├── Sidebar.tsx        # Animated sidebar
│   ├── Header.tsx         # Top header
│   ├── LanguageSwitcher.tsx # Language selector
│   └── ui/                # UI components
├── lib/                   # Utilities and configurations
│   ├── i18n.ts           # i18n configuration
│   ├── locales/          # Translation files
│   ├── store.ts          # State management
│   └── utils.ts          # Utility functions
├── public/                # Static assets
│   └── Logo/             # Brand logos
└── package.json          # Dependencies
```

## Configuration

### Language Settings

The system supports three languages. Users can switch languages using the language switcher in the header. The selected language is saved in localStorage.

### Logo Usage

- **White Logo** (`Transparant Brand White Logo.png`) - Used on dark backgrounds (sidebar)
- **Brand Logo** (`Transparant Brand Logo.png`) - Used on white/light backgrounds

## Development

### Adding New Modules

1. Create a new page in `app/[module-name]/page.tsx`
2. Add route to sidebar in `components/Sidebar.tsx`
3. Add translations to `lib/locales/*.json`
4. Update navigation menu items

### Adding Translations

Edit the translation files in `lib/locales/`:
- `en.json` - English
- `am.json` - Amharic
- `ar.json` - Arabic

## License

Copyright © 2024 Africa TV. All rights reserved.

## Support

For support and inquiries, please contact the development team.

