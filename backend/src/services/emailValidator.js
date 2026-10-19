const dns = require('dns').promises;

// Configure reliable DNS servers (Google + Cloudflare) for consistent MX resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // If setServers fails in restricted environments, fallback to system DNS
}

// Common domain typos made by users
const DOMAIN_TYPOS = {
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
};

// Known disposable / temporary email providers used for fake accounts
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'yopmail.com',
  'yopmail.net',
  'throwawaymail.com',
  'burnermail.io',
  'trashmail.com',
  'sharklasers.com',
  'fakemailgenerator.com',
  'dispostable.com',
  'getairmail.com',
  'mohmal.com',
  'crazymailing.com',
  'mytemp.email',
  'nada.ltd',
  'emailondeck.com',
]);

/**
 * Validates that an email address is syntactically valid, not a disposable domain,
 * has no obvious typos, and has active DNS MX records capable of receiving emails.
 *
 * @param {string} email
 * @returns {Promise<{ isValid: boolean, error?: string }>}
 */
async function validateEmailDeliverability(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const clean = email.trim().toLowerCase();
  const parts = clean.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { isValid: false, error: 'Please enter a valid email format (e.g. name@example.com).' };
  }

  const [username, domain] = parts;

  // Basic username sanity check
  if (username.length > 64 || /[^a-zA-Z0-9._%+-]/.test(username)) {
    return { isValid: false, error: 'The email username contains invalid characters.' };
  }

  // Check for common typo domains
  if (DOMAIN_TYPOS[domain]) {
    return {
      isValid: false,
      error: `Did you mean '@${DOMAIN_TYPOS[domain]}'? Please verify your email spelling.`,
    };
  }

  // Block disposable / throwaway domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Disposable or temporary email addresses are not permitted. Please use a permanent email address (e.g. Gmail, Outlook, Yahoo, or your school email).',
    };
  }

  // Bypass DNS check for test domains or local development
  if (domain.endsWith('test-vidyai.org') || domain === 'localhost') {
    return { isValid: true };
  }


  // Perform DNS MX check with a 3-second timeout
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DNS_TIMEOUT')), 3000)
    );

    const mxRecords = await Promise.race([
      dns.resolveMx(domain),
      timeoutPromise,
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        isValid: false,
        error: `The email domain '@${domain}' has no active mail exchange (MX) servers and cannot receive emails.`,
      };
    }

    return { isValid: true };
  } catch (err) {
    if (err.message === 'DNS_TIMEOUT') {
      // If DNS timed out, gracefully allow to avoid blocking legitimate users on slow networks
      console.warn(`[EMAIL-VALIDATOR] DNS lookup timed out for domain: ${domain}, allowing through`);
      return { isValid: true };
    }

    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'SERVFAIL' || err.code === 'NXDOMAIN') {
      return {
        isValid: false,
        error: `The email domain '@${domain}' does not exist on the internet. Please check for typos and enter a valid email.`,
      };
    }

    // On other transient network issues, log and permit through
    console.warn(`[EMAIL-VALIDATOR] Notice for domain ${domain} (${err.code || err.message}), allowing`);
    return { isValid: true };
  }
}

module.exports = {
  validateEmailDeliverability,
  DOMAIN_TYPOS,
  DISPOSABLE_DOMAINS,
};
