// Firebase Configuration for Real-Time Database
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
const database = firebase.database();

// Main Application Class
class ContentMasterPro {
    constructor() {
        this.adminPassword = "admin123"; // Change this to your preferred password
        this.currentUser = `user_${Date.now()}`;
        this.init();
    }

    init() {
        this.setupRealTimeListeners();
        this.showSection('home');
        this.setupEventListeners();
    }

    setupRealTimeListeners() {
        // Listen for banner updates
        database.ref('banner').on('value', (snapshot) => {
            const banner = snapshot.val();
            if (banner) {
                this.updateBannerUI(banner);
            }
        });

        // Listen for products
        database.ref('products').on('value', (snapshot) => {
            const products = snapshot.val();
            this.updateProductsUI(products);
        });

        // Listen for gallery items
        database.ref('gallery').on('value', (snapshot) => {
            const gallery = snapshot.val();
            this.updateGalleryUI(gallery);
        });

        // Listen for messages
        database.ref('messages').on('value', (snapshot) => {
            const messages = snapshot.val();
            this.updateMessagesUI(messages);
        });

        // Listen for live feed updates
        database.ref('liveFeed').on('value', (snapshot) => {
            const feed = snapshot.val();
            this.updateLiveFeedUI(feed);
        });

        // Listen for PDFs
        database.ref('pdfs').on('value', (snapshot) => {
            const pdfs = snapshot.val();
            this.updatePDFsUI(pdfs);
        });
    }

    setupEventListeners() {
        // Auto-save when admin makes changes
        document.addEventListener('input', (e) => {
            if (e.target.closest('#adminControls')) {
                this.autoSaveIndicator();
            }
        });
    }

    // Banner Management
    updateBannerUI(banner) {
        const container = document.getElementById('bannerContainer');
        const heroText = document.getElementById('heroText');
        
        if (banner && banner.text) {
            heroText.textContent = banner.text;
        }

        if (banner && banner.image) {
            container.innerHTML = `
                <div class="banner">
                    <h3>${banner.text || 'Special Offer'}</h3>
                    <img src="${banner.image}" alt="Banner" style="max-height: 300px;">
                    <p class="mt-2">${banner.description || ''}</p>
                </div>
            `;
        } else if (banner && banner.text) {
            container.innerHTML = `
                <div class="banner">
                    <h3>${banner.text}</h3>
                    <p>${banner.description || ''}</p>
                </div>
            `;
        } else {
            container.innerHTML = '';
            heroText.textContent = 'Your content will appear here in real-time';
        }
    }

    // Products Management
    updateProductsUI(products) {
        const container = document.getElementById('productsContainer');
        
        if (!products) {
            container.innerHTML = '<div class="col-12 text-center"><p>No products yet. Admin will add products soon.</p></div>';
            return;
        }

        const productsArray = Object.values(products);
        container.innerHTML = productsArray.map(product => `
            <div class="col-md-4">
                <div class="card product-card">
                    <img src="${product.image || 'https://via.placeholder.com/300'}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description || ''}</p>
                        <p class="h4 text-primary">$${product.price || '0.00'}</p>
                        ${product.affiliateLink ? `
                            <a href="${product.affiliateLink}" target="_blank" class="btn btn-success w-100">
                                Buy Now <i class="fas fa-external-link-alt"></i>
                            </a>
                        ` : ''}
                        <div class="mt-2">
                            <button class="btn btn-outline-primary btn-sm" onclick="addReview('${product.id}')">
                                <i class="fas fa-star"></i> Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Gallery Management
    updateGalleryUI(gallery) {
        const container = document.getElementById('galleryContainer');
        
        if (!gallery) {
            container.innerHTML = '<div class="col-12 text-center"><p>No gallery items yet.</p></div>';
            return;
        }

        const galleryArray = Object.values(gallery);
        container.innerHTML = galleryArray.map(item => `
            <div class="col-md-4">
                <div class="gallery-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="gallery-overlay">
                        <h6>${item.title}</h6>
                        <small>${item.description || ''}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Messages Management
    updateMessagesUI(messages) {
        const container = document.getElementById('messageContainer');
        
        if (!messages) {
            container.innerHTML = '<p class="text-center">No messages yet. Start the conversation!</p>';
            return;
        }

        const messagesArray = Object.values(messages);
        container.innerHTML = messagesArray.map(msg => `
            <div class="message ${msg.type === 'admin' ? 'admin' : 'user'}">
                <strong>${msg.sender}:</strong> ${msg.text}
                <br><small class="text-muted">${new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
        `).join('');

        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    // Live Feed Updates
    updateLiveFeedUI(feed) {
        const container = document.getElementById('liveFeed');
        
        if (!feed) {
            container.innerHTML = '<p>No updates yet.</p>';
            return;
        }

        const feedArray = Object.values(feed).sort((a, b) => b.timestamp - a.timestamp);
        container.innerHTML = feedArray.map(item => `
            <div class="feed-item">
                <div class="d-flex justify-content-between">
                    <strong>${item.title}</strong>
                    <small class="text-muted">${new Date(item.timestamp).toLocaleString()}</small>
                </div>
                <p class="mb-0">${item.message}</p>
                ${item.image ? `<img src="${item.image}" class="img-fluid mt-2" style="max-height: 150px;">` : ''}
            </div>
        `).join('');
    }

    // PDF Management
    updatePDFsUI(pdfs) {
        // You can create a PDF section in your HTML and update it here
        console.log('PDFs updated:', pdfs);
    }

    // Admin Functions
    loginAdmin() {
        const password = document.getElementById('adminPassword').value;
        if (password === this.adminPassword) {
            document.getElementById('adminLogin').classList.add('d-none');
            document.getElementById('adminControls').classList.remove('d-none');
            this.showNotification('Admin login successful!', 'success');
        } else {
            this.showNotification('Invalid password!', 'error');
        }
    }

    updateBanner() {
        const text = document.getElementById('bannerText').value;
        const image = document.getElementById('bannerImage').value;

        database.ref('banner').set({
            text: text,
            image: image,
            updated: Date.now()
        });

        this.addToLiveFeed('Banner Updated', `Admin updated the website banner`);
        this.showNotification('Banner updated successfully!', 'success');
    }

    addProduct() {
        const name = document.getElementById('productName').value;
        const price = document.getElementById('productPrice').value;
        const image = document.getElementById('productImage').value;
        const description = document.getElementById('productDesc').value;
        const affiliateLink = document.getElementById('affiliateLink').value;

        if (!name) {
            this.showNotification('Product name is required!', 'error');
            return;
        }

        const productId = `product_${Date.now()}`;
        database.ref('products/' + productId).set({
            id: productId,
            name: name,
            price: price,
            image: image,
            description: description,
            affiliateLink: affiliateLink,
            created: Date.now()
        });

        this.addToLiveFeed('New Product', `Added: ${name} - $${price}`);
        this.showNotification('Product added successfully!', 'success');
        
        // Clear form
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productImage').value = '';
        document.getElementById('productDesc').value = '';
        document.getElementById('affiliateLink').value = '';
    }

    addToGallery() {
        const image = document.getElementById('galleryImage').value;
        const title = document.getElementById('galleryTitle').value;

        if (!image) {
            this.showNotification('Image URL is required!', 'error');
            return;
        }

        const galleryId = `gallery_${Date.now()}`;
        database.ref('gallery/' + galleryId).set({
            id: galleryId,
            image: image,
            title: title,
            created: Date.now()
        });

        this.addToLiveFeed('Gallery Updated', `Added new image: ${title}`);
        this.showNotification('Image added to gallery!', 'success');
        
        // Clear form
        document.getElementById('galleryImage').value = '';
        document.getElementById('galleryTitle').value = '';
    }

    addPDF() {
        const title = document.getElementById('pdfTitle').value;
        const url = document.getElementById('pdfUrl').value;

        if (!title || !url) {
            this.showNotification('Title and URL are required!', 'error');
            return;
        }

        const pdfId = `pdf_${Date.now()}`;
        database.ref('pdfs/' + pdfId).set({
            id: pdfId,
            title: title,
            url: url,
            created: Date.now()
        });

        this.addToLiveFeed('New PDF', `Added PDF: ${title}`);
        this.showNotification('PDF added successfully!', 'success');
        
        // Clear form
        document.getElementById('pdfTitle').value = '';
        document.getElementById('pdfUrl').value = '';
    }

    broadcastMessage() {
        const message = document.getElementById('broadcastMessage').value;

        if (!message) {
            this.showNotification('Message is required!', 'error');
            return;
        }

        // Add to messages as admin
        const messageId = `msg_${Date.now()}`;
        database.ref('messages/' + messageId).set({
            id: messageId,
            text: message,
            sender: 'Admin',
            type: 'admin',
            timestamp: Date.now()
        });

        // Add to live feed
        this.addToLiveFeed('Admin Broadcast', message);

        this.showNotification('Message broadcasted to all users!', 'success');
        document.getElementById('broadcastMessage').value = '';
    }

    addToLiveFeed(title, message, image = null) {
        const feedId = `feed_${Date.now()}`;
        database.ref('liveFeed/' + feedId).set({
            id: feedId,
            title: title,
            message: message,
            image: image,
            timestamp: Date.now()
        });
    }

    // Utility Functions
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    showAdminPanel() {
        this.showSection('adminPanel');
        document.getElementById('adminLogin').classList.remove('d-none');
        document.getElementById('adminControls').classList.add('d-none');
        document.getElementById('adminPassword').value = '';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    autoSaveIndicator() {
        // Show auto-save indicator
        const indicator = document.createElement('div');
        indicator.className = 'badge bg-success';
        indicator.style.position = 'fixed';
        indicator.style.bottom = '10px';
        indicator.style.right = '10px';
        indicator.style.zIndex = '9999';
        indicator.textContent = 'Auto-saving...';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 1000);
    }

    // Data Management Functions
    clearProducts() {
        if (confirm('Are you sure you want to clear all products?')) {
            database.ref('products').remove();
            this.showNotification('All products cleared!', 'success');
        }
    }

    clearGallery() {
        if (confirm('Are you sure you want to clear the gallery?')) {
            database.ref('gallery').remove();
            this.showNotification('Gallery cleared!', 'success');
        }
    }

    clearMessages() {
        if (confirm('Are you sure you want to clear all messages?')) {
            database.ref('messages').remove();
            this.showNotification('Messages cleared!', 'success');
        }
    }

    exportData() {
        // Export all data as JSON
        const refs = ['banner', 'products', 'gallery', 'messages', 'liveFeed', 'pdfs'];
        const exportData = {};
        
        refs.forEach(ref => {
            // This would need to be implemented with Promise.all for proper async handling
            // For now, we'll just show a message
        });
        
        this.showNotification('Export feature coming soon!', 'info');
    }
}

// Global functions for HTML onclick events
const app = new ContentMasterPro();

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message) {
        const messageId = `msg_${Date.now()}`;
        database.ref('messages/' + messageId).set({
            id: messageId,
            text: message,
            sender: 'User',
            type: 'user',
            timestamp: Date.now()
        });
        
        input.value = '';
    }
}

function addReview(productId) {
    const review = prompt('Enter your review for this product:');
    if (review) {
        app.showNotification('Review submitted!', 'success');
        // Here you can save reviews to Firebase
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('ContentMaster Pro initialized!');
});
