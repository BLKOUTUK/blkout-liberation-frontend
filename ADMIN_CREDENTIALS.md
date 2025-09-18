# BLKOUT Liberation Platform - Admin Authentication

## 🔐 Password Protected Admin Functions

All content creation and moderation functions are now password protected to ensure platform security and content quality.

### Admin Credentials

**Administrator Access:**
- Password: `liberation2025`
- Role: Full admin access
- Session Duration: 8 hours

**Moderator Access:**
- Password: `blkout2025`
- Role: Content moderation access
- Session Duration: 8 hours

### Protected Functions

The following functions require admin authentication:

#### Content Creation
- **Create Liberation Event** - Add new community events
- **Write News Article** - Publish community news and updates
- **Share Liberation Story** - Add personal liberation narratives

#### Security Features
- **Password Hashing**: All passwords are SHA-256 hashed with salt
- **Session Management**: 8-hour automatic logout for security
- **Attempt Limiting**: Maximum 3 failed attempts before lockout
- **Lockout Period**: 15-minute lockout after failed attempts
- **Secure Storage**: Encrypted session storage in browser

### How It Works

1. **Trigger**: User clicks any content creation button
2. **Auth Check**: System checks for existing valid session
3. **Challenge**: If not authenticated, password prompt appears
4. **Verification**: Password is hashed and verified against stored credentials
5. **Session**: Upon success, 8-hour session is created
6. **Access**: User can access protected functions until session expires

### Chrome Extension

The Chrome extension for moderators does NOT require additional password protection since:
- Installation itself is the access barrier
- Only admins/moderators will have the extension installed
- Extension is distributed privately to authorized personnel

### Admin Interface Features

- **Session Persistence**: "Keep me signed in" option for 7-day sessions
- **Visual Feedback**: Clear success/error messages
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Works on all device sizes
- **Security Indicators**: Visual confirmation of encrypted sessions

### Usage Instructions

1. Navigate to any content creation section
2. Click "CREATE EVENT", "WRITE NEWS", or "Share Your Story"
3. Enter admin password when prompted
4. Complete content creation in the unlocked form
5. Session remains active for 8 hours across all functions

### Security Best Practices

- **Change Default Passwords**: Update credentials in production
- **Monitor Sessions**: Review authentication logs regularly
- **Limit Distribution**: Only share credentials with authorized personnel
- **Session Hygiene**: Log out on shared computers

### Technical Implementation

- **Component**: `AdminAuth.tsx` - Authentication modal
- **Integration**: `App.tsx` - Protected content creation buttons
- **Storage**: Browser localStorage with encryption
- **Hashing**: SHA-256 with salt for password security

This system ensures that only authorized personnel can create content while maintaining a smooth user experience for legitimate admins and moderators.