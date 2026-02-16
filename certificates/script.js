// Function to extract issuer from URL or name
function getIssuerInfo(cert) {
    // If issuer is provided in JSON, use it directly
    if (cert.issuer) {
        const issuerLower = cert.issuer.toLowerCase();
        return {
            name: cert.issuer,
            domain: issuerLower
        };
    }
    
    // Otherwise, try to extract from URL
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
        if (nameLower.includes('ibm')) return { name: 'IBM', domain: 'ibm' };
        if (nameLower.includes('cisco')) return { name: 'Cisco', domain: 'cisco' };
        if (nameLower.includes('oracle')) return { name: 'Oracle', domain: 'oracle' };
        if (nameLower.includes('digiskills')) return { name: 'DigiSkills', domain: 'digiskills' };
        if (nameLower.includes('digipakistan')) return { name: 'DigiPakistan', domain: 'digipakistan' };
        if (nameLower.includes('jawan')) return { name: 'Jawan Pakistan', domain: 'jawan' };
        if (nameLower.includes('harvard')) return { name: 'Harvard', domain: 'harvard' };
        if (nameLower.includes('mit')) return { name: 'MIT', domain: 'mit' };
        if (nameLower.includes('stanford')) return { name: 'Stanford', domain: 'stanford' };
        if (nameLower.includes('edx')) return { name: 'edX', domain: 'edx' };
        if (nameLower.includes('meta') || nameLower.includes('facebook')) return { name: 'Meta', domain: 'meta' };
        if (nameLower.includes('linkedin')) return { name: 'LinkedIn', domain: 'linkedin' };
        if (nameLower.includes('kaggle')) return { name: 'Kaggle', domain: 'kaggle' };
        
        return { name: 'Certificate Provider', domain: 'default' };
    }
}

// Function to get logo URL (local first, then fallback to icon)
function getLogoUrl(domain) {
    // Use local logo path
    return `./logos/${domain}.png`;
}

// Function to get fallback icon with colors
function getFallbackIcon(domain) {
    const icons = {
        udemy: { icon: 'fa-brands fa-youtube', color: '#A435F0' },
        coursera: { icon: 'fa-solid fa-graduation-cap', color: '#0056D2' },
        google: { icon: 'fa-brands fa-google', color: '#4285F4' },
        microsoft: { icon: 'fa-brands fa-microsoft', color: '#00A4EF' },
        aws: { icon: 'fa-brands fa-aws', color: '#FF9900' },
        amazon: { icon: 'fa-brands fa-aws', color: '#FF9900' },
        meta: { icon: 'fa-brands fa-meta', color: '#0668E1' },
        facebook: { icon: 'fa-brands fa-facebook', color: '#1877F2' },
        linkedin: { icon: 'fa-brands fa-linkedin', color: '#0A66C2' },
        kaggle: { icon: 'fa-brands fa-kaggle', color: '#20BEFF' },
        ibm: { icon: 'fa-solid fa-server', color: '#0F62FE' },
        cisco: { icon: 'fa-solid fa-network-wired', color: '#049FD9' },
        oracle: { icon: 'fa-solid fa-database', color: '#F80000' },
        digiskills: { icon: 'fa-solid fa-laptop-code', color: '#10B981' },
        digipakistan: { icon: 'fa-solid fa-flag', color: '#059669' },
        jawan: { icon: 'fa-solid fa-certificate', color: '#8B5CF6' },
        harvard: { icon: 'fa-solid fa-university', color: '#A51C30' },
        mit: { icon: 'fa-solid fa-atom', color: '#8A0000' },
        stanford: { icon: 'fa-solid fa-university', color: '#8C1515' },
        edx: { icon: 'fa-solid fa-book-open', color: '#02262B' },
        credly: { icon: 'fa-solid fa-award', color: '#FF6B00' },
        default: { icon: 'fa-solid fa-certificate', color: '#6B7280' },
    };
    
    return icons[domain] || icons.default;
}

// Function to create certificate card
function createCertificateCard(cert, index) {
    const issuer = getIssuerInfo(cert);
    const logoUrl = getLogoUrl(issuer.domain);
    const fallback = getFallbackIcon(issuer.domain);
    
    // Get the issued date from JSON or use default
    const issuedDate = cert.issued_date || 'Recently';
    
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
                <i class="${fallback.icon}" style="display: none; color: ${fallback.color}; font-size: 28px;"></i>
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
                Issued ${issuedDate}
            </div>
            <div class="no-expiry">No Expiration Date</div>
        </div>
    `;
    
    return card;
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
