import CryptoJS from 'crypto-js';

class DataProtection {
  constructor() {
    this.encryptionKey = this.getOrCreateKey();
  }

  getOrCreateKey() {
    let key = sessionStorage.getItem('_dpk');
    if (!key) {
      key = CryptoJS.lib.WordArray.random(256/8).toString();
      sessionStorage.setItem('_dpk', key);
    }
    return key;
  }

  // Encrypt sensitive data
  encrypt(data) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data), 
        this.encryptionKey
      ).toString();
      return encrypted;
    } catch (error) {
      console.error("Encryption failed:", error);
      return data;
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error("Decryption failed:", error);
      return encryptedData;
    }
  }

  // Mask sensitive data (PII)
  maskEmail(email) {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const masked = local.charAt(0) + '***' + local.charAt(local.length - 1);
    return `${masked}@${domain}`;
  }

  maskPhone(phone) {
    if (!phone) return '';
    return phone.replace(/\d(?=\d{4})/g, '*');
  }

  maskSSN(ssn) {
    if (!ssn) return '';
    return `***-**-${ssn.slice(-4)}`;
  }

  maskCreditCard(card) {
    if (!card) return '';
    return `****-****-****-${card.slice(-4)}`;
  }

  // Detect and mask PII automatically
  autoMaskPII(text) {
    if (!text) return text;
    
    // Email pattern
    text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (email) => this.maskEmail(email));
    
    // Phone pattern (US)
    text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, (phone) => this.maskPhone(phone));
    
    // SSN pattern
    text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, (ssn) => this.maskSSN(ssn));
    
    // Credit card pattern
    text = text.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, (card) => this.maskCreditCard(card));
    
    return text;
  }

  // Sanitize input to prevent XSS
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate file uploads
  validateFileUpload(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} not allowed`);
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} not allowed`);
    }

    // Check for suspicious file names
    if (/[<>:"|?*]/.test(file.name)) {
      errors.push('Invalid characters in filename');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Add watermark to exported data
  addWatermark(data, userEmail) {
    const watermark = {
      exported_by: userEmail,
      exported_at: new Date().toISOString(),
      confidential: true,
      warning: 'This document contains confidential information. Unauthorized distribution is prohibited.'
    };

    if (Array.isArray(data)) {
      return [watermark, ...data];
    } else if (typeof data === 'object') {
      return { _watermark: watermark, ...data };
    }
    return data;
  }

  // Hash sensitive data for comparison without storing plaintext
  hash(data) {
    return CryptoJS.SHA256(data).toString();
  }

  // Secure random token generation
  generateSecureToken(length = 32) {
    return CryptoJS.lib.WordArray.random(length).toString();
  }
}

export const dataProtection = new DataProtection();