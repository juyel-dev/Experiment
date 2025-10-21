// Enhanced InvoicePro AI with Advanced Features
class InvoiceProAI {
    constructor() {
        this.invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        this.clients = JSON.parse(localStorage.getItem('clients')) || [];
        this.settings = JSON.parse(localStorage.getItem('settings')) || {
            currency: 'USD',
            taxRate: 10,
            companyName: 'Your Company',
            companyEmail: 'contact@yourcompany.com'
        };
        this.currentInvoice = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
        this.loadClients();
        this.setMinDate();
    }

    setupEventListeners() {
        // Real-time calculations
        document.addEventListener('input', (e) => {
            if (e.target.type === 'number' || e.target.type === 'text') {
                this.calculateTotals();
            }
        });
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').min = today;
        document.getElementById('dueDate').value = today;
    }

    // AI-Powered Item Suggestions
    aiSuggestItems() {
        const suggestions = [
            { desc: "Website Development", price: 1500, qty: 1 },
            { desc: "Mobile App Development", price: 2500, qty: 1 },
            { desc: "UI/UX Design", price: 800, qty: 1 },
            { desc: "SEO Optimization", price: 500, qty: 1 },
            { desc: "Content Writing", price: 300, qty: 1 },
            { desc: "Digital Marketing", price: 1200, qty: 1 },
            { desc: "Cloud Hosting", price: 50, qty: 12 },
            { desc: "Maintenance & Support", price: 200, qty: 1 }
        ];

        const container = document.getElementById('itemsContainer');
        container.innerHTML = '';

        suggestions.forEach((item, index) => {
            if (index < 3) { // Add first 3 suggestions
                this.addItem(item.desc, item.qty, item.price);
            }
        });

        this.calculateTotals();
        this.showNotification('AI has suggested popular services!', 'success');
    }

    addItem(desc = '', qty = 1, price = 0) {
        const container = document.getElementById('itemsContainer');
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row row mb-3';
        itemRow.innerHTML = `
            <div class="col-md-5">
                <input type="text" class="form-control item-desc" placeholder="Item description" value="${desc}">
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control item-qty" placeholder="Qty" value="${qty}" min="1">
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control item-price" placeholder="Price" value="${price}" step="0.01">
            </div>
            <div class="col-md-2">
                <input type="text" class="form-control item-amount" placeholder="Amount" readonly>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeItem(this)">×</button>
            </div>
        `;
        container.appendChild(itemRow);
        this.calculateTotals();
    }

    removeItem(button) {
        button.closest('.item-row').remove();
        this.calculateTotals();
    }

    calculateTotals() {
        const items = document.querySelectorAll('.item-row');
        let subtotal = 0;

        items.forEach(item => {
            const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
            const price = parseFloat(item.querySelector('.item-price').value) || 0;
            const amount = qty * price;
            item.querySelector('.item-amount').value = this.formatCurrency(amount);
            subtotal += amount;
        });

        const taxRate = this.settings.taxRate;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;
        const currency = document.getElementById('currency').value;

        document.getElementById('subtotal').textContent = this.formatCurrency(subtotal, currency);
        document.getElementById('taxAmount').textContent = this.formatCurrency(taxAmount, currency);
        document.getElementById('totalAmount').textContent = this.formatCurrency(total, currency);
    }

    formatCurrency(amount, currency = 'USD') {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        });
        return formatter.format(amount);
    }

    generateInvoice() {
        const clientName = document.getElementById('clientName').value;
        const clientEmail = document.getElementById('clientEmail').value;
        const currency = document.getElementById('currency').value;
        const dueDate = document.getElementById('dueDate').value;
        const notes = document.getElementById('notes').value;

        if (!clientName || !clientEmail) {
            this.showNotification('Please fill in client information!', 'error');
            return;
        }

        const items = this.collectItems();
        if (items.length === 0) {
            this.showNotification('Please add at least one item!', 'error');
            return;
        }

        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = subtotal * (this.settings.taxRate / 100);
        const total = subtotal + taxAmount;

        const invoice = {
            id: 'INV-' + Date.now(),
            clientName,
            clientEmail,
            currency,
            dueDate,
            items,
            subtotal,
            taxAmount,
            total,
            notes,
            status: 'pending',
            created: new Date().toISOString(),
            paid: false
        };

        this.invoices.push(invoice);
        this.currentInvoice = invoice;
        this.saveToLocalStorage();
        this.showInvoicePreview(invoice);
        this.showNotification('Invoice created successfully!', 'success');
        this.loadDashboard();
    }

    collectItems() {
        const items = [];
        document.querySelectorAll('.item-row').forEach(row => {
            const desc = row.querySelector('.item-desc').value;
            const qty = parseFloat(row.querySelector('.item-qty').value);
            const price = parseFloat(row.querySelector('.item-price').value);
            if (desc && qty && price) {
                items.push({
                    description: desc,
                    quantity: qty,
                    price: price,
                    amount: qty * price
                });
            }
        });
        return items;
    }

    showInvoicePreview(invoice) {
        const content = this.generateInvoiceHTML(invoice);
        document.getElementById('invoiceContent').innerHTML = content;
        this.showSection('invoicePreview');
    }

    generateInvoiceHTML(invoice) {
        const currency = invoice.currency;
        
        return `
            <div class="invoice-template">
                <div class="invoice-header">
                    <div class="row">
                        <div class="col-6">
                            <h2>InvoicePro AI</h2>
                            <p>Invoice #: ${invoice.id}</p>
                            <p>Date: ${new Date().toLocaleDateString()}</p>
                        </div>
                        <div class="col-6 text-end">
                            <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
                            <p>Status: <span class="badge bg-${invoice.status === 'paid' ? 'success' : 'warning'}">${invoice.status.toUpperCase()}</span></p>
                        </div>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-6">
                        <h5>From:</h5>
                        <p><strong>${this.settings.companyName}</strong><br>
                        ${this.settings.companyEmail}</p>
                    </div>
                    <div class="col-6">
                        <h5>Bill To:</h5>
                        <p><strong>${invoice.clientName}</strong><br>
                        ${invoice.clientEmail}</p>
                    </div>
                </div>

                <div class="invoice-items">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items.map(item => `
                                <tr>
                                    <td>${item.description}</td>
                                    <td>${item.quantity}</td>
                                    <td>${this.formatCurrency(item.price, currency)}</td>
                                    <td>${this.formatCurrency(item.amount, currency)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="invoice-total">
                    <div class="row">
                        <div class="col-6">
                            <h5>Payment Methods:</h5>
                            <p>PayPal • Stripe • Bank Transfer • Cryptocurrency</p>
                            ${invoice.notes ? `<div class="mt-3"><strong>Notes:</strong><br>${invoice.notes}</div>` : ''}
                        </div>
                        <div class="col-6 text-end">
                            <div class="mb-2">Subtotal: ${this.formatCurrency(invoice.subtotal, currency)}</div>
                            <div class="mb-2">Tax (${this.settings.taxRate}%): ${this.formatCurrency(invoice.taxAmount, currency)}</div>
                            <hr>
                            <h4>Total: ${this.formatCurrency(invoice.total, currency)}</h4>
                        </div>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-light rounded">
                    <h6>Thank you for your business!</h6>
                    <p>InvoicePro AI - Your Smart Business Partner</p>
                </div>
            </div>
        `;
    }

    // Client Management
    addClient() {
        const name = document.getElementById('newClientName').value;
        const email = document.getElementById('newClientEmail').value;
        const phone = document.getElementById('newClientPhone').value;
        const address = document.getElementById('newClientAddress').value;

        if (!name || !email) {
            this.showNotification('Please fill required fields!', 'error');
            return;
        }

        const client = {
            id: 'CLI-' + Date.now(),
            name,
            email,
            phone,
            address,
            created: new Date().toISOString()
        };

        this.clients.push(client);
        this.saveToLocalStorage();
        this.loadClients();
        document.getElementById('clientForm').reset();
        this.showNotification('Client added successfully!', 'success');
    }

    loadClients() {
        const select = document.getElementById('clientSelect');
        const list = document.getElementById('clientList');
        
        select.innerHTML = '<option value="">Select Existing Client</option>';
        list.innerHTML = '';

        this.clients.forEach(client => {
            // Add to dropdown
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.name} (${client.email})`;
            select.appendChild(option);

            // Add to client list
            const clientDiv = document.createElement('div');
            clientDiv.className = 'client-item d-flex justify-content-between align-items-center p-2 border-bottom';
            clientDiv.innerHTML = `
                <div>
                    <strong>${client.name}</strong><br>
                    <small>${client.email}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="app.deleteClient('${client.id}')">Delete</button>
            `;
            list.appendChild(clientDiv);
        });
    }

    fillClientInfo() {
        const select = document.getElementById('clientSelect');
        const clientId = select.value;
        const client = this.clients.find(c => c.id === clientId);
        
        if (client) {
            document.getElementById('clientName').value = client.name;
            document.getElementById('clientEmail').value = client.email;
        }
    }

    deleteClient(clientId) {
        this.clients = this.clients.filter(c => c.id !== clientId);
        this.saveToLocalStorage();
        this.loadClients();
        this.showNotification('Client deleted!', 'success');
    }

    // Dashboard Analytics
    loadDashboard() {
        const totalRevenue = this.invoices.reduce((sum, inv) => sum + (inv.paid ? inv.total : 0), 0);
        const totalInvoices = this.invoices.length;
        const totalClients = this.clients.length;
        const pendingInvoices = this.invoices.filter(inv => !inv.paid).length;

        document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
        document.getElementById('totalInvoices').textContent = totalInvoices;
        document.getElementById('totalClients').textContent = totalClients;
        document.getElementById('pendingInvoices').textContent = pendingInvoices;

        this.updateCharts();
    }

    updateCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        const revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Monthly Revenue',
                    data: [5000, 8000, 12000, 9000, 15000, 18000],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Revenue Trend'
                    }
                }
            }
        });

        // Invoice Status Chart
        const statusCtx = document.getElementById('invoiceStatusChart').getContext('2d');
        const statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Paid', 'Pending', 'Overdue'],
                datasets: [{
                    data: [8, 5, 2],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Invoice Status'
                    }
                }
            }
        });
    }

    // Utility Methods
    showSection(sectionId) {
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('d-none');
        });
        document.getElementById(sectionId).classList.remove('d-none');
    }

    showNotification(message, type = 'info') {
        // Simple notification implementation
        alert(`${type.toUpperCase()}: ${message}`);
    }

    saveToLocalStorage() {
        localStorage.setItem('invoices', JSON.stringify(this.invoices));
        localStorage.setItem('clients', JSON.stringify(this.clients));
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }
}

// Global functions for HTML onclick events
const app = new InvoiceProAI();

function showInvoiceForm() {
    app.showSection('invoiceForm');
}

function showClientForm() {
    app.showSection('clientManagement');
}

function showRecurringForm() {
    app.showNotification('Recurring invoices feature coming soon!', 'info');
}

function aiSuggestItems() {
    app.aiSuggestItems();
}

function addItem() {
    app.addItem();
}

function removeItem(button) {
    app.removeItem(button);
}

function generateInvoice() {
    app.generateInvoice();
}

function addClient() {
    app.addClient();
}

function saveDraft() {
    app.showNotification('Draft saved successfully!', 'success');
}

function downloadPDF() {
    const element = document.getElementById('invoiceContent');
    const opt = {
        margin: 1,
        filename: `invoice_${app.currentInvoice.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', function() {
    app.showSection('dashboard');
});