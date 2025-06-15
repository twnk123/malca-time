import DOMPurify from 'dompurify';

// Input sanitization utilities
export const sanitizeInput = {
  // Sanitize HTML content to prevent XSS
  html: (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: []
    });
  },

  // Sanitize plain text (strip all HTML)
  text: (input: string): string => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  },

  // Sanitize and validate email
  email: (email: string): string => {
    const sanitized = DOMPurify.sanitize(email.trim().toLowerCase(), { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
    return sanitized;
  },

  // Sanitize phone number (keep only valid characters)
  phone: (phone: string): string => {
    const sanitized = DOMPurify.sanitize(phone, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    return sanitized.replace(/[^0-9\s\+\-\(\)]/g, '');
  },

  // Sanitize names (letters, spaces, hyphens, apostrophes only)
  name: (name: string): string => {
    const sanitized = DOMPurify.sanitize(name, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    return sanitized.replace(/[^a-zA-ZÀ-ÿ\s\-\']/g, '').trim();
  }
};

// Input validation utilities
export const validateInput = {
  // Enhanced email validation
  email: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 320; // RFC 5321 limit
  },

  // Enhanced password validation
  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Geslo mora imeti vsaj 8 znakov');
    }
    
    if (password.length > 128) {
      errors.push('Geslo ne sme imeti več kot 128 znakov');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Geslo mora vsebovati vsaj eno malo črko');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Geslo mora vsebovati vsaj eno veliko črko');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Geslo mora vsebovati vsaj eno številko');
    }
    
    if (!/[!@#$%^&*(),."':{}|<>?]/.test(password)) {
      errors.push('Geslo mora vsebovati vsaj en poseben znak');
    }

    // Check for common passwords
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890', 'abc123'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('To geslo je preveč pogosto uporabljeno');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Phone number validation
  phone: (phone: string): boolean => {
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{8,20}$/;
    return phoneRegex.test(phone);
  },

  // Text length validation
  textLength: (text: string, maxLength: number): boolean => {
    return text.length <= maxLength;
  },

  // Name validation (letters, spaces, hyphens, apostrophes)
  name: (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-\']{1,100}$/;
    return nameRegex.test(name);
  },

  // Price validation
  price: (price: number): boolean => {
    return price >= 0.50 && price <= 100.00;
  },

  // Quantity validation
  quantity: (quantity: number): boolean => {
    return Number.isInteger(quantity) && quantity >= 1 && quantity <= 50;
  }
};

// Rate limiting utilities
export const rateLimiting = {
  // Check if user can attempt login (client-side check)
  canAttemptLogin: (email: string): boolean => {
    const key = `login_attempts_${email}`;
    const attempts = localStorage.getItem(key);
    
    if (!attempts) return true;
    
    try {
      const data = JSON.parse(attempts);
      const now = Date.now();
      
      // Remove attempts older than 15 minutes
      data.attempts = data.attempts.filter((time: number) => now - time < 15 * 60 * 1000);
      
      if (data.attempts.length < 5) {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      }
      
      return false;
    } catch {
      return true;
    }
  },

  // Record failed login attempt
  recordFailedAttempt: (email: string): void => {
    const key = `login_attempts_${email}`;
    const now = Date.now();
    
    try {
      const existing = localStorage.getItem(key);
      const data = existing ? JSON.parse(existing) : { attempts: [] };
      
      data.attempts.push(now);
      
      // Keep only attempts from last 15 minutes
      data.attempts = data.attempts.filter((time: number) => now - time < 15 * 60 * 1000);
      
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      localStorage.setItem(key, JSON.stringify({ attempts: [now] }));
    }
  },

  // Clear failed attempts on successful login
  clearFailedAttempts: (email: string): void => {
    const key = `login_attempts_${email}`;
    localStorage.removeItem(key);
  },

  // Get remaining time until next attempt allowed
  getTimeUntilNextAttempt: (email: string): number => {
    const key = `login_attempts_${email}`;
    const attempts = localStorage.getItem(key);
    
    if (!attempts) return 0;
    
    try {
      const data = JSON.parse(attempts);
      if (data.attempts.length < 5) return 0;
      
      const oldestAttempt = Math.min(...data.attempts);
      const timeUntilExpiry = (oldestAttempt + 15 * 60 * 1000) - Date.now();
      
      return Math.max(0, timeUntilExpiry);
    } catch {
      return 0;
    }
  }
};

// Security event logging
export const securityLogging = {
  // Log security events (to be sent to backend)
  logEvent: (eventType: string, eventData: any): void => {
    const event = {
      type: eventType,
      data: eventData,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Store locally for batch sending
    const key = 'security_events';
    try {
      const existing = localStorage.getItem(key);
      const events = existing ? JSON.parse(existing) : [];
      events.push(event);
      
      // Keep only last 50 events locally
      if (events.length > 50) {
        events.splice(0, events.length - 50);
      }
      
      localStorage.setItem(key, JSON.stringify(events));
    } catch {
      localStorage.setItem(key, JSON.stringify([event]));
    }
  },

  // Get pending security events
  getPendingEvents: (): any[] => {
    try {
      const events = localStorage.getItem('security_events');
      return events ? JSON.parse(events) : [];
    } catch {
      return [];
    }
  },

  // Clear processed events
  clearEvents: (): void => {
    localStorage.removeItem('security_events');
  }
};

// Password strength indicator
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string;
  color: string;
} => {
  let score = 0;
  let feedback = 'Zelo šibko';
  let color = 'destructive';

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),."':{}|<>?]/.test(password)) score += 1;

  switch (score) {
    case 0:
    case 1:
      feedback = 'Zelo šibko';
      color = 'destructive';
      break;
    case 2:
    case 3:
      feedback = 'Šibko';
      color = 'warning';
      break;
    case 4:
      feedback = 'Srednje';
      color = 'secondary';
      break;
    case 5:
      feedback = 'Močno';
      color = 'primary';
      break;
    case 6:
      feedback = 'Zelo močno';
      color = 'success';
      break;
  }

  return { score, feedback, color };
};
