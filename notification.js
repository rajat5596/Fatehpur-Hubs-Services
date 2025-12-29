
// notification.js - COMPLETE NOTIFICATION SYSTEM FOR FATEHPUR HUBS (v8.10.1)
console.log("=== Fatehpur Hubs Notification System ===");

// ================= BASIC NOTIFICATION FUNCTIONS =================
function enableNotifications() {
    console.log("Enable Notifications clicked");
    
    if (!("Notification" in window)) {
        alert("Browser notifications not supported!");
        return;
    }
    
    Notification.requestPermission().then(function(permission) {
        console.log("Permission result:", permission);
        
        if (permission === "granted") {
            alert("✅ Notifications enabled! Ab aapko nayi services aur jobs ki notification milegi.");
            
            // Hide button if exists
            const btn = document.getElementById('notif-btn');
            if (btn) btn.style.display = 'none';
            
            // Send test notification
            showNotification("Fatehpur Hubs", "अब आपको नई सेवाओं और नौकरियों के अपडेट मिलेंगे!");
            
            // Save permission
            localStorage.setItem('notifications_enabled', 'true');
            
            // Initialize Firebase Messaging after permission
            setTimeout(initializeFirebaseMessaging, 1000);
            
        } else if (permission === "denied") {
            alert("❌ Notifications blocked. Browser settings se allow karen.");
        }
    });
}

function showNotification(title, body) {
    if (Notification.permission === "granted") {
        try {
            const notification = new Notification(title, {
                body: body,
                icon: "https://www.fatehpurhubs.co.in/icons/icon-192x192.png"
            });
            
            notification.onclick = function() {
                window.focus();
                notification.close();
            };
            
            return notification;
        } catch (error) {
            console.error("Error showing notification:", error);
        }
    }
    return null;
}

function createNotificationButton() {
    // Check if button already exists
    if (document.getElementById('notif-btn')) {
        return;
    }
    
    // Create button
    const button = document.createElement('button');
    button.id = 'notif-btn';
    button.innerHTML = '🔔 नोटिफिकेशन चालू करें';
    button.style.cssText = `
        position: fixed;
        top: 60px;
        right: 10px;
        background: #4CAF50;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 99999;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: block;
    `;
    
    button.onclick = enableNotifications;
    document.body.appendChild(button);
    
    console.log("Notification button created");
}

function initNotificationSystem() {
    console.log("Initializing notification system...");
    
    if (!("Notification" in window)) {
        console.log("Browser doesn't support notifications");
        return;
    }
    
    const permission = Notification.permission;
    console.log("Current notification permission:", permission);
    
    if (permission === "default") {
        createNotificationButton();
    } else if (permission === "granted") {
        console.log("✅ Notifications already enabled");
        initializeFirebaseMessaging();
    }
}

// ================= FIREBASE CLOUD MESSAGING FUNCTIONS =================
function initializeFirebaseMessaging() {
    console.log("Initializing Firebase Messaging...");
    
    // Check if Firebase is loaded and messaging available
    if (typeof firebase === 'undefined') {
        console.error("Firebase not loaded");
        return;
    }
    
    if (!firebase.messaging || typeof firebase.messaging !== 'function') {
        console.error("Firebase messaging not available in v8.10.1");
        
        // Still show basic notifications
        showNotification("Fatehpur Hubs", "Basic notifications enabled!");
        return;
    }
    
    try {
        // For Firebase v8.10.1
        const messaging = firebase.messaging();
        
        // Get FCM token
        messaging.getToken().then((currentToken) => {
            if (currentToken) {
                console.log('✅ FCM Token obtained:', currentToken.substring(0, 20) + '...');
                
                // Save token to Firebase database
                saveFCMTokenToDatabase(currentToken);
                
                localStorage.setItem('fcm_token', currentToken);
            } else {
                console.log('No FCM token available');
            }
        }).catch((err) => {
            console.error('Error getting FCM token:', err);
        });
        
        // Handle foreground messages
        messaging.onMessage((payload) => {
            console.log('📨 Foreground message received:', payload);
            showNotification(
                payload.notification?.title || 'Fatehpur Hubs',
                payload.notification?.body || 'New update'
            );
        });
        
    } catch (error) {
        console.error('Error in initializeFirebaseMessaging:', error);
    }
}

function saveFCMTokenToDatabase(token) {
    try {
        const db = firebase.database();
        // Anonymous user ID banayenge
        let userId = localStorage.getItem('fcm_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('fcm_user_id', userId);
        }

        const tokenRef = db.ref('fcm_tokens/' + userId);

        tokenRef.set({
            token: token,
            device: navigator.userAgent.substring(0, 100), // device info
            lastSeen: Date.now()
        }).then(() => {
            console.log('✅ Token successfully saved to Firebase!');
        }).catch((error) => {
            console.error('❌ Token save failed:', error);
        });
    } catch (err) {
        console.error('Error in save function:', err);
    }
}

// Send notification to all users when new service is added
function sendServiceNotificationToAll(serviceData) {
    try {
        const db = firebase.database();
        const notificationRef = db.ref('notifications').push();
        
        const notificationData = {
            title: '🛠️ नई सेवा उपलब्ध',
            body: `${serviceData.category || 'Service'} - ${serviceData.area || 'Fatehpur'} में`,
            type: 'new_service',
            timestamp: Date.now()
        };
        
        notificationRef.set(notificationData);
        console.log('✅ Service notification saved to DB');
        
        // Also show local notification
        showNotification(notificationData.title, notificationData.body);
        
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Send notification to all users when new job is posted
function sendJobNotificationToAll(jobData) {
    try {
        const db = firebase.database();
        const notificationRef = db.ref('notifications').push();
        
        const notificationData = {
            title: '💼 नई जॉब उपलब्ध',
            body: `${jobData.title || 'Job'} - ${jobData.shopName || 'Company'} (${jobData.salary || 'Negotiable'})`,
            type: 'new_job',
            timestamp: Date.now()
        };
        
        notificationRef.set(notificationData);
        console.log('✅ Job notification saved to DB');
        
        // Also show local notification
        showNotification(notificationData.title, notificationData.body);
        
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// ================= BASIC NOTIFICATIONS FOR EXISTING FUNCTIONS =================
// Add notification to your existing save functions

// For Daily Deals
function sendDealNotification(dealData) {
    try {
        const db = firebase.database();
        const notificationRef = db.ref('notifications').push();
        
        const notificationData = {
            title: '🏪 नया डील ऑफर',
            body: `${dealData.title || 'Special Offer'} - ${dealData.shopName || 'Shop'}`,
            type: 'new_deal',
            timestamp: Date.now()
        };
        
        notificationRef.set(notificationData);
        console.log('✅ Deal notification saved to DB');
        
        // Also show local notification
        showNotification(notificationData.title, notificationData.body);
        
    } catch (error) {
        console.error('Error sending deal notification:', error);
    }
}

// ================= INITIALIZE EVERYTHING =================
// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationSystem);
} else {
    setTimeout(initNotificationSystem, 1000);
}

// Make functions available globally
window.enableNotifications = enableNotifications;
window.showNotification = showNotification;
window.sendServiceNotificationToAll = sendServiceNotificationToAll;
window.sendJobNotificationToAll = sendJobNotificationToAll;
window.sendDealNotification = sendDealNotification;

console.log("✅ Notification system loaded successfully (v8.10.1 compatible)");
