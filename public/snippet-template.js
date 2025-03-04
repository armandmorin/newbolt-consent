/**
 * ConsentHub Consent Management Script
 * This script handles cookie consent management for websites
 * Version: 1.0.0
 */

(function() {
  // Configuration will be populated by the server when serving this file
  const config = {
    clientId: '{{CLIENT_ID}}',
    position: '{{POSITION}}',
    categories: {
      necessary: true,
      analytics: {{ANALYTICS_ENABLED}},
      marketing: {{MARKETING_ENABLED}},
      preferences: {{PREFERENCES_ENABLED}}
    },
    branding: {
      headerColor: '{{HEADER_COLOR}}',
      linkColor: '{{LINK_COLOR}}',
      buttonColor: '{{BUTTON_COLOR}}',
      buttonTextColor: '{{BUTTON_TEXT_COLOR}}',
      logo: '{{LOGO_URL}}',
      poweredBy: '{{POWERED_BY}}'
    },
    language: '{{DEFAULT_LANGUAGE}}',
    apiEndpoint: '{{API_ENDPOINT}}'
  };

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
      
      // Apply consent (enable/disable scripts based on preferences)
      this.applyConsent(categories);
    },
    
    logConsent: function(consentData) {
      // Send consent data to server
      try {
        const endpoint = config.apiEndpoint + '/consent';
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
          // Use beacon API for better reliability when page is unloading
          keepalive: true
        }).catch(err => console.error('Failed to log consent:', err));
      } catch (e) {
        console.error('Error logging consent:', e);
      }
    },
    
    getVisitorId: function() {
      // Generate or retrieve a unique visitor ID
      let visitorId = localStorage.getItem('consenthub_visitor_id');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('consenthub_visitor_id', visitorId);
      }
      return visitorId;
    },
    
    applyConsent: function(categories) {
      // This function would enable/disable scripts based on consent
      // For example, enabling Google Analytics if analytics is accepted
      
      // Example: Enable Google Analytics if analytics is accepted
      if (categories.analytics && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
      
      // Example: Enable marketing cookies if marketing is accepted
      if (categories.marketing && window.fbq) {
        window.fbq('consent', 'grant');
      }
      
      // Dispatch event for other scripts to listen to
      window.dispatchEvent(new CustomEvent('consenthub:consent-updated', { 
        detail: { categories } 
      }));
    }
  };

  // Create consent banner element
  function createConsentBanner() {
    // Create container
    const container = document.createElement('div');
    container.id = 'consenthub-container';
    container.style.position = 'fixed';
    container.style.zIndex = '999999';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Set position based on configuration
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
      default:
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.maxWidth = '400px';
    }

    // Create banner content
    const banner = document.createElement('div');
    banner.style.backgroundColor = '#fff';
    banner.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    banner.style.borderRadius = '8px';
    banner.style.overflow = 'hidden';
    
    // Create header
    const header = document.createElement('div');
    header.style.backgroundColor = config.branding.headerColor;
    header.style.color = '#fff';
    header.style.padding = '12px 16px';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    
    // Add logo if available
    if (config.branding.logo) {
      const logo = document.createElement('img');
      logo.src = config.branding.logo;
      logo.alt = 'Logo';
      logo.style.height = '24px';
      logo.style.marginRight = '10px';
      header.appendChild(logo);
    }
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Cookie Consent';
    title.style.margin = '0';
    title.style.fontSize = '16px';
    title.style.fontWeight = '600';
    header.appendChild(title);
    
    // Add close button for modal
    if (config.position === 'modal') {
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.background = 'none';
      closeBtn.style.border = 'none';
      closeBtn.style.color = '#fff';
      closeBtn.style.fontSize = '20px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.marginLeft = 'auto';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.onclick = function() {
        container.style.display = 'none';
      };
      header.appendChild(closeBtn);
    }
    
    // Create content
    const content = document.createElement('div');
    content.style.padding = '16px';
    
    // Add description
    const description = document.createElement('p');
    description.textContent = 'We use cookies to enhance your experience on our website. By continuing to use this site, you consent to the use of cookies in accordance with our ';
    description.style.margin = '0 0 16px 0';
    description.style.fontSize = '14px';
    description.style.lineHeight = '1.5';
    description.style.color = '#333';
    
    // Add policy link
    const policyLink = document.createElement('a');
    policyLink.textContent = 'Cookie Policy';
    policyLink.href = '#';
    policyLink.style.color = config.branding.linkColor;
    policyLink.style.textDecoration = 'underline';
    policyLink.onclick = function(e) {
      e.preventDefault();
      // Open cookie policy (in a real implementation)
      console.log('Cookie policy clicked');
    };
    description.appendChild(policyLink);
    content.appendChild(description);
    
    // Add categories section for modal
    if (config.position === 'modal') {
      const categoriesContainer = document.createElement('div');
      categoriesContainer.style.marginBottom = '16px';
      
      // Necessary cookies (always enabled)
      const necessaryItem = createCategoryItem('Necessary', 'Essential for the website to function properly', true, true);
      categoriesContainer.appendChild(necessaryItem);
      
      // Analytics cookies
      if (config.categories.analytics) {
        const analyticsItem = createCategoryItem('Analytics', 'Help understand how visitors interact with the website', false);
        categoriesContainer.appendChild(analyticsItem);
      }
      
      // Marketing cookies
      if (config.categories.marketing) {
        const marketingItem = createCategoryItem('Marketing', 'Used for advertising and personalized content', false);
        categoriesContainer.appendChild(marketingItem);
      }
      
      // Preferences cookies
      if (config.categories.preferences) {
        const preferencesItem = createCategoryItem('Preferences', 'Remember settings to enhance your experience', false);
        categoriesContainer.appendChild(preferencesItem);
      }
      
      content.appendChild(categoriesContainer);
    }
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexWrap = 'wrap';
    buttonsContainer.style.gap = '8px';
    
    // Accept all button
    const acceptAllBtn = document.createElement('button');
    acceptAllBtn.textContent = 'Accept All';
    acceptAllBtn.style.backgroundColor = config.branding.buttonColor;
    acceptAllBtn.style.color = config.branding.buttonTextColor;
    acceptAllBtn.style.border = 'none';
    acceptAllBtn.style.borderRadius = '4px';
    acceptAllBtn.style.padding = '8px 16px';
    acceptAllBtn.style.fontSize = '14px';
    acceptAllBtn.style.fontWeight = '500';
    acceptAllBtn.style.cursor = 'pointer';
    acceptAllBtn.onclick = function() {
      acceptAll();
      container.style.display = 'none';
    };
    buttonsContainer.appendChild(acceptAllBtn);
    
    // Reject all button
    const rejectAllBtn = document.createElement('button');
    rejectAllBtn.textContent = 'Reject All';
    rejectAllBtn.style.backgroundColor = 'transparent';
    rejectAllBtn.style.color = '#333';
    rejectAllBtn.style.border = '1px solid #ccc';
    rejectAllBtn.style.borderRadius = '4px';
    rejectAllBtn.style.padding = '8px 16px';
    rejectAllBtn.style.fontSize = '14px';
    rejectAllBtn.style.fontWeight = '500';
    rejectAllBtn.style.cursor = 'pointer';
    rejectAllBtn.onclick = function() {
      rejectAll();
      container.style.display = 'none';
    };
    buttonsContainer.appendChild(rejectAllBtn);
    
    // Preferences button (for non-modal)
    if (config.position !== 'modal') {
      const preferencesBtn = document.createElement('button');
      preferencesBtn.textContent = 'Preferences';
      preferencesBtn.style.backgroundColor = 'transparent';
      preferencesBtn.style.color = '#333';
      preferencesBtn.style.border = '1px solid #ccc';
      preferencesBtn.style.borderRadius = '4px';
      preferencesBtn.style.padding = '8px 16px';
      preferencesBtn.style.fontSize = '14px';
      preferencesBtn.style.fontWeight = '500';
      preferencesBtn.style.cursor = 'pointer';
      preferencesBtn.onclick = function() {
        // Switch to modal view
        container.style.display = 'none';
        showPreferencesModal();
      };
      buttonsContainer.appendChild(preferencesBtn);
    } else {
      // Save preferences button (for modal)
      const savePreferencesBtn = document.createElement('button');
      savePreferencesBtn.textContent = 'Save Preferences';
      savePreferencesBtn.style.backgroundColor = 'transparent';
      savePreferencesBtn.style.color = '#333';
      savePreferencesBtn.style.border = '1px solid #ccc';
      savePreferencesBtn.style.borderRadius = '4px';
      savePreferencesBtn.style.padding = '8px 16px';
      savePreferencesBtn.style.fontSize = '14px';
      savePreferencesBtn.style.fontWeight = '500';
      savePreferencesBtn.style.cursor = 'pointer';
      savePreferencesBtn.onclick = function() {
        savePreferences();
        container.style.display = 'none';
      };
      buttonsContainer.appendChild(savePreferencesBtn);
    }
    
    content.appendChild(buttonsContainer);
    
    // Add powered by if available
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
    
    return container;
  }
  
  // Helper function to create category item for modal
  function createCategoryItem(name, description, isChecked, isDisabled = false) {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.marginBottom = '8px';
    item.style.padding = '8px';
    item.style.borderRadius = '4px';
    item.style.backgroundColor = '#f9f9f9';
    
    const leftSide = document.createElement('div');
    leftSide.style.display = 'flex';
    leftSide.style.alignItems = 'center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'consenthub-' + name.toLowerCase();
    checkbox.checked = isChecked;
    checkbox.disabled = isDisabled;
    checkbox.style.marginRight = '8px';
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.style.fontSize = '14px';
    label.style.fontWeight = '500';
    label.style.margin = '0';
    label.textContent = name;
    
    leftSide.appendChild(checkbox);
    leftSide.appendChild(label);
    
    const rightSide = document.createElement('span');
    rightSide.style.fontSize = '12px';
    rightSide.style.color = '#666';
    rightSide.textContent = isDisabled ? 'Always active' : 'Optional';
    
    item.appendChild(leftSide);
    item.appendChild(rightSide);
    
    // Add description
    const descriptionEl = document.createElement('div');
    descriptionEl.style.fontSize = '12px';
    descriptionEl.style.color = '#666';
    descriptionEl.style.marginTop = '4px';
    descriptionEl.style.marginLeft = '24px';
    descriptionEl.textContent = description;
    
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '12px';
    wrapper.appendChild(item);
    wrapper.appendChild(descriptionEl);
    
    return wrapper;
  }
  
  // Show preferences modal
  function showPreferencesModal() {
    // Create modal with detailed preferences
    const container = document.createElement('div');
    container.id = 'consenthub-preferences-modal';
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.zIndex = '999999';
    container.style.maxWidth = '500px';
    container.style.width = '90%';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Create modal content
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#fff';
    modal.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    modal.style.borderRadius = '8px';
    modal.style.overflow = 'hidden';
    
    // Create header
    const header = document.createElement('div');
    header.style.backgroundColor = config.branding.headerColor;
    header.style.color = '#fff';
    header.style.padding = '12px 16px';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    
    // Add logo if available
    if (config.branding.logo) {
      const logo = document.createElement('img');
      logo.src = config.branding.logo;
      logo.alt = 'Logo';
      logo.style.height = '24px';
      logo.style.marginRight = '10px';
      header.appendChild(logo);
    }
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Cookie Preferences';
    title.style.margin = '0';
    title.style.fontSize = '16px';
    title.style.fontWeight = '600';
    header.appendChild(title);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#fff';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = 'auto';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.onclick = function() {
      container.remove();
    };
    header.appendChild(closeBtn);
    
    // Create content
    const content = document.createElement('div');
    content.style.padding = '16px';
    
    // Add description
    const description = document.createElement('p');
    description.textContent = 'Customize your cookie preferences. Necessary cookies are always enabled.';
    description.style.margin = '0 0 16px 0';
    description.style.fontSize = '14px';
    description.style.lineHeight = '1.5';
    description.style.color = '#333';
    content.appendChild(description);
    
    // Add categories
    const categoriesContainer = document.createElement('div');
    categoriesContainer.style.marginBottom = '16px';
    
    // Necessary cookies (always enabled)
    const necessaryItem = createCategoryItem('Necessary', 'Essential for the website to function properly', true, true);
    categoriesContainer.appendChild(necessaryItem);
    
    // Analytics cookies
    if (config.categories.analytics) {
      const analyticsItem = createCategoryItem('Analytics', 'Help understand how visitors interact with the website', false);
      categoriesContainer.appendChild(analyticsItem);
    }
    
    // Marketing cookies
    if (config.categories.marketing) {
      const marketingItem = createCategoryItem('Marketing', 'Used for advertising and personalized content', false);
      categoriesContainer.appendChild(marketingItem);
    }
    
    // Preferences cookies
    if (config.categories.preferences) {
      const preferencesItem = createCategoryItem('Preferences', 'Remember settings to enhance your experience', false);
      categoriesContainer.appendChild(preferencesItem);
    }
    
    content.appendChild(categoriesContainer);
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexWrap = 'wrap';
    buttonsContainer.style.gap = '8px';
    
    // Accept all button
    const acceptAllBtn = document.createElement('button');
    acceptAllBtn.textContent = 'Accept All';
    acceptAllBtn.style.backgroundColor = config.branding.buttonColor;
    acceptAllBtn.style.color = config.branding.buttonTextColor;
    acceptAllBtn.style.border = 'none';
    acceptAllBtn.style.borderRadius = '4px';
    acceptAllBtn.style.padding = '8px 16px';
    acceptAllBtn.style.fontSize = '14px';
    acceptAllBtn.style.fontWeight = '500';
    acceptAllBtn.style.cursor = 'pointer';
    acceptAllBtn.onclick = function() {
      acceptAll();
      container.remove();
    };
    buttonsContainer.appendChild(acceptAllBtn);
    
    // Reject all button
    const rejectAllBtn = document.createElement('button');
    rejectAllBtn.textContent = 'Reject All';
    rejectAllBtn.style.backgroundColor = 'transparent';
    rejectAllBtn.style.color = '#333';
    rejectAllBtn.style.border = '1px solid #ccc';
    rejectAllBtn.style.borderRadius = '4px';
    rejectAllBtn.style.padding = '8px 16px';
    rejectAllBtn.style.fontSize = '14px';
    rejectAllBtn.style.fontWeight = '500';
    rejectAllBtn.style.cursor = 'pointer';
    rejectAllBtn.onclick = function() {
      rejectAll();
      container.remove();
    };
    buttonsContainer.appendChild(rejectAllBtn);
    
    // Save preferences button
    const savePreferencesBtn = document.createElement('button');
    savePreferencesBtn.textContent = 'Save Preferences';
    savePreferencesBtn.style.backgroundColor = 'transparent';
    savePreferencesBtn.style.color = '#333';
    savePreferencesBtn.style.border = '1px solid #ccc';
    savePreferencesBtn.style.borderRadius = '4px';
    savePreferencesBtn.style.padding = '8px 16px';
    savePreferencesBtn.style.fontSize = '14px';
    savePreferencesBtn.style.fontWeight = '500';
    savePreferencesBtn.style.cursor = 'pointer';
    savePreferencesBtn.onclick = function() {
      savePreferences();
      container.remove();
    };
    buttonsContainer.appendChild(savePreferencesBtn);
    
    content.appendChild(buttonsContainer);
    
    // Add powered by if available
    if (config.branding.poweredBy) {
      const poweredBy = document.createElement('div');
      poweredBy.style.marginTop = '12px';
      poweredBy.style.textAlign = 'center';
      poweredBy.style.fontSize = '12px';
      poweredBy.style.color = '#666';
      poweredBy.textContent = 'Powered by ' + config.branding.poweredBy;
      content.appendChild(poweredBy);
    }
    
    modal.appendChild(header);
    modal.appendChild(content);
    container.appendChild(modal);
    
    document.body.appendChild(container);
  }
  
  // Accept all cookies
  function acceptAll() {
    const categories = {
      necessary: true,
      analytics: config.categories.analytics || false,
      marketing: config.categories.marketing || false,
      preferences: config.categories.preferences || false
    };
    
    consentManager.setConsent(categories);
  }
  
  // Reject all optional cookies
  function rejectAll() {
    const categories = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    consentManager.setConsent(categories);
  }
  
  // Save preferences from modal
  function savePreferences() {
    const categories = {
      necessary: true,
      analytics: document.getElementById('consenthub-analytics')?.checked || false,
      marketing: document.getElementById('consenthub-marketing')?.checked || false,
      preferences: document.getElementById('consenthub-preferences')?.checked || false
    };
    
    consentManager.setConsent(categories);
  }
  
  // Initialize consent banner
  function init() {
    // Check if consent already exists
    const existingConsent = consentManager.getConsent();
    
    if (existingConsent) {
      // Apply existing consent
      consentManager.applyConsent(existingConsent.categories);
    } else {
      // Show consent banner
      createConsentBanner();
    }
    
    // Add API to window object
    window.ConsentHub = {
      showPreferences: showPreferencesModal,
      getConsent: consentManager.getConsent.bind(consentManager),
      acceptAll: acceptAll,
      rejectAll: rejectAll
    };
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
