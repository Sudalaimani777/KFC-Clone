// Authentication System for KFC Clone
// Manages user login, signup, profile, and favorites

class AuthSystem {
    constructor() {
        this.currentUser = this.loadCurrentUser();
        this.initializeEventListeners();
        this.updateAuthUI();
    }

    // Load current user from localStorage
    loadCurrentUser() {
        const user = localStorage.getItem('kfcCurrentUser');
        return user ? JSON.parse(user) : null;
    }

    // Save current user to localStorage
    saveCurrentUser(user) {
        if (user) {
            localStorage.setItem('kfcCurrentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('kfcCurrentUser');
        }
        this.currentUser = user;
    }

    // Get all users from localStorage
    getAllUsers() {
        const users = localStorage.getItem('kfcUsers');
        return users ? JSON.parse(users) : [];
    }

    // Save all users to localStorage
    saveAllUsers(users) {
        localStorage.setItem('kfcUsers', JSON.stringify(users));
    }

    // Sign up new user
    signUp(name, email, phone, password) {
        const users = this.getAllUsers();
        
        // Check if email already exists
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already registered!' };
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            phone: phone,
            password: password, // In production, this should be hashed
            favorites: [],
            orderHistory: [],
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveAllUsers(users);
        
        // Auto login after signup
        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;
        this.saveCurrentUser(userWithoutPassword);
        this.updateAuthUI();
        
        return { success: true, message: 'Account created successfully!' };
    }

    // Sign in existing user
    signIn(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            return { success: false, message: 'Invalid email or password!' };
        }

        // Login successful
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        this.saveCurrentUser(userWithoutPassword);
        this.updateAuthUI();
        
        return { success: true, message: 'Welcome back!' };
    }

    // Sign out current user
    signOut() {
        this.saveCurrentUser(null);
        this.updateAuthUI();
        window.location.href = 'index.html';
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Update user data
    updateUserData(updates) {
        if (!this.currentUser) return false;

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) return false;

        // Update user in users array
        users[userIndex] = { ...users[userIndex], ...updates };
        this.saveAllUsers(users);

        // Update current user
        const updatedUser = { ...users[userIndex] };
        delete updatedUser.password;
        this.saveCurrentUser(updatedUser);
        
        return true;
    }

    // Toggle favorite item
    toggleFavorite(itemId, itemData) {
        if (!this.isLoggedIn()) {
            this.showAuthModal('signin');
            return false;
        }

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) return false;

        const favoriteIndex = users[userIndex].favorites.findIndex(f => f.id === itemId);
        
        if (favoriteIndex > -1) {
            // Remove from favorites
            users[userIndex].favorites.splice(favoriteIndex, 1);
            this.saveAllUsers(users);
            this.currentUser.favorites = users[userIndex].favorites;
            this.saveCurrentUser(this.currentUser);
            return false; // Not favorited
        } else {
            // Add to favorites
            users[userIndex].favorites.push({
                id: itemId,
                ...itemData,
                addedAt: new Date().toISOString()
            });
            this.saveAllUsers(users);
            this.currentUser.favorites = users[userIndex].favorites;
            this.saveCurrentUser(this.currentUser);
            return true; // Favorited
        }
    }

    // Check if item is favorited
    isFavorited(itemId) {
        if (!this.isLoggedIn()) return false;
        return this.currentUser.favorites.some(f => f.id === itemId);
    }

    // Get user favorites
    getFavorites() {
        if (!this.isLoggedIn()) return [];
        return this.currentUser.favorites || [];
    }

    // Add order to history
    addOrderToHistory(order) {
        if (!this.isLoggedIn()) return false;

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) return false;

        const orderData = {
            id: 'order_' + Date.now(),
            ...order,
            date: new Date().toISOString(),
            status: 'Confirmed'
        };

        users[userIndex].orderHistory = users[userIndex].orderHistory || [];
        users[userIndex].orderHistory.unshift(orderData); // Add to beginning
        
        this.saveAllUsers(users);
        this.currentUser.orderHistory = users[userIndex].orderHistory;
        this.saveCurrentUser(this.currentUser);
        
        return true;
    }

    // Get order history
    getOrderHistory() {
        if (!this.isLoggedIn()) return [];
        return this.currentUser.orderHistory || [];
    }

    // Update auth UI elements
    updateAuthUI() {
        const signInButtons = document.querySelectorAll('.sign-in-button');
        const userMenus = document.querySelectorAll('.user-menu');
        const userNameElements = document.querySelectorAll('.user-name-display');

        if (this.isLoggedIn()) {
            // Hide sign in buttons, show user menu
            signInButtons.forEach(btn => btn.style.display = 'none');
            userMenus.forEach(menu => menu.style.display = 'flex');
            userNameElements.forEach(el => {
                el.textContent = this.currentUser.name.split(' ')[0];
            });
        } else {
            // Show sign in buttons, hide user menu
            signInButtons.forEach(btn => btn.style.display = 'flex');
            userMenus.forEach(menu => menu.style.display = 'none');
        }

        // Update favorites UI if on menu page
        this.updateFavoritesUI();
    }

    // Update favorites UI
    updateFavoritesUI() {
        const favoriteButtons = document.querySelectorAll('.favorite-button');
        favoriteButtons.forEach(btn => {
            const itemId = btn.dataset.itemId;
            const isFav = this.isFavorited(itemId);
            const heartIcon = btn.querySelector('.heart-icon');
            
            if (heartIcon) {
                if (isFav) {
                    heartIcon.classList.remove('text-gray-400');
                    heartIcon.classList.add('text-red-500', 'fill-current');
                } else {
                    heartIcon.classList.remove('text-red-500', 'fill-current');
                    heartIcon.classList.add('text-gray-400');
                }
            }
        });
    }

    // Show auth modal
    showAuthModal(mode = 'signin') {
        const modal = document.getElementById('authModal');
        const signinForm = document.getElementById('signinForm');
        const signupForm = document.getElementById('signupForm');

        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            if (mode === 'signin') {
                signinForm?.classList.remove('hidden');
                signupForm?.classList.add('hidden');
            } else {
                signinForm?.classList.add('hidden');
                signupForm?.classList.remove('hidden');
            }
        }
    }

    // Hide auth modal
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        const existingNotification = document.querySelector('.auth-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `auth-notification fixed top-24 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
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

    // Attach event listeners
    attachEventListeners() {
        // Sign in button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sign-in-button')) {
                e.preventDefault();
                this.showAuthModal('signin');
            }

            // Sign out button
            if (e.target.closest('.sign-out-button')) {
                e.preventDefault();
                this.signOut();
            }

            // Close modal
            if (e.target.closest('.close-auth-modal')) {
                e.preventDefault();
                this.hideAuthModal();
            }

            // Switch to signup form
            if (e.target.closest('.show-signup')) {
                e.preventDefault();
                this.showAuthModal('signup');
            }

            // Switch to signin form
            if (e.target.closest('.show-signin')) {
                e.preventDefault();
                this.showAuthModal('signin');
            }

            // Toggle favorite
            if (e.target.closest('.favorite-button')) {
                e.preventDefault();
                const btn = e.target.closest('.favorite-button');
                const itemId = btn.dataset.itemId;
                const itemName = btn.dataset.itemName;
                const itemPrice = btn.dataset.itemPrice;
                const itemImage = btn.dataset.itemImage;

                const isFav = this.toggleFavorite(itemId, {
                    name: itemName,
                    price: parseFloat(itemPrice),
                    image: itemImage
                });

                if (isFav !== false) {
                    this.showNotification(isFav ? 'Added to favorites!' : 'Removed from favorites!');
                    this.updateFavoritesUI();
                }
            }
        });

        // Sign in form submit
        const signinFormEl = document.getElementById('signinFormElement');
        if (signinFormEl) {
            signinFormEl.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('signinEmail').value;
                const password = document.getElementById('signinPassword').value;

                const result = this.signIn(email, password);
                this.showNotification(result.message, result.success ? 'success' : 'error');

                if (result.success) {
                    this.hideAuthModal();
                }
            });
        }

        // Sign up form submit
        const signupFormEl = document.getElementById('signupFormElement');
        if (signupFormEl) {
            signupFormEl.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('signupName').value;
                const email = document.getElementById('signupEmail').value;
                const phone = document.getElementById('signupPhone').value;
                const password = document.getElementById('signupPassword').value;

                const result = this.signUp(name, email, phone, password);
                this.showNotification(result.message, result.success ? 'success' : 'error');

                if (result.success) {
                    this.hideAuthModal();
                }
            });
        }

        // Close modal when clicking overlay
        const authModalOverlay = document.getElementById('authModalOverlay');
        if (authModalOverlay) {
            authModalOverlay.addEventListener('click', () => {
                this.hideAuthModal();
            });
        }
    }
}

// Initialize auth system
const auth = new AuthSystem();
