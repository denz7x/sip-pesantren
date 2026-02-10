# User Setup Guide

This guide explains how to set up users for the SIP Pesantren application.

## Default Users

The application comes with pre-configured default users for testing:

### Admin User
- **Email:** admin@sip-pesantren.id
- **Password:** admin123
- **Role:** ADMIN
- **Name:** Administrator

### Ustadz Users
1. **Ustadz Ahmad**
   - Email: ustadz.ahmad@sip-pesantren.id
   - Password: ustadz123
   - NIP: UST001

2. **Ustadzah Siti**
   - Email: ustadz.siti@sip-pesantren.id
   - Password: ustadz123
   - NIP: UST002

### Orang Tua Users
1. **Bapak Santoso**
   - Email: santoso@example.com
   - Password: orangtua123

2. **Ibu Aminah**
   - Email: aminah@example.com
   - Password: orangtua123

## Adding New Users

### Method 1: Direct Database Insert

Users are stored in the `users` sheet in Google Sheets. Add a new row with the following format:

| Column | Field | Example |
|--------|-------|---------|
| A | id | 4 |
| B | email | newuser@example.com |
| C | password | hashedpassword |
| D | role | ADMIN / USTADZ / ORANG_TUA |
| E | name | New User |
| F | isActive | true |
| G | createdAt | 2024-01-01T00:00:00Z |

### Method 2: Using the Setup Script

Run the setup script to initialize default users:

```bash
npm run setup
```

## Password Hashing

Passwords should be hashed using bcrypt. Example:

```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('password123', 10);
```

## User Roles

- **ADMIN** - Full access to all features
- **USTADZ** - Can input absensi, hafalan, pelanggaran, and use POS
- **ORANG_TUA** - Can view child's data, transactions, absensi, and hafalan

## Security Notes

1. Change default passwords in production
2. Use strong, unique passwords
3. Enable 2FA if available
4. Regularly audit user access
5. Remove inactive users

## Troubleshooting

### Cannot Login
- Check email and password
- Verify user is active (isActive = true)
- Check role assignment

### Forgot Password
- Contact admin to reset password
- Or manually update in Google Sheets (requires re-hashing)
