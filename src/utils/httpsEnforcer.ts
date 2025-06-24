
export class HttpsEnforcer {
  static enforceHttps(): void {
    // Only redirect in production
    if (process.env.NODE_ENV === 'production' && window.location.protocol === 'http:') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }

  static setSecurityHeaders(): void {
    // Set security-related meta tags if they don't exist
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
    ];

    securityHeaders.forEach(header => {
      if (!document.querySelector(`meta[http-equiv="${header.name}"]`)) {
        const meta = document.createElement('meta');
        meta.httpEquiv = header.name;
        meta.content = header.content;
        document.head.appendChild(meta);
      }
    });
  }

  static checkMixedContent(): boolean {
    // Check if page is loaded over HTTPS but contains HTTP resources
    if (window.location.protocol === 'https:') {
      const httpResources = Array.from(document.querySelectorAll('img, script, link, iframe'))
        .some(element => {
          const src = (element as any).src || (element as any).href;
          return src && src.startsWith('http://');
        });
      
      if (httpResources) {
        console.warn('⚠️ Mixed content detected: HTTP resources on HTTPS page');
        return false;
      }
    }
    return true;
  }

  static initializeSecurity(): void {
    this.enforceHttps();
    this.setSecurityHeaders();
    this.checkMixedContent();
  }
}
