import { toast } from "sonner";

class AccessControl {
  constructor() {
    this.rateLimits = new Map();
    this.blockedIPs = new Set();
    this.suspiciousActivity = new Map();
    this.whitelistedIPs = new Set(['127.0.0.1', 'localhost']);
  }

  // Rate limiting
  checkRateLimit(key, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }

    const requests = this.rateLimits.get(key);
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      this.logSuspiciousActivity(key, 'rate_limit_exceeded');
      toast.error('Too many requests. Please slow down.');
      return false;
    }

    recentRequests.push(now);
    this.rateLimits.set(key, recentRequests);
    return true;
  }

  // Check IP whitelist
  async checkIPWhitelist() {
    try {
      const ip = await this.getClientIP();
      
      if (this.blockedIPs.has(ip)) {
        toast.error('Access denied. Your IP has been blocked.');
        return false;
      }

      // For production, you might want to enforce whitelist
      // if (!this.whitelistedIPs.has(ip)) {
      //   toast.error('Access denied. IP not whitelisted.');
      //   return false;
      // }

      return true;
    } catch (error) {
      console.error("IP check failed:", error);
      return true; // Fail open for development
    }
  }

  // Detect suspicious activity
  logSuspiciousActivity(identifier, activityType) {
    if (!this.suspiciousActivity.has(identifier)) {
      this.suspiciousActivity.set(identifier, []);
    }

    const activities = this.suspiciousActivity.get(identifier);
    activities.push({
      type: activityType,
      timestamp: Date.now()
    });

    // Auto-block after multiple suspicious activities
    if (activities.length >= 5) {
      this.blockIdentifier(identifier);
    }
  }

  blockIdentifier(identifier) {
    this.blockedIPs.add(identifier);
    toast.error('Suspicious activity detected. Access blocked.');
    
    // Auto-unblock after 1 hour
    setTimeout(() => {
      this.blockedIPs.delete(identifier);
    }, 60 * 60 * 1000);
  }

  // Validate session token
  validateSessionToken(token) {
    if (!token || token.length < 16) {
      return false;
    }

    // Check token format
    if (!/^sess_[0-9]+_[a-z0-9]+$/.test(token)) {
      this.logSuspiciousActivity(token, 'invalid_token_format');
      return false;
    }

    return true;
  }

  // Check for SQL injection attempts
  detectSQLInjection(input) {
    const sqlPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
      /(\bOR\b\s+\d+\s*=\s*\d+)/i,
      /(\bAND\b\s+\d+\s*=\s*\d+)/i,
      /(--|\#|\/\*|\*\/)/,
      /(\bUNION\b.*\bSELECT\b)/i
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        this.logSuspiciousActivity(input, 'sql_injection_attempt');
        toast.error('Invalid input detected. Request blocked.');
        return true;
      }
    }

    return false;
  }

  // Check for XSS attempts
  detectXSS(input) {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<embed/gi,
      /<object/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        this.logSuspiciousActivity(input, 'xss_attempt');
        toast.error('Invalid input detected. Request blocked.');
        return true;
      }
    }

    return false;
  }

  // Validate data export request
  validateExportRequest(count, userRole) {
    // Admin can export unlimited
    if (userRole === 'admin') return true;

    // Regular users limited to 1000 records
    if (count > 1000) {
      toast.error('Export limit exceeded. Maximum 1000 records for non-admin users.');
      return false;
    }

    return true;
  }

  // Check download permissions
  canDownload(fileType, userRole) {
    const restrictedTypes = ['exe', 'bat', 'cmd', 'sh', 'dll'];
    
    if (restrictedTypes.includes(fileType.toLowerCase())) {
      toast.error('This file type is not allowed for download.');
      return false;
    }

    return true;
  }

  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // CSRF token management
  generateCSRFToken() {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  validateCSRFToken(token) {
    const storedToken = sessionStorage.getItem('csrf_token');
    return token === storedToken;
  }
}

export const accessControl = new AccessControl();