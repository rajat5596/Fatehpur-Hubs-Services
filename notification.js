// js/notification.js
console.log("🔔 notification.js loaded");

// VAPID Key - YAHI APNA KEY DALNA HAI
const vapidKey = "BEyN-5jhBHRlQBVYIODA3i7xIkWY1uJGGifqtkahlu9kR3I8O865mA-BqSTDcsaN5RjKUt6pu5u4-UYUHYTbjDQ";

// Simple notification permission request
function requestNotificationPermission() {
    console.log("Requesting notification permission...");
    
    if (!("Notification" in window)) {
        alert("This browser does not support notifications");
        return;
    }
    
    Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
            console.log("✅ Notification permission granted");
            showNotificationToast("Notifications enabled successfully!");
            
            // Button hide karo
            const btn = document.getElementById("notifyBtn");
            if (btn) btn.style.display = "none";
            
            // Firebase messaging setup karo
            setupFirebaseMessaging();
            
        } else {
            console.log("❌ Notification permission denied");
            showNotificationToast("Notifications blocked. Enable from browser settings.", "error");
        }
    }).catch(function(error) {
        console.error("Error requesting permission:", error);
    });
}

// Firebase messaging setup
function setupFirebaseMessaging() {
    try {
        if (typeof firebase === 'undefined') {
            console.log("Firebase not loaded yet");
            return;
        }
        
        console.log("Setting up Firebase messaging...");
        const messaging = firebase.messaging();
        
        // Get FCM token
        messaging.getToken({vapidKey: vapidKey}).then(function(currentToken) {
            if (currentToken) {
                console.log("FCM Token:", currentToken);
                
                // Token save karo database me
                saveTokenToDatabase(currentToken);
                
            } else {
                console.log("No registration token available");
            }
        }).catch(function(err) {
            console.log("Error getting token:", err);
        });
        
        // Foreground messages handle karo
        messaging.onMessage(function(payload) {
            console.log("Foreground message:", payload);
            showNotification(payload.notification);
        });
        
    } catch (error) {
        console.error("Firebase messaging error:", error);
    }
}

// Token database me save karo
function saveTokenToDatabase(token) {
    try {
        if (typeof firebase === 'undefined') return;
        
        const database = firebase.database();
        const userId = localStorage.getItem('userId') || 'anonymous_' + Date.now();
        
        // Token data
        const tokenData = {
            token: token,
            userId: userId,
            device: 'web',
            timestamp: Date.now(),
            userAgent: navigator.userAgent.substring(0, 100)
        };
        
        // Save to database
        database.ref('fcmTokens/' + userId.replace(/[.#$[\]]/g, '_')).set(tokenData)
            .then(function() {
                console.log("Token saved to database");
            })
            .catch(function(error) {
                console.error("Error saving token:", error);
            });
            
    } catch (error) {
        console.error("Error in saveTokenToDatabase:", error);
    }
}

// Show browser notification
function showNotification(notification) {
    if (Notification.permission !== "granted") return;
    
    const options = {
        body: notification.body || "New update available",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge.png",
        tag: 'fatehpur-notification'
    };
    
    const notif = new Notification(
        notification.title || "Fatehpur Hubs", 
        options
    );
    
    notif.onclick = function() {
        window.focus();
    };
}

// Toast message show karo
function showNotificationToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 60px;
        right: 10px;
        background: ${type === "success" ? "#4CAF50" : "#f44336"};
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.remove();
    }, 3000);
}

// Create notification enable button
function createNotificationButton() {
    // Check if already exists
    if (document.getElementById("notifyBtn")) return;
    
    // Check permission status
    if (Notification.permission !== "default") return;
    
    // Create button
    const button = document.createElement("button");
    button.id = "notifyBtn";
    button.innerHTML = "🔔 Enable Notifications";
    button.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4CAF50;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    button.onclick = requestNotificationPermission;
    document.body.appendChild(button);
    
    console.log("Notification button created");
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded - initializing notification system");
    
    // Check notification permission
    if (!("Notification" in window)) {
        console.log("Browser doesn't support notifications");
        return;
    }
    
    // Wait a bit then create button
    setTimeout(function() {
        createNotificationButton();
    }, 1000);
});

// Make functions available globally
window.requestNotificationPermission = requestNotificationPermission;
window.createNotificationButton = createNotificationButton;
window.showNotification = showNotification;

console.log("Notification module ready!");
