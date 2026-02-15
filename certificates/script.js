
// Function to extract domain/issuer from URL
function getIssuerFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        // Extract main domain name
        const parts = hostname.split('.');
        if (parts.length >= 2) {
            const domain = parts[parts.length - 2];
            return domain.charAt(0).toUpperCase() + domain.slice(1);
        }
        return 'Certificate';
    } catch (e) {
        console.error('Error parsing URL:', e);
        return 'Certificate';
    }
}

// Function to get icon based on issuer name
function getIssuerIcon(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('udemy')) return 'fa-brands fa-youtube';
    if (nameLower.includes('coursera')) return 'fa-brands fa-python';
    if (nameLower.includes('google')) return 'fa-brands fa-google';
    if (nameLower.includes('microsoft')) return 'fa-brands fa-microsoft';
    if (nameLower.includes('aws') || nameLower.includes('amazon')) return 'fa-brands fa-aws';
    if (nameLower.includes('meta') || nameLower.includes('facebook')) return 'fa-brands fa-meta';
    if (nameLower.includes('linkedin')) return 'fa-brands fa-linkedin';
    if (nameLower.includes('git')) return 'fa-brands fa-git-alt';
    if (nameLower.includes('kaggle')) return 'fa-brands fa-kaggle';
    if (nameLower.includes('ibm')) return 'fa-brands fa-linux';
    if (nameLower.includes('oracle')) return 'fa-solid fa-database';
    if (nameLower.includes('cisco')) return 'fa-solid fa-network-wired';
    
    return 'fa-solid fa-certificate';
}

// Function to create certificate card
function createCertificateCard(cert, index) {
    const issuer = getIssuerFromUrl(cert.link);
    const icon = getIssuerIcon(cert.name);
    
    const card = document.createElement('div');
    card.className = 'certificate-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="cert-header">
            <div class="cert-logo">
                <i class="${icon}"></i>
            </div>
            <a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="external-link" title="View Certificate">
                <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
        <div class="cert-content">
            <h3>${cert.name}</h3>
            <div class="cert-issuer">
                <i class="fas fa-building"></i>
                ${issuer}
            </div>
            <span class="cert-date">
                <i class="fas fa-calendar-check"></i>
                Verified Certificate
            </span>
        </div>
    `;
    
    return card;
}

// Function to load certificates
async function loadCertificates() {
    const grid = document.getElementById('certificates-grid');
    const countElement = document.getElementById('total-count');
    const dateElement = document.getElementById('last-updated');
    
    console.log('Starting to load certificates...');
    
    try {
        // Try multiple paths to fetch the certificates file
        const possiblePaths = [
            './certificates.json',
            'certificates.json',
            '/darwiish1337/certificates/certificates.json',
            'https://darwiish1337.github.io/darwiish1337/certificates/certificates.json',
            'https://raw.githubusercontent.com/darwiish1337/darwiish1337/main/certificates/certificates.json'
        ];
        
        let certificates = null;
        let successPath = null;
        
        // Try each path until one works
        for (const path of possiblePaths) {
            try {
                console.log(`Trying to fetch from: ${path}`);
                const response = await fetch(path);
                
                if (response.ok) {
                    certificates = await response.json();
                    successPath = path;
                    console.log(`✅ Successfully loaded from: ${path}`);
                    break;
                } else {
                    console.log(`❌ Failed to load from ${path}: ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ Error fetching from ${path}:`, error.message);
            }
        }
        
        // If no path worked, throw error
        if (!certificates) {
            throw new Error('Could not load certificates from any path');
        }
        
        // Clear loading state
        grid.innerHTML = '';
        
        // Check if certificates exist
        if (!certificates || certificates.length === 0) {
            grid.innerHTML = `
                <div class="loading">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>No certificates found</p>
                </div>
            `;
            return;
        }
        
        console.log(`Found ${certificates.length} certificates`);
        
        // Create certificate cards
        certificates.forEach((cert, index) => {
            const card = createCertificateCard(cert, index);
            grid.appendChild(card);
        });
        
        // Update count and date
        countElement.textContent = certificates.length;
        dateElement.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        console.log('✅ Certificates loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error loading certificates:', error);
        grid.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading certificates. Please try again later.</p>
                <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 10px;">
                    ${error.message}
                </p>
            </div>
        `;
    }
}

// Load certificates when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Page loaded, initializing...');
    loadCertificates();
});

// Also try to reload if there was an error
window.addEventListener('load', () => {
    console.log('🔄 Window fully loaded');
});
