/**
 * ConsentHub Consent Management Script
 * This script handles cookie consent management for websites
 */
(function() {
  // Configuration will be replaced with actual values
  const config = {{CONFIG}};

  // Cookie utilities
  const cookieUtils = {
    set: function(name, value, days) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
    },
    
    get: function(name) {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
    
    remove: function(name) {
      document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  };

  // Consent management
  const consentManager = {
    cookieName: 'consenthub_preferences',
    
    getConsent: function() {
      const consent = cookieUtils.get(this.cookieName);
      if (consent) {
        try {
          return JSON.parse(consent);
        } catch (e) {
          return null;
        }
      }
      return null;
    },
    
    setConsent: function(categories) {
      const consentData = {
        timestamp: new Date().toISOString(),
        clientId: config.clientId,
        categories: categories
      };
      
      // Save to cookie
      cookieUtils.set(this.cookieName, JSON.stringify(consentData), 365);
      
      // Log consent to server
      this.logConsent(consentData);
      
      // Apply consent
      this.applyConsent(categories);
    },
    
    logConsent: function(consentData) {
      try {
        const endpoint = window.location.origin + '/api/consent';
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clientId: config.clientId,
            visitorId: this.getVisitorId(),
            consentData: consentData
          }),
          keepalive: true
        }).catch(err => console.error('Failed to log consent:', err));
      } catch (e) {
        console.error('Error logging consent:', e);
      }
    },
    
    getVisitorId: function() {
      let visitorId = localStorage.getItem('consenthub_visitor_id');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('consenthub_visitor_id', visitorId);
      }
      return visitorId;
    },
    
    applyConsent: function(categories) {
      // Apply consent settings
      if (categories.analytics && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
      
      if (categories.marketing && window.fbq) {
        window.fbq('consent', 'grant');
      }
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('consenthub:consent-updated', { 
        detail: { categories } 
      }));
    }
  };

  // Create and show the consent banner
  function createConsentBanner() {
    const container = document.createElement('div');
    container.id = 'consenthub-container';
    container.style.position = 'fixed';
    container.style.zIndex = '999999';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Set position
    switch(config.position) {
      case 'top':
        container.style.top = '0';
        container.style.left = '0';
        container.style.right = '0';
        break;
      case 'bottom':
        container.style.bottom = '0';
        container.style.left = '0';
        container.style.right = '0';
        break;
      case 'modal':
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.maxWidth = '500px';
        container.style.width = '90%';
        break;
    }

    // Create banner content
    const banner = document.createElement('div');
    banner.style.backgroundColor = '#fff';
    banner.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    banner.style.borderRadius = '8px';
    banner.style.overflow = 'hidden';
    
    // Add header
    const header = document.createElement('div');
    header.style.backgroundColor = config.branding.headerColor;
    header.style.color = '#fff';
    header.style.padding = '12px 16px';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    
    if (config.branding.logo) {
      const logo = document.createElement('img');
      logo.src = config.branding.logo;
      logo.alt = 'Logo';
      logo.style.height = '24px';
      logo.style.marginRight = '10px';
      header.appendChild(logo);
    }
    
    const title = document.createElement('h3');
    title.textContent = 'Cookie Consent';
    title.style.margin = '0';
    title.style.fontSize = '16px';
    title.style.fontWeight = '600';
    header.appendChild(title);
    
    // Add content
    const content = document.createElement('div');
    content.style.padding = '16px';
    
    const description = document.createElement('p');
    description.innerHTML = `We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. <a href="#" style="color: ${config.branding.linkColor}">Learn more</a>`;
    description.style.margin = '0 0 16px 0';
    description.style.fontSize = '14px';
    content.appendChild(description);
    
    // Add buttons
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '8px';
    
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept All';
    acceptButton.style.backgroundColor = config.branding.buttonColor;
    acceptButton.style.color = config.branding.buttonTextColor;
    acceptButton.style.border = 'none';
    acceptButton.style.padding = '8px 16px';
    acceptButton.style.borderRadius = '4px';
    acceptButton.style.cursor = 'pointer';
    acceptButton.onclick = () => {
      consentManager.setConsent({
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true
      });
      container.remove();
    };
    buttons.appendChild(acceptButton);
    
    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Reject All';
    rejectButton.style.backgroundColor = 'transparent';
    rejectButton.style.border = '1px solid #ccc';
    rejectButton.style.padding = '8px 16px';
    rejectButton.style.borderRadius = '4px';
    rejectButton.style.cursor = 'pointer';
    rejectButton.onclick = () => {
      consentManager.setConsent({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false
      });
      container.remove();
    };
    buttons.appendChild(rejectButton);
    
    content.appendChild(buttons);
    
    if (config.branding.poweredBy) {
      const poweredBy = document.createElement('div');
      poweredBy.style.marginTop = '12px';
      poweredBy.style.textAlign = 'center';
      poweredBy.style.fontSize = '12px';
      poweredBy.style.color = '#666';
      poweredBy.textContent = 'Powered by ' + config.branding.poweredBy;
      content.appendChild(poweredBy);
    }
    
    banner.appendChild(header);
    banner.appendChild(content);
    container.appendChild(banner);
    document.body.appendChild(container);
  }

  // Initialize
  function init() {
    const existingConsent = consentManager.getConsent();
    if (existingConsent) {
      consentManager.applyConsent(existingConsent.categories);
    } else {
      createConsentBanner();
    }
    
    // Add API
    window.ConsentHub = {
      getConsent: consentManager.getConsent.bind(consentManager),
      setConsent: consentManager.setConsent.bind(consentManager)
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
