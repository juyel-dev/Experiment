// Main Application Controller
class GraphzApp {
    constructor() {
        this.currentUser = null;
        this.graphs = [];
        this.favorites = new Set();
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadGraphs();
        this.setupServiceWorker();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('nav-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.showUserInterface();
        });

        document.getElementById('nav-profile').addEventListener('click', (e) => {
            e.preventDefault();
            this.showProfilePage();
        });

        document.getElementById('nav-admin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAdminPanel();
        });

        // Auth Modals
        this.setupAuthModals();
        
        // Search & Filter
        document.getElementById('search-btn').addEventListener('click', () => this.handleSearch());
        document.getElementById('search-input').addEventListener('input', () => this.handleSearch());
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderGraphs();
        });

        // Graph Interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-graph-btn')) {
                e.preventDefault();
                const graphId = e.target.dataset.id;
                this.showGraphModal(graphId);
            }
        });
    }

    setupAuthModals() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });

        // Login form
        document.getElementById('login-email-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target[0].value;
            const password = e.target[1].value;
            
            const result = await authModule.signInWithEmail(email, password);
            if (result.success) {
                this.hideLoginModal();
            } else {
                alert('Login failed: ' + result.error);
            }
        });

        // Signup form
        document.getElementById('signup-email-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = e.target[0].value;
            const email = e.target[1].value;
            const password = e.target[2].value;
            
            const result = await authModule.signUpWithEmail(email, password, name);
            if (result.success) {
                alert('Account created! Please check your email for verification.');
                this.hideLoginModal();
            } else {
                alert('Signup failed: ' + result.error);
            }
        });

        // Google auth
        document.getElementById('google-login').addEventListener('click', async () => {
            const result = await authModule.signInWithGoogle();
            if (!result.success) {
                alert('Google sign-in failed: ' + result.error);
            }
        });

        document.getElementById('google-signup').addEventListener('click', async () => {
            const result = await authModule.signInWithGoogle();
            if (!result.success) {
                alert('Google sign-up failed: ' + result.error);
            }
        });

        // Password reset
        document.getElementById('forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthTab('reset');
        });

        document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target[0].value;
            const result = await authModule.resetPassword(email);
            if (result.success) {
                alert('Password reset email sent!');
                this.switchAuthTab('login');
            } else {
                alert('Error: ' + result.error);
            }
        });

        document.getElementById('back-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthTab('login');
        });
    }

    switchAuthTab(tabName) {
        // Hide all auth forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Show selected form
        document.getElementById(`${tabName}-form`).classList.add('active');
        
        // Update tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.auth-tab[data-tab="${tabName}"]`).classList.add('active');
    }

    async loadGraphs() {
        try {
            // This would be replaced with actual Firestore call
            this.graphs = await firestoreModule.getGraphs();
            this.renderGraphs();
            this.renderFilterChips();
        } catch (error) {
            console.error('Error loading graphs:', error);
            // Fallback to sample data
            this.loadSampleData();
        }
    }

    renderGraphs() {
        let filteredGraphs = this.filterGraphs();
        filteredGraphs = this.sortGraphs(filteredGraphs);
        
        const grid = document.getElementById('graph-grid');
        grid.innerHTML = filteredGraphs.map(graph => this.createGraphCard(graph)).join('');
    }

    filterGraphs() {
        let filtered = this.graphs;
        
        // Subject filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(graph => graph.subject === this.currentFilter);
        }
        
        // Search filter
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(graph => 
                graph.name.toLowerCase().includes(searchTerm) ||
                graph.description.toLowerCase().includes(searchTerm) ||
                graph.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        return filtered;
    }

    sortGraphs(graphs) {
        switch (this.currentSort) {
            case 'popular':
                return graphs.sort((a, b) => (b.views || 0) - (a.views || 0));
            case 'az':
                return graphs.sort((a, b) => a.name.localeCompare(b.name));
            case 'rating':
                return graphs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'newest':
            default:
                return graphs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    }

    createGraphCard(graph) {
        const isFavorite = this.favorites.has(graph.id);
        
        return `
            <div class="graph-card">
                <div class="graph-image">
                    ${graph.imageUrl ? 
                        `<img src="${graph.imageUrl}" alt="${graph.name}" loading="lazy">` : 
                        `<i class="fas fa-chart-line"></i>`
                    }
                    <div class="graph-badge">${graph.subject}</div>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="app.toggleFavorite('${graph.id}')">
                        <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="graph-content">
                    <h4 class="graph-title">${graph.name}</h4>
                    <p class="graph-description">${graph.description}</p>
                    <div class="graph-tags">
                        ${graph.tags.map(tag => `<span class="graph-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="graph-footer">
                        <div class="graph-stats">
                            <span class="graph-views">
                                <i class="fas fa-eye"></i> ${graph.views || 0}
                            </span>
                            <span class="graph-rating">
                                <i class="fas fa-star"></i> ${graph.rating || '0.0'}
                            </span>
                        </div>
                        <button class="btn view-graph-btn" data-id="${graph.id}">
                            View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async toggleFavorite(graphId) {
        if (!authModule.currentUser()) {
            this.showLoginModal();
            return;
        }
        
        if (this.favorites.has(graphId)) {
            this.favorites.delete(graphId);
            await firestoreModule.removeFavorite(graphId);
        } else {
            this.favorites.add(graphId);
            await firestoreModule.addFavorite(graphId);
        }
        
        this.renderGraphs();
    }

    async showGraphModal(graphId) {
        const graph = this.graphs.find(g => g.id === graphId);
        if (!graph) return;

        // Update modal content
        document.getElementById('modal-graph-title').textContent = graph.name;
        document.getElementById('modal-graph-description').textContent = graph.description;
        document.getElementById('modal-graph-subject').textContent = graph.subject;
        document.getElementById('modal-graph-views').textContent = `${graph.views || 0} views`;
        
        // Update image
        const img = document.getElementById('modal-graph-image');
        if (graph.imageUrl) {
            img.src = graph.imageUrl;
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
        
        // Update tags
        const tagsContainer = document.getElementById('modal-graph-tags');
        tagsContainer.innerHTML = graph.tags.map(tag => 
            `<span class="graph-tag">${tag}</span>`
        ).join('');
        
        // Update favorite button
        const favBtn = document.getElementById('favorite-graph');
        const isFavorite = this.favorites.has(graphId);
        favBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i> ${isFavorite ? 'Unfavorite' : 'Favorite'}`;
        favBtn.onclick = () => this.toggleFavorite(graphId);
        
        // Setup download
        document.getElementById('download-graph').onclick = () => this.downloadGraph(graph);
        
        // Load comments
        await this.loadComments(graphId);
        
        // Show modal
        document.getElementById('graph-modal').style.display = 'flex';
        
        // Increment view count
        await firestoreModule.incrementViewCount(graphId);
    }

    async loadComments(graphId) {
        const comments = await firestoreModule.getComments(graphId);
        const container = document.getElementById('comments-list');
        
        container.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.authorName}</span>
                    <span class="comment-time">${this.formatTime(comment.createdAt)}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('') || '<p>No comments yet. Be the first to comment!</p>';
        
        // Show comment form if user is logged in
        const form = document.getElementById('comment-form');
        form.style.display = authModule.currentUser() ? 'block' : 'none';
        
        form.onsubmit = async (e) => {
            e.preventDefault();
            const text = form.querySelector('textarea').value;
            if (text.trim()) {
                await firestoreModule.addComment(graphId, text);
                form.querySelector('textarea').value = '';
                await this.loadComments(graphId);
            }
        };
    }

    downloadGraph(graph) {
        if (graph.imageUrl) {
            const link = document.createElement('a');
            link.href = graph.imageUrl;
            link.download = `${graph.name.replace(/\s+/g, '_')}.jpg`;
            link.click();
        } else {
            alert('No image available for download');
        }
    }

    showUserInterface() {
        this.hideAllPages();
        document.getElementById('user-interface').style.display = 'block';
    }

    async showProfilePage() {
        if (!authModule.currentUser()) {
            this.showLoginModal();
            return;
        }
        
        this.hideAllPages();
        document.getElementById('profile-page').style.display = 'block';
        
        // Load user data
        const userData = await authModule.getCurrentUserData();
        if (userData) {
            document.getElementById('profile-name').textContent = userData.displayName;
            document.getElementById('profile-email').textContent = authModule.currentUser().email;
        }
        
        // Load user's graphs, favorites, and ratings
        await this.loadUserContent();
    }

    async showAdminPanel() {
        if (!authModule.currentUser()) {
            this.showLoginModal();
            return;
        }
        
        const isAdmin = await authModule.isUserAdmin();
        if (!isAdmin) {
            alert('Admin access required');
            return;
        }
        
        this.hideAllPages();
        document.getElementById('admin-panel').style.display = 'block';
        await this.loadAdminData();
    }

    hideAllPages() {
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
    }

    showLoginModal() {
        document.getElementById('login-modal').style.display = 'flex';
    }

    hideLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
        // Reset forms
        document.querySelectorAll('.auth-form form').forEach(form => form.reset());
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(() => console.log('SW Registered'))
                .catch(err => console.log('SW Registration Failed'));
        }
    }

    // Utility methods
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    loadSampleData() {
        // Fallback sample data
        this.graphs = [
            {
                id: '1',
                name: "Wave Interference",
                description: "Visualization of wave interference patterns",
                subject: "Physics",
                tags: ["waves", "interference", "physics"],
                imageUrl: "",
                views: 1247,
                rating: 4.5,
                createdAt: new Date()
            }
        ];
        this.renderGraphs();
    }

    handleSearch() {
        this.renderGraphs();
    }
}

// Initialize app
const app = new GraphzApp();
window.app = app;
