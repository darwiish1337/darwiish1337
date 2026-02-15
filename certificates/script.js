// Logo URLs for different platforms
const LOGO_URLS = {
    udemy: 'https://logo.clearbit.com/udemy.com',
    coursera: 'https://logo.clearbit.com/coursera.org',
    google: 'https://logo.clearbit.com/google.com',
    microsoft: 'https://logo.clearbit.com/microsoft.com',
    aws: 'https://logo.clearbit.com/aws.amazon.com',
    amazon: 'https://logo.clearbit.com/amazon.com',
    meta: 'https://logo.clearbit.com/meta.com',
    facebook: 'https://logo.clearbit.com/facebook.com',
    linkedin: 'https://logo.clearbit.com/linkedin.com',
    kaggle: 'https://logo.clearbit.com/kaggle.com',
    ibm: 'https://logo.clearbit.com/ibm.com',
    oracle: 'https://logo.clearbit.com/oracle.com',
    cisco: 'https://logo.clearbit.com/cisco.com',
    digiskills: 'https://logo.clearbit.com/digiskills.pk',
    digipakistan: 'https://logo.clearbit.com/digipakistan.pk',
    jawan: 'https://logo.clearbit.com/jawanpakistan.pk',
};

// Function to extract issuer from URL or name
function getIssuerInfo(cert) {
    try {
        const url = new URL(cert.link);
        const hostname = url.hostname.replace('www.', '');
        const parts = hostname.split('.');
        const domain = parts[parts.length - 2];
        
        return {
            name: domain.charAt(0).toUpperCase() + domain.slice(1),
            domain: domain.toLowerCase()
        };
    } catch (e) {
        // Fallback: extract from certificate name
        const nameLower = cert.name.toLowerCase();
        
        if (nameLower.includes('udemy')) return { name: 'Udemy', domain: 'udemy' };
        if (nameLower.includes('coursera')) return { name: 'Coursera', domain: 'coursera' };
        if (nameLower.includes('google')) return { name: 'Google', domain: 'google' };
        if (nameLower.includes('microsoft')) return { name: 'Microsoft', domain: 'microsoft' };
        if (nameLower.includes('aws') || nameLower.includes('amazon')) return { name: 'AWS', domain: 'aws' };
        if (nameLower.includes('digiskills')) return { name: 'DigiSkills', domain: 'digiskills' };
        if (nameLower.includes('digipakistan')) return { name: 'DigiPakistan', domain: 'digipakistan' };
        if (nameLower.includes('jawan')) return { name: 'Jawan Pakistan', domain: 'jawan' };
        
        return { name: 'Certificate Provider', domain: 'default' };
    }
}

// Function to get logo URL
function getLogoUrl(domain) {
    // Check if we have a custom logo URL
    if (LOGO_URLS[domain]) {
        return LOGO_URLS[domain];
    }
    
    // Try Clearbit logo API
    return `https://logo.clearbit.com/${domain}.com`;
}

// Function to get fallback icon
function getFallbackIcon(domain) {
    const icons = {
        udemy: 'fa-brands fa-youtube',
        coursera: 'fa-graduation-cap',
        google: 'fa-brands fa-google',
        microsoft: 'fa-brands fa-microsoft',
        aws: 'fa-brands fa-aws',
        amazon: 'fa-brands fa-aws',
        meta: 'fa-brands fa-meta',
        facebook: 'fa-brands fa-facebook',
        linkedin: 'fa-brands fa-linkedin',
        kaggle: 'fa-brands fa-kaggle',
        ibm: 'fa-brands fa-linux',
        digiskills: 'fa-laptop-code',
        digipakistan: 'fa-graduation-cap',
        jawan: 'fa-certificate',
    };
    
    return icons[domain] || 'fa-certificate';
}

// Function to create certificate card
function createCertificateCard(cert, index) {
    const issuer = getIssuerInfo(cert);
    const logoUrl = getLogoUrl(issuer.domain);
    const fallbackIcon = getFallbackIcon(issuer.domain);
    
    const card = document.createElement('div');
    card.className = 'certificate-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    // Make the whole card clickable
    card.onclick = () => window.open(cert.link, '_blank');
    
    card.innerHTML = `
        <div class="cert-header">
            <div class="cert-logo">
                <img src="${logoUrl}" 
                     alt="${issuer.name}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <i class="${fallbackIcon}" style="display: none;"></i>
            </div>
            <a href="${cert.link}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="external-link" 
               onclick="event.stopPropagation();">
                <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
        <div class="cert-content">
            <h3>${cert.name}</h3>
            <div class="cert-issuer">
                ${issuer.name}
            </div>
        </div>
        <div class="cert-footer">
            <div class="cert-date">
                <i class="fas fa-calendar-check"></i>
                Issued ${extractIssueDate(cert.link)}
            </div>
            <div class="no-expiry">No Expiration Date</div>
        </div>
    `;
    
    return card;
}

// Function to extract issue date from URL (Udemy pattern)
function extractIssueDate(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('udemy')) {
            const pathParts = urlObj.pathname.split('/');
            const ucIndex = pathParts.findIndex(p => p.startsWith('UC-'));
            // Could parse date from certificate ID, but for now just show a generic date
            return 'Recently';
        }
        return 'Recently';
    } catch (e) {
        return 'Recently';
    }
}

// Function to load certificates
async function loadCertificates() {
    const grid = document.getElementById('certificates-grid');
    const countElement = document.getElementById('total-count');
    const dateElement = document.getElementById('last-updated');
    
    console.log('🚀 Loading certificates...');
    
    try {
        // Try multiple paths
        const possiblePaths = [
            './certificates.json',
            'certificates.json',
            'https://darwiish1337.github.io/darwiish1337/certificates/certificates.json',
            'https://raw.githubusercontent.com/darwiish1337/darwiish1337/main/certificates/certificates.json'
        ];
        
        let certificates = null;
        
        for (const path of possiblePaths) {
            try {
                console.log(`Trying: ${path}`);
                const response = await fetch(path);
                
                if (response.ok) {
                    certificates = await response.json();
                    console.log(`✅ Loaded from: ${path}`);
                    break;
                }
            } catch (error) {
                console.log(`❌ Failed: ${path}`);
            }
        }
        
        if (!certificates) {
            throw new Error('Could not load certificates');
        }
        
        // Clear loading
        grid.innerHTML = '';
        
        if (certificates.length === 0) {
            grid.innerHTML = `
                <div class="loading-state">
                    <p>No certificates found</p>
                </div>
            `;
            return;
        }
        
        console.log(`📜 Found ${certificates.length} certificates`);
        
        // Create cards
        certificates.forEach((cert, index) => {
            const card = createCertificateCard(cert, index);
            grid.appendChild(card);
        });
        
        // Update footer
        countElement.textContent = certificates.length;
        dateElement.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        console.log('✅ All certificates loaded!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        grid.innerHTML = `
            <div class="loading-state">
                <p style="color: white;">Error loading certificates</p>
                <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadCertificates);
