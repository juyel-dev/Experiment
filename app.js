// Nexus Platform Core Application
class NexusPlatform {
    constructor() {
        this.currentSection = 'home';
        this.user = null;
        this.adminPassword = 'zxcvbnm';
        this.isAdmin = false;
        
        this.init();
    }

    async init() {
        try {
            // Initialize components
            await this.initializeFirebase();
            this.setupEventListeners();
            this.setupNavigation();
            this.initializeAnimations();
            this.loadDynamicContent();
            
            // Hide loading screen
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                document.getElementById('app').classList.remove('d-none');
            }, 2000);
            
            console.log('🚀 Nexus Platform initialized successfully');
        } catch (error) {
            console.error('Failed to initialize platform:', error);
            this.showError('Failed to initialize platform. Please refresh the page.');
        }
    }

    async initializeFirebase() {
        // Firebase configuration would be loaded from environment variables
        const firebaseConfig = {
  apiKey: "AIzaSyCYflpDZV4prrM-KayHRRwEU1CtiGEa9e0",
  authDomain: "content-promax.firebaseapp.com",
  databaseURL: "https://content-promax-default-rtdb.firebaseio.com",
  projectId: "content-promax",
  storageBucket: "content-promax.firebasestorage.app",
  messagingSenderId: "590478958749",
  appId: "1:590478958749:web:8434c03f75273e63607474"
};

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.database();
        
        // Set up real-time listeners
        this.setupRealtimeListeners();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateTo(section);
            });
        });

        // Search functionality
        document.getElementById('searchToggle').addEventListener('click', () => {
            this.toggleSearch();
        });

        document.getElementById('searchClose').addEventListener('click', () => {
            this.toggleSearch(false);
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Mobile menu
        document.getElementById('mobileToggle').addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Admin access (hidden feature - Ctrl+Alt+A)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'a') {
                e.preventDefault();
                this.openAdminPanel();
            }
        });
    }

    setupNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initializeAnimations() {
        // Initialize AOS
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });

        // Initialize particles background
        this.initParticles();
    }

    initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        // Simple particle system
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: var(--primary);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatParticle ${10 + Math.random() * 20}s infinite linear;
            `;
            container.appendChild(particle);
        }

        // Add CSS for particle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    async navigateTo(section) {
        // Update active navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Load section content
        await this.loadSection(section);
        
        // Update URL
        history.pushState(null, null, `#${section}`);
        
        // Close mobile menu if open
        this.toggleMobileMenu(false);
    }

    async loadSection(section) {
        const contentContainer = document.getElementById('dynamicContent');
        
        try {
            // Show loading state
            contentContainer.innerHTML = `
                <div class="section-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading ${section}...</p>
                </div>
            `;

            // Load section content
            const content = await this.fetchSectionContent(section);
            contentContainer.innerHTML = content;

            // Initialize section-specific functionality
            this.initializeSection(section);
            
        } catch (error) {
            console.error(`Failed to load section ${section}:`, error);
            contentContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load content</h3>
                    <p>Please try again later</p>
                    <button class="btn btn-primary" onclick="app.loadSection('${section}')">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    async fetchSectionContent(section) {
        // In a real application, this would fetch from an API
        // For now, we'll return mock content
        
        const sections = {
            social: this.getSocialContent(),
            marketplace: this.getMarketplaceContent(),
            learning: this.getLearningContent(),
            services: this.getServicesContent(),
            analytics: this.getAnalyticsContent()
        };

        return sections[section] || '<div class="section-placeholder"><h2>Section Coming Soon</h2></div>';
    }

    getSocialContent() {
        return `
            <section class="content-section">
                <div class="container">
                    <div class="section-header">
                        <h2>Social Connect</h2>
                        <p>Connect with friends, share moments, and build communities</p>
                    </div>
                    
                    <div class="social-feed">
                        <div class="create-post-card glass-card">
                            <div class="post-editor">
                                <textarea placeholder="What's on your mind?" class="post-input"></textarea>
                                <div class="post-actions">
                                    <button class="action-btn">
                                        <i class="fas fa-image"></i>
                                    </button>
                                    <button class="action-btn">
                                        <i class="fas fa-video"></i>
                                    </button>
                                    <button class="action-btn">
                                        <i class="fas fa-map-marker-alt"></i>
                                    </button>
                                    <button class="btn btn-primary">Post</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="posts-container" id="postsContainer">
                            <!-- Posts will be loaded here -->
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    initializeSection(section) {
        // Initialize section-specific functionality
        switch(section) {
            case 'social':
                this.initializeSocial();
                break;
            case 'marketplace':
                this.initializeMarketplace();
                break;
            case 'learning':
                this.initializeLearning();
                break;
            case 'services':
                this.initializeServices();
                break;
            case 'analytics':
                this.initializeAnalytics();
                break;
        }
    }

    toggleSearch(show = null) {
        const searchContainer = document.getElementById('searchContainer');
        if (show === null) {
            show = !searchContainer.classList.contains('active');
        }
        
        searchContainer.classList.toggle('active', show);
        
        if (show) {
            document.querySelector('.search-input').focus();
        }
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const icon = document.querySelector('#themeToggle i');
        if (document.body.classList.contains('light-theme')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    toggleMobileMenu(show = null) {
        const navMenu = document.getElementById('navMenu');
        if (show === null) {
            show = !navMenu.classList.contains('active');
        }
        navMenu.classList.toggle('active', show);
    }

    openAdminPanel() {
        const adminModal = new bootstrap.Modal(document.getElementById('adminModal'));
        this.loadAdminContent();
        adminModal.show();
    }

    async loadAdminContent() {
        const adminContent = document.getElementById('adminPanelContent');
        
        adminContent.innerHTML = `
            <div class="admin-login" id="adminLogin">
                <div class="login-form glass-card">
                    <h4>Admin Authentication</h4>
                    <input type="password" id="adminPasswordInput" class="form-control" placeholder="Enter admin password">
                    <button class="btn btn-primary w-100 mt-3" onclick="app.authenticateAdmin()">Login</button>
                </div>
            </div>
            <div class="admin-dashboard d-none" id="adminDashboard">
                <!-- Admin dashboard content -->
            </div>
        `;
    }

    authenticateAdmin() {
        const password = document.getElementById('adminPasswordInput').value;
        if (password === this.adminPassword) {
            this.isAdmin = true;
            document.getElementById('adminLogin').classList.add('d-none');
            document.getElementById('adminDashboard').classList.remove('d-none');
            this.loadAdminDashboard();
        } else {
            this.showError('Invalid admin password');
        }
    }

    async loadAdminDashboard() {
        const dashboard = document.getElementById('adminDashboard');
        
        dashboard.innerHTML = `
            <div class="admin-header">
                <h4><i class="fas fa-tachometer-alt"></i> Admin Dashboard</h4>
                <div class="admin-stats">
                    <div class="stat-card">
                        <i class="fas fa-users"></i>
                        <div class="stat-info">
                            <h5>10,234</h5>
                            <span>Total Users</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-shopping-cart"></i>
                        <div class="stat-info">
                            <h5>5,678</h5>
                            <span>Products</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-chart-line"></i>
                        <div class="stat-info">
                            <h5>$125,430</h5>
                            <span>Revenue</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="admin-controls">
                <div class="control-tabs">
                    <button class="control-tab active" data-tab="content">Content</button>
                    <button class="control-tab" data-tab="users">Users</button>
                    <button class="control-tab" data-tab="settings">Settings</button>
                    <button class="control-tab" data-tab="analytics">Analytics</button>
                </div>
                
                <div class="control-content">
                    <div class="tab-pane active" id="contentControl">
                        <h5>Content Management</h5>
                        <!-- Content management controls -->
                    </div>
                    <!-- Other tab panes -->
                </div>
            </div>
        `;
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        errorDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showSuccess(message) {
        // Similar to showError but for success messages
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success alert-dismissible fade show';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        successDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }
}

// Initialize the platform when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NexusPlatform();
});
