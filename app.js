// Firebase Configuration
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Main Application Class
class MegaHubPro {
    constructor() {
        this.adminPassword = "zxcvbnm";
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFirebaseListeners();
        AOS.init({
            duration: 1000,
            once: true
        });
        this.showTab('home');
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.showTab(tab);
            });
        });

        // Hamburger menu
        document.getElementById('hamburger').addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.toggle('active');
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', this.toggleTheme);

        // Admin tabs
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.showAdminTab(e.target.getAttribute('data-admin-tab'));
            });
        });
    }

    setupFirebaseListeners() {
        // Listen for website content updates
        database.ref('websiteContent').on('value', (snapshot) => {
            const content = snapshot.val();
            if (content) this.updateWebsiteContent(content);
        });

        // Listen for live activity
        database.ref('liveActivity').on('value', (snapshot) => {
            const activity = snapshot.val();
            if (activity) this.updateLiveActivity(activity);
        });
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Close mobile menu
        document.getElementById('mobileMenu').classList.remove('active');
    }

    showAdminTab(tabName) {
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
        document.querySelector(`[data-admin-tab="${tabName}"]`).classList.add('active');
    }

    loginAdmin() {
        const password = document.getElementById('adminPassword').value;
        if (password === this.adminPassword) {
            document.getElementById('adminLogin').classList.add('d-none');
            document.getElementById('adminControls').classList.remove('d-none');
            this.showNotification('Admin access granted!', 'success');
            this.loadAdminData();
        } else {
            this.showNotification('Invalid password!', 'error');
        }
    }

    updateAbout() {
        const content = document.getElementById('aboutContent').value;
        database.ref('websiteContent/about').set(content);
        this.showNotification('About section updated!', 'success');
    }

    updateFooter() {
        const content = document.getElementById('footerContent').value;
        database.ref('websiteContent/footer').set(content);
        this.showNotification('Footer updated!', 'success');
    }

    updateSocialLinks() {
        const links = {
            facebook: document.getElementById('facebookLink').value,
            instagram: document.getElementById('instagramLink').value,
            telegram: document.getElementById('telegramLink').value
        };
        database.ref('websiteContent/socialLinks').set(links);
        this.showNotification('Social links updated!', 'success');
    }

    updateContactInfo() {
        const contact = {
            email: document.getElementById('contactEmail').value,
            phone: document.getElementById('contactPhone').value,
            address: document.getElementById('contactAddress').value
        };
        database.ref('websiteContent/contact').set(contact);
        this.showNotification('Contact info updated!', 'success');
    }

    updateWebsiteContent(content) {
        // Update about section
        if (content.about) {
            document.getElementById('about').innerHTML = `
                <div class="container">
                    <div class="glass-card">
                        <h2>About Us</h2>
                        <p>${content.about}</p>
                    </div>
                </div>
            `;
        }

        // Update footer
        if (content.footer) {
            document.getElementById('dynamicFooter').innerHTML = `
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <p>${content.footer}</p>
                        </div>
                        <div class="col-md-6 text-end">
                            ${content.socialLinks ? `
                                <div class="social-links">
                                    ${content.socialLinks.facebook ? `<a href="${content.socialLinks.facebook}" class="social-link"><i class="fab fa-facebook"></i></a>` : ''}
                                    ${content.socialLinks.instagram ? `<a href="${content.socialLinks.instagram}" class="social-link"><i class="fab fa-instagram"></i></a>` : ''}
                                    ${content.socialLinks.telegram ? `<a href="${content.socialLinks.telegram}" class="social-link"><i class="fab fa-telegram"></i></a>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        // Update contact section
        if (content.contact) {
            document.getElementById('contact').innerHTML = `
                <div class="container">
                    <div class="glass-card">
                        <h2>Contact Us</h2>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Email:</strong> ${content.contact.email || 'N/A'}</p>
                                <p><strong>Phone:</strong> ${content.contact.phone || 'N/A'}</p>
                                <p><strong>Address:</strong> ${content.contact.address || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <form>
                                    <input type="text" class="form-control glass-input mb-2" placeholder="Your Name">
                                    <input type="email" class="form-control glass-input mb-2" placeholder="Your Email">
                                    <textarea class="form-control glass-input mb-2" placeholder="Message" rows="4"></textarea>
                                    <button type="submit" class="btn-neon">Send Message</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    updateLiveActivity(activity) {
        const container = document.getElementById('liveActivityFeed');
        if (!activity) return;

        const activities = Object.values(activity).sort((a, b) => b.timestamp - a.timestamp);
        container.innerHTML = activities.map(item => `
            <div class="glass-card feed-item">
                <div class="d-flex align-items-center">
                    <div class="activity-icon">${item.icon || '👤'}</div>
                    <div class="activity-content">
                        <strong>${item.user || 'User'}</strong> ${item.action}
                        <br><small class="text-muted">${new Date(item.timestamp).toLocaleTimeString()}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadAdminData() {
        // Load current content into admin forms
        database.ref('websiteContent').once('value').then(snapshot => {
            const content = snapshot.val();
            if (content) {
                document.getElementById('aboutContent').value = content.about || '';
                document.getElementById('footerContent').value = content.footer || '';
                
                if (content.socialLinks) {
                    document.getElementById('facebookLink').value = content.socialLinks.facebook || '';
                    document.getElementById('instagramLink').value = content.socialLinks.instagram || '';
                    document.getElementById('telegramLink').value = content.socialLinks.telegram || '';
                }
                
                if (content.contact) {
                    document.getElementById('contactEmail').value = content.contact.email || '';
                    document.getElementById('contactPhone').value = content.contact.phone || '';
                    document.getElementById('contactAddress').value = content.contact.address || '';
                }
            }
        });
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize app
const app = new MegaHubPro();

// Global functions for HTML onclick
function showTab(tabName) {
    app.showTab(tabName);
}

function loginAdmin() {
    app.loginAdmin();
}

function updateAbout() {
    app.updateAbout();
}

function updateFooter() {
    app.updateFooter();
}

function updateSocialLinks() {
    app.updateSocialLinks();
}

function updateContactInfo() {
    app.updateContactInfo();
}

// Add some sample live activity
setTimeout(() => {
    database.ref('liveActivity/activity1').set({
        user: 'John Doe',
        action: 'just purchased a new course',
        icon: '🎓',
        timestamp: Date.now()
    });
}, 2000);
