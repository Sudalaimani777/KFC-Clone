// Shopping Cart System for KFC Clone
// Manages cart items, localStorage persistence, and UI updates

class ShoppingCart {
    constructor() {
        this.cart = this.loadCartFromStorage();
        this.initializeEventListeners();
        this.updateCartUI();
    }

    // Load cart from localStorage
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('kfcCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage
    saveCartToStorage() {
        localStorage.setItem('kfcCart', JSON.stringify(this.cart));
    }

    // Add item to cart
    addToCart(id, name, price, image) {
        const existingItem = this.cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }
        
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification(`${name} added to cart!`);
    }

    // Remove item from cart
    removeFromCart(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification('Item removed from cart');
    }

    // Update item quantity
    updateQuantity(id, change) {
        const item = this.cart.find(item => item.id === id);
        
        if (item) {
            item.quantity += change;
            
            if (item.quantity <= 0) {
                this.removeFromCart(id);
            } else {
                this.saveCartToStorage();
                this.updateCartUI();
            }
        }
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get total items count
    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification('Cart cleared');
    }

    // Update all cart UI elements
    updateCartUI() {
        this.updateCartCounter();
        this.updateCartSidebar();
        this.updateCartTotal();
    }

    // Update cart counter in header
    updateCartCounter() {
        const cartCounters = document.querySelectorAll('.cart-count');
        const cartButtons = document.querySelectorAll('.cart-button-price');
        const count = this.getCartCount();
        const total = this.getCartTotal();
        
        cartCounters.forEach(counter => {
            counter.textContent = count;
            counter.style.display = count > 0 ? 'flex' : 'none';
        });

        cartButtons.forEach(button => {
            button.textContent = `₹${total}`;
        });
    }

    // Update cart sidebar content
    updateCartSidebar() {
        const cartItemsContainer = document.getElementById('cartItems');
        
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 text-center">
                    <svg class="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
                    <p class="text-gray-500 mb-6">Add some delicious items to get started!</p>
                    <a href="menu.html" class="bg-kfc-red text-white px-8 py-3 rounded-full hover:bg-red-700 transition font-medium">
                        Browse Menu
                    </a>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = this.cart.map(item => `
                <div class="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg">
                    <div class="flex-grow">
                        <h4 class="font-bold text-gray-800">${item.name}</h4>
                        <p class="text-kfc-red font-bold">₹${item.price}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="cart.updateQuantity('${item.id}', -1)" 
                                class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                            </svg>
                        </button>
                        <span class="w-8 text-center font-bold">${item.quantity}</span>
                        <button onclick="cart.updateQuantity('${item.id}', 1)" 
                                class="w-8 h-8 bg-kfc-red hover:bg-red-700 text-white rounded-full flex items-center justify-center transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                        </button>
                    </div>
                    <button onclick="cart.removeFromCart('${item.id}')" 
                            class="text-red-500 hover:text-red-700 transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            `).join('');
        }
    }

    // Update cart total display
    updateCartTotal() {
        const cartTotalElement = document.getElementById('cartTotal');
        const cartSubtotalElement = document.getElementById('cartSubtotal');
        const checkoutButton = document.getElementById('checkoutButton');
        
        const total = this.getCartTotal();
        const deliveryFee = total > 0 ? 40 : 0;
        const grandTotal = total + deliveryFee;
        
        if (cartTotalElement) {
            cartTotalElement.textContent = `₹${grandTotal}`;
        }
        
        if (cartSubtotalElement) {
            cartSubtotalElement.textContent = `₹${total}`;
        }

        if (checkoutButton) {
            checkoutButton.disabled = total === 0;
            checkoutButton.classList.toggle('opacity-50', total === 0);
            checkoutButton.classList.toggle('cursor-not-allowed', total === 0);
        }
    }

    // Toggle cart sidebar
    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            const isOpen = cartSidebar.classList.contains('translate-x-0');
            
            if (isOpen) {
                cartSidebar.classList.remove('translate-x-0');
                cartSidebar.classList.add('translate-x-full');
                cartOverlay.classList.add('hidden');
                document.body.style.overflow = 'auto';
            } else {
                cartSidebar.classList.remove('translate-x-full');
                cartSidebar.classList.add('translate-x-0');
                cartOverlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        }
    }

    // Show notification
    showNotification(message) {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slide-out 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.attachEventListeners();
            });
        } else {
            this.attachEventListeners();
        }
    }

    // Attach event listeners to buttons
    attachEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            const addButton = e.target.closest('.add-to-cart-btn');
            if (addButton) {
                e.preventDefault();
                const id = addButton.dataset.id;
                const name = addButton.dataset.name;
                const price = parseFloat(addButton.dataset.price);
                const image = addButton.dataset.image;
                this.addToCart(id, name, price, image);
            }
        });

        // Cart toggle buttons
        const cartToggleButtons = document.querySelectorAll('.cart-toggle');
        cartToggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCart();
            });
        });

        // Close cart overlay
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                this.toggleCart();
            });
        }

        // Checkout button
        const checkoutButton = document.getElementById('checkoutButton');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                if (this.cart.length > 0) {
                    // Check if auth system exists and user is  logged in
                    if (typeof auth !== 'undefined') {
                        if (!auth.isLoggedIn()) {
                            this.showNotification('Please sign in to place your order', 'error');
                            auth.showAuthModal('signin');
                            return;
                        }

                        // User is logged in, save order to history
                        const orderData = {
                            items: this.cart.map(item => ({...item})),
                            subtotal: this.getCartTotal(),
                            deliveryFee: 40,
                            total: this.getCartTotal() + 40
                        };

                        auth.addOrderToHistory(orderData);
                        
                        // Show success message
                        alert('Order placed successfully! 🍗\n\nOrder total: ₹' + orderData.total + '\n\nYou can view your order history in your profile.');
                        
                        // Clear cart
                        this.clearCart();
                        this.toggleCart();
                    } else {
                        // Fallback if auth not available
                        alert('Thank you for your order! 🍗\n\nOrder total: ₹' + (this.getCartTotal() + 40));
                        this.clearCart();
                    }
                }
            });
        }

        // Clear cart button
        const clearCartButton = document.getElementById('clearCartButton');
        if (clearCartButton) {
            clearCartButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear your cart?')) {
                    this.clearCart();
                }
            });
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slide-out {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .animate-slide-in {
        animation: slide-in 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Initialize cart
const cart = new ShoppingCart();
