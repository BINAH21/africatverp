# Quick Start Guide - Africa TV ERP System

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Verify Logo Files
Ensure these files exist in `public/Logo/`:
- `Transparant Brand Logo.png` (for light backgrounds)
- `Transparant Brand White Logo.png` (for dark backgrounds)

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open Browser
Navigate to: http://localhost:3000

The system will automatically redirect to `/dashboard`

## 📋 Available Modules

All modules are accessible via the sidebar:

1. **Dashboard** (`/dashboard`) - Main overview
2. **Content Management** (`/content`) - Media library
3. **Scheduling** (`/scheduling`) - Program scheduling
4. **Broadcast Control** (`/broadcast`) - Live broadcast management
5. **Personnel & HR** (`/personnel`) - Employee management
6. **Finance** (`/finance`) - Financial tracking
7. **Inventory** (`/inventory`) - Equipment management
8. **CCTV Monitoring** (`/cctv`) - Multi-camera surveillance
9. **Attendance System** (`/attendance`) - Fingerprint attendance
10. **Contacts & Orders** (`/contacts`) - Website inquiries
11. **Reports** (`/reports`) - System reports
12. **Analytics** (`/analytics`) - Data analytics
13. **Settings** (`/settings`) - System configuration

## 🌍 Language Support

Switch languages using the language switcher in the header:
- 🇬🇧 English
- 🇪🇹 Amharic (አማርኛ)
- 🇸🇦 Arabic (العربية)

## 🎨 Key Features

### CCTV System
- Monitor 10+ cameras simultaneously
- Individual controls (play, pause, record, stop)
- Separate backup for each camera
- Real-time status indicators
- Detailed reports

### Attendance System
- Fingerprint device integration
- Automatic time tracking (morning, afternoon, evening)
- Overtime calculation (after 12:00 PM)
- Monthly reports
- Employee status tracking

### Contacts & Orders
- Website contact form submissions
- Order management
- Status tracking (pending, processed, completed)
- Filtering and search

## 🎯 Next Steps

1. **Configure CCTV Cameras**: Add your camera IPs in Settings
2. **Set Up Fingerprint Devices**: Connect attendance devices
3. **Customize Branding**: Update logos and colors
4. **Add Employees**: Import employee data
5. **Configure Finance**: Set up revenue streams

## 💡 Tips

- Use the sidebar toggle to expand/collapse navigation
- All animations are smooth and performant
- The system is fully responsive
- Data is stored in browser state (add backend for production)

## 🐛 Troubleshooting

**Logos not showing?**
- Check that logo files are in `public/Logo/`
- Verify file names match exactly

**Pages not loading?**
- Clear browser cache
- Check console for errors
- Verify all dependencies are installed

**Language not switching?**
- Check browser localStorage
- Clear cache and try again

## 📞 Support

For issues or questions, refer to the main README.md file.

