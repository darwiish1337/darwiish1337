/* ============================================================
   CERTIFICATES PAGE - MAIN SCRIPT
   Author: Mohamed Darwish
   Description: Loads certificates from JSON and renders cards
   ============================================================ */


/* ==================== ISSUER DETECTION ==================== */

/**
 * Extracts issuer name and domain key from a certificate object.
 * Priority: cert.issuer field > URL hostname > certificate name keywords.
 *
 * @param {Object} cert - Certificate object from JSON
 * @returns {{ name: string, domain: string }}
 */
function getIssuerInfo(cert) {

    // Use the "issuer" field directly if provided in the JSON
    if (cert.issuer) {
        return {
            name: cert.issuer,
            domain: cert.issuer.toLowerCase()
        };
    }

    // Try to extract issuer from the certificate URL hostname
    try {
        const url      = new URL(cert.link);
        const hostname = url.hostname.replace('www.', '');
        const parts    = hostname.split('.');
        const domain   = parts[parts.length - 2]; // e.g. "udemy" from "udemy.com"

        return {
            name:   domain.charAt(0).toUpperCase() + domain.slice(1),
            domain: domain.toLowerCase()
        };
    } catch (e) {
        // URL parsing failed, fall through to name-based detection
    }

    // Last resort: detect issuer from keywords in the certificate name
    const nameLower = cert.name.toLowerCase();

    if (nameLower.includes('udemy'))                          return { name: 'Udemy',       domain: 'udemy'       };
    if (nameLower.includes('coursera'))                       return { name: 'Coursera',    domain: 'coursera'    };
    if (nameLower.includes('datacamp'))                       return { name: 'DataCamp',    domain: 'datacamp'    };
    if (nameLower.includes('google'))                         return { name: 'Google',      domain: 'google'      };
    if (nameLower.includes('microsoft'))                      return { name: 'Microsoft',   domain: 'microsoft'   };
    if (nameLower.includes('aws') || nameLower.includes('amazon')) return { name: 'AWS',   domain: 'aws'         };
    if (nameLower.includes('ibm'))                            return { name: 'IBM',         domain: 'ibm'         };
    if (nameLower.includes('cisco'))                          return { name: 'Cisco',       domain: 'cisco'       };
    if (nameLower.includes('oracle'))                         return { name: 'Oracle',      domain: 'oracle'      };
    if (nameLower.includes('meta') || nameLower.includes('facebook')) return { name: 'Meta', domain: 'meta'      };
    if (nameLower.includes('linkedin'))                       return { name: 'LinkedIn',    domain: 'linkedin'    };
    if (nameLower.includes('kaggle'))                         return { name: 'Kaggle',      domain: 'kaggle'      };
    if (nameLower.includes('digiskills'))                     return { name: 'DigiSkills',  domain: 'digiskills'  };
    if (nameLower.includes('harvard'))                        return { name: 'Harvard',     domain: 'harvard'     };
    if (nameLower.includes('mit'))                            return { name: 'MIT',         domain: 'mit'         };
    if (nameLower.includes('edx'))                            return { name: 'edX',         domain: 'edx'         };

    return { name: 'Certificate Provider', domain: 'default' };
}


/* ==================== LOGO & ICON ==================== */

/**
 * Returns the local path to the company logo image.
 * Logos must be stored in ./logos/<domain>.png
 *
 * @param {string} domain - Lowercase domain key (e.g. "udemy")
 * @returns {string} - Relative path to logo file
 */
function getLogoUrl(domain) {
    return `./logos/${domain}.png`;
}

/**
 * Returns a Font Awesome icon class and brand color for a given domain.
 * Used as fallback when the logo image fails to load.
 *
 * @param {string} domain - Lowercase domain key
 * @returns {{ icon: string, color: string }}
 */
function getFallbackIcon(domain) {
    const icons = {
        udemy:        { icon: 'fa-brands fa-youtube',       color: '#A435F0' },
        coursera:     { icon: 'fa-solid fa-graduation-cap', color: '#0056D2' },
        datacamp:     { icon: 'fa-solid fa-chart-bar',      color: '#03EF62' },
        google:       { icon: 'fa-brands fa-google',        color: '#4285F4' },
        microsoft:    { icon: 'fa-brands fa-microsoft',     color: '#00A4EF' },
        aws:          { icon: 'fa-brands fa-aws',           color: '#FF9900' },
        amazon:       { icon: 'fa-brands fa-aws',           color: '#FF9900' },
        ibm:          { icon: 'fa-solid fa-server',         color: '#0F62FE' },
        cisco:        { icon: 'fa-solid fa-network-wired',  color: '#049FD9' },
        oracle:       { icon: 'fa-solid fa-database',       color: '#F80000' },
        meta:         { icon: 'fa-brands fa-meta',          color: '#0668E1' },
        facebook:     { icon: 'fa-brands fa-facebook',      color: '#1877F2' },
        linkedin:     { icon: 'fa-brands fa-linkedin',      color: '#0A66C2' },
        kaggle:       { icon: 'fa-brands fa-kaggle',        color: '#20BEFF' },
        digiskills:   { icon: 'fa-solid fa-laptop-code',    color: '#10B981' },
        digipakistan: { icon: 'fa-solid fa-flag',           color: '#059669' },
        jawan:        { icon: 'fa-solid fa-certificate',    color: '#8B5CF6' },
        harvard:      { icon: 'fa-solid fa-university',     color: '#A51C30' },
        mit:          { icon: 'fa-solid fa-atom',           color: '#8A0000' },
        stanford:     { icon: 'fa-solid fa-university',     color: '#8C1515' },
        edx:          { icon: 'fa-solid fa-book-open',      color: '#02262B' },
        credly:       { icon: 'fa-solid fa-award',          color: '#FF6B00' },
        default:      { icon: 'fa-solid fa-certificate',    color: '#6B7280' },
    };

    return icons[domain] || icons.default;
}


/* ==================== EXPIRY STATUS ==================== */

/**
 * Calculates the expiry status of a certificate.
 * Returns display text, icon, color, and whether it is expired.
 *
 * @param {string|undefined} expires_date - Expiry date string (e.g. "Feb 2028") or undefined
 * @returns {{ text: string, icon: string, color: string, isExpired: boolean }}
 */
function getExpiryStatus(expires_date) {

    // No expiry date provided - certificate does not expire
    if (!expires_date) {
        return {
            text:      'No Expiration Date',
            icon:      'fa-solid fa-infinity',
            color:     '#9ca3af',
            isExpired: false
        };
    }

    // Parse the expiry date and compare to today
    const expiryDate = new Date(expires_date);
    const today      = new Date();

    // Strip time component for accurate day comparison
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
        // Certificate has already expired
        return {
            text:      `Expired - ${expires_date}`,
            icon:      'fa-solid fa-circle-xmark',
            color:     '#EF4444',
            isExpired: true
        };
    }

    if (daysLeft <= 90) {
        // Certificate expires within 3 months - show warning
        return {
            text:      `Expires ${expires_date} - ${daysLeft} days left`,
            icon:      'fa-solid fa-triangle-exclamation',
            color:     '#F59E0B',
            isExpired: false
        };
    }

    // Certificate is valid with plenty of time remaining
    return {
        text:      `Expires ${expires_date}`,
        icon:      'fa-solid fa-circle-check',
        color:     '#10B981',
        isExpired: false
    };
}


/* ==================== CARD BUILDER ==================== */

/**
 * Creates and returns a certificate card DOM element.
 *
 * @param {Object} cert  - Certificate data from JSON
 * @param {number} index - Card index (used for animation delay)
 * @returns {HTMLElement}
 */
function createCertificateCard(cert, index) {
    const issuer       = getIssuerInfo(cert);
    const logoUrl      = getLogoUrl(issuer.domain);
    const fallback     = getFallbackIcon(issuer.domain);
    const issuedDate   = cert.issued_date || 'Unknown';
    const expiry       = getExpiryStatus(cert.expires_date);

    // Create card element
    const card = document.createElement('div');
    card.className = 'certificate-card';
    card.style.animationDelay = `${index * 0.05}s`;

    // Mark expired cards with a CSS class
    if (expiry.isExpired) {
        card.classList.add('expired');
    }

    // Clicking the card opens the certificate link in a new tab
    card.onclick = () => window.open(cert.link, '_blank');

    card.innerHTML = `
        <div class="cert-header">

            <!-- Company Logo (falls back to Font Awesome icon if image not found) -->
            <div class="cert-logo">
                <img
                    src="${logoUrl}"
                    alt="${issuer.name} logo"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <i
                    class="${fallback.icon}"
                    style="display: none; color: ${fallback.color}; font-size: 28px;">
                </i>
            </div>

            <!-- External link icon -->
            <a
                href="${cert.link}"
                target="_blank"
                rel="noopener noreferrer"
                class="external-link"
                title="View Certificate"
                onclick="event.stopPropagation();">
                <i class="fas fa-external-link-alt"></i>
            </a>
        </div>

        <div class="cert-content">
            <!-- Certificate name -->
            <h3>${cert.name}</h3>

            <!-- Issuer / organization name -->
            <div class="cert-issuer">${issuer.name}</div>
        </div>

        <div class="cert-footer">
            <!-- Issue date -->
            <div class="cert-date">
                <i class="fas fa-calendar-check"></i>
                Issued ${issuedDate}
            </div>

            <!-- Expiry status (color set dynamically) -->
            <div class="cert-expiry" style="color: ${expiry.color};">
                <i class="${expiry.icon}"></i>
                ${expiry.text}
            </div>
        </div>
    `;

    return card;
}


/* ==================== MAIN LOADER ==================== */

/**
 * Fetches certificates.json and renders all certificate cards.
 * Tries multiple URL paths in order until one succeeds.
 */
async function loadCertificates() {
    const grid         = document.getElementById('certificates-grid');
    const countEl      = document.getElementById('total-count');
    const dateEl       = document.getElementById('last-updated');

    // List of paths to try when fetching the JSON file
    const paths = [
        './certificates.json',
        'certificates.json',
        'https://darwiish1337.github.io/darwiish1337/certificates/certificates.json',
        'https://raw.githubusercontent.com/darwiish1337/darwiish1337/main/certificates/certificates.json'
    ];

    let certificates = null;

    // Try each path until one returns a valid response
    for (const path of paths) {
        try {
            const response = await fetch(path);

            if (response.ok) {
                certificates = await response.json();
                break;
            }
        } catch (error) {
            // This path failed, try the next one
            continue;
        }
    }

    // If no path worked, show an error message
    if (!certificates) {
        grid.innerHTML = `
            <div class="loading-state">
                <p>Could not load certificates. Please try again later.</p>
            </div>
        `;
        return;
    }

    // Clear the loading spinner
    grid.innerHTML = '';

    // Handle empty certificate list
    if (certificates.length === 0) {
        grid.innerHTML = `
            <div class="loading-state">
                <p>No certificates found.</p>
            </div>
        `;
        return;
    }

    // Build and append a card for each certificate
    certificates.forEach((cert, index) => {
        const card = createCertificateCard(cert, index);
        grid.appendChild(card);
    });

    // Update footer: total count and last-updated date
    countEl.textContent = certificates.length;
    dateEl.textContent  = new Date().toLocaleDateString('en-US', {
        year:  'numeric',
        month: 'long',
        day:   'numeric'
    });
}


/* ==================== ENTRY POINT ==================== */

// Run the loader once the DOM is fully ready
document.addEventListener('DOMContentLoaded', loadCertificates);
