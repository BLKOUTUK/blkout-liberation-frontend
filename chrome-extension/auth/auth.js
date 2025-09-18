// BLKOUT Liberation Moderator Tools - Authentication System
// Secure password protection for moderator access

class ModeratorAuth {
  constructor() {
    this.isAuthenticated = false;
    this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours
    this.maxAttempts = 3;
    this.lockoutTime = 15 * 60 * 1000; // 15 minutes
    this.init();
  }

  async init() {
    await this.checkExistingSession();
    this.setupSessionMonitoring();
  }

  async checkExistingSession() {
    try {
      const result = await chrome.storage.local.get(['moderatorSession', 'lockout']);

      // Check if account is locked out
      if (result.lockout && new Date().getTime() < result.lockout.until) {
        const timeLeft = Math.ceil((result.lockout.until - new Date().getTime()) / 60000);
        throw new Error(`Account locked. Try again in ${timeLeft} minutes.`);
      }

      // Check existing session
      if (result.moderatorSession) {
        const session = result.moderatorSession;
        const now = new Date().getTime();

        if (now < session.expiresAt) {
          this.isAuthenticated = true;
          this.extendSession();
          return true;
        } else {
          // Session expired
          await chrome.storage.local.remove(['moderatorSession']);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }

    return false;
  }

  async authenticate(password, rememberMe = false) {
    try {
      // Check lockout status
      const lockoutResult = await chrome.storage.local.get(['lockout']);
      if (lockoutResult.lockout && new Date().getTime() < lockoutResult.lockout.until) {
        const timeLeft = Math.ceil((lockoutResult.lockout.until - new Date().getTime()) / 60000);
        throw new Error(`Account locked. Try again in ${timeLeft} minutes.`);
      }

      // Verify password
      const isValid = await this.verifyPassword(password);

      if (isValid) {
        // Clear any existing lockout
        await chrome.storage.local.remove(['lockout', 'failedAttempts']);

        // Create session
        const sessionDuration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : this.sessionTimeout; // 7 days or 8 hours
        const session = {
          authenticated: true,
          createdAt: new Date().getTime(),
          expiresAt: new Date().getTime() + sessionDuration,
          moderatorId: await this.getModeratorId(),
          permissions: await this.getModeratorPermissions()
        };

        await chrome.storage.local.set({ moderatorSession: session });
        this.isAuthenticated = true;

        // Log successful authentication
        this.logAuthEvent('success', { timestamp: new Date().toISOString() });

        return { success: true, session };
      } else {
        // Handle failed attempt
        await this.handleFailedAttempt();
        throw new Error('Invalid password');
      }
    } catch (error) {
      this.logAuthEvent('failure', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async verifyPassword(password) {
    // Hash the provided password and compare with stored hash
    const hashedPassword = await this.hashPassword(password);
    const storedHash = await this.getStoredPasswordHash();

    // For initial setup, if no password is stored, use default
    if (!storedHash) {
      const defaultHash = await this.hashPassword('liberation2025');
      if (hashedPassword === defaultHash) {
        // First time login - prompt to set new password
        return 'FIRST_TIME_LOGIN';
      }
      return false;
    }

    return hashedPassword === storedHash;
  }

  async hashPassword(password) {
    // Use Web Crypto API for secure hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'BLKOUT_LIBERATION_SALT_2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async getStoredPasswordHash() {
    const result = await chrome.storage.local.get(['moderatorPasswordHash']);
    return result.moderatorPasswordHash;
  }

  async setNewPassword(newPassword) {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await chrome.storage.local.set({ moderatorPasswordHash: hashedPassword });

    this.logAuthEvent('password_change', { timestamp: new Date().toISOString() });
    return true;
  }

  async handleFailedAttempt() {
    const result = await chrome.storage.local.get(['failedAttempts']);
    const attempts = (result.failedAttempts || 0) + 1;

    await chrome.storage.local.set({ failedAttempts: attempts });

    if (attempts >= this.maxAttempts) {
      // Lock out the account
      const lockoutUntil = new Date().getTime() + this.lockoutTime;
      await chrome.storage.local.set({
        lockout: {
          until: lockoutUntil,
          attempts: attempts
        }
      });

      this.logAuthEvent('lockout', {
        attempts,
        until: lockoutUntil,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getModeratorId() {
    const result = await chrome.storage.local.get(['moderatorId']);
    if (!result.moderatorId) {
      const moderatorId = 'mod_' + Math.random().toString(36).substr(2, 9);
      await chrome.storage.local.set({ moderatorId });
      return moderatorId;
    }
    return result.moderatorId;
  }

  async getModeratorPermissions() {
    // Default permissions for moderators
    return {
      canSubmitContent: true,
      canSaveDrafts: true,
      canMarkRejected: true,
      canViewStats: true,
      canExtractContent: true,
      maxSubmissionsPerDay: 50
    };
  }

  async extendSession() {
    if (!this.isAuthenticated) return false;

    const result = await chrome.storage.local.get(['moderatorSession']);
    if (result.moderatorSession) {
      const session = result.moderatorSession;
      session.expiresAt = new Date().getTime() + this.sessionTimeout;
      await chrome.storage.local.set({ moderatorSession: session });
      return true;
    }
    return false;
  }

  async logout() {
    this.isAuthenticated = false;
    await chrome.storage.local.remove(['moderatorSession']);
    this.logAuthEvent('logout', { timestamp: new Date().toISOString() });
  }

  async requireAuth() {
    if (!this.isAuthenticated) {
      const hasValidSession = await this.checkExistingSession();
      if (!hasValidSession) {
        throw new Error('Authentication required');
      }
    }

    // Extend session on activity
    await this.extendSession();
    return true;
  }

  setupSessionMonitoring() {
    // Check session validity every 5 minutes
    setInterval(async () => {
      if (this.isAuthenticated) {
        const isValid = await this.checkExistingSession();
        if (!isValid) {
          this.isAuthenticated = false;
          // Notify popup if open
          chrome.runtime.sendMessage({
            type: 'SESSION_EXPIRED'
          }).catch(() => {
            // Popup not open, ignore
          });
        }
      }
    }, 5 * 60 * 1000);
  }

  logAuthEvent(type, data) {
    // Log authentication events for security monitoring
    const logEntry = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...data
    };

    chrome.storage.local.get(['authLog']).then(result => {
      const log = result.authLog || [];
      log.push(logEntry);

      // Keep only last 100 entries
      if (log.length > 100) {
        log.splice(0, log.length - 100);
      }

      chrome.storage.local.set({ authLog: log });
    });
  }

  async getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      session: this.isAuthenticated ? await chrome.storage.local.get(['moderatorSession']) : null
    };
  }

  async clearAllData() {
    // Emergency function to clear all stored data
    await chrome.storage.local.clear();
    this.isAuthenticated = false;
  }
}

// Export for use in other parts of the extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModeratorAuth;
} else {
  window.ModeratorAuth = ModeratorAuth;
}