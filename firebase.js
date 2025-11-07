// Firebase Configuration & Authentication
const firebaseConfig = {
    apiKey: "AIzaSyA84Ty4SNDuLMKzeHX1pJMUgjoFZ89nbRE",
    authDomain: "graphzlive.firebaseapp.com",
    projectId: "graphzlive",
    storageBucket: "graphzlive.firebasestorage.app",
    messagingSenderId: "521947472086",
    appId: "1:521947472086:web:b7795552c40bb58b0b2977"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();
const GoogleProvider = new firebase.auth.GoogleAuthProvider();

// Auth State Management
let currentUser = null;

// Auth State Listener
auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        // User is signed in
        handleUserSignedIn(user);
        
        // Check if email is verified
        if (!user.emailVerified) {
            showEmailVerificationNotice();
        }
        
        // Update user profile in Firestore
        updateUserProfile(user);
    } else {
        // User is signed out
        handleUserSignedOut();
    }
});

// Email/Password Sign Up
async function signUpWithEmail(email, password, displayName) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update profile
        await user.updateProfile({
            displayName: displayName
        });
        
        // Send email verification
        await user.sendEmailVerification();
        
        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            displayName: displayName,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: false,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Email/Password Sign In
async function signInWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update last login
        await db.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Google Sign In
async function signInWithGoogle() {
    try {
        const result = await auth.signInWithPopup(GoogleProvider);
        const user = result.user;
        
        // Check if user document exists
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create new user document
            await db.collection('users').doc(user.uid).set({
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                emailVerified: user.emailVerified,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update last login
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Password Reset
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign Out
async function signOut() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Update User Profile
async function updateUserProfile(user) {
    const userRef = db.collection('users').doc(user.uid);
    
    try {
        await userRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: user.emailVerified
        });
    } catch (error) {
        // User document might not exist, create it
        await userRef.set({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: user.emailVerified,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }
}

// Get Current User Data
async function getCurrentUserData() {
    if (!currentUser) return null;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Check if user is admin
async function isUserAdmin() {
    if (!currentUser) return false;
    
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        return userDoc.exists ? userDoc.data().isAdmin || false : false;
    } catch (error) {
        return false;
    }
}

// UI Handlers
function handleUserSignedIn(user) {
    // Update UI for logged in user
    const authButtons = document.getElementById('auth-buttons');
    authButtons.innerHTML = `
        <div class="user-menu">
            <span>Hi, ${user.displayName || user.email}</span>
            <div class="user-dropdown">
                <a href="#" id="nav-profile-link"><i class="fas fa-user"></i> Profile</a>
                <a href="#" id="nav-favorites-link"><i class="fas fa-star"></i> Favorites</a>
                <a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </div>
    `;
    
    // Show profile and favorites links
    document.getElementById('nav-profile').style.display = 'block';
    document.getElementById('nav-favorites').style.display = 'block';
    
    // Add event listeners
    document.getElementById('logout-link').addEventListener('click', signOut);
    document.getElementById('nav-profile-link').addEventListener('click', (e) => {
        e.preventDefault();
        showProfilePage();
    });
}

function handleUserSignedOut() {
    // Update UI for logged out user
    const authButtons = document.getElementById('auth-buttons');
    authButtons.innerHTML = `
        <a href="#" class="btn btn-outline" id="login-btn">
            <i class="fas fa-sign-in-alt"></i> Login
        </a>
    `;
    
    // Hide profile and favorites links
    document.getElementById('nav-profile').style.display = 'none';
    document.getElementById('nav-favorites').style.display = 'none';
    
    // Show login modal when login button is clicked
    document.getElementById('login-btn').addEventListener('click', showLoginModal);
}

function showEmailVerificationNotice() {
    // Show verification notice modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Verify Your Email</h3>
            <p>We've sent a verification link to your email address. Please check your inbox and verify your email to access all features.</p>
            <button class="btn" onclick="this.closest('.modal').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Export for use in other files
window.authModule = {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    signOut,
    getCurrentUserData,
    isUserAdmin,
    currentUser: () => currentUser
};
