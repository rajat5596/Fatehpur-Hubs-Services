// notification.js - COMPLETE NOTIFICATION SYSTEM
console.log("=== Fatehpur Hubs Notification System ===");

// VAPID Key - Tumhara key
const vapidKey = "BEyN-5jhBHRlQBVYIODA3i7xIkWY1uJGGifqtkahlu9kR3I8O865mA-BqSTDcsaN5RjKUt6pu5u4-UYUHYTbjDQ";

// Step 1: Simple notification function
function enableNotifications() {
    console.log("Enable Notifications clicked");
    
    if (!("Notification" in window)) {
        alert("Browser notifications not supported!");
        return;
    }
    
    // Request permission
    Notification.requestPermission().then(function(permission) {
        console.log("Permission result:", permission);
        
        if (permission === "granted") {
            alert("✅ Notifications enabled! Ab aapko nayi services aur jobs ki notification milegi.");
            
            // Hide button if exists
            const btn = document.getElementById('notif-btn');
            if (btn) btn.style.display = 'none';
            
            // Send test notification
            showNotification("Fatehpur Hubs", "अब आपको नई सेवाओं और नौकरियों के अपडेट मिलेंगे!");
            
            // Save permission in localStorage
            localStorage.setItem('notifications_enabled', 'true');
            
        } else if (permission === "denied") {
            alert("❌ Notifications blocked. Browser settings se allow karen.");
        }
    });
}

// Step 2: Show notification function
function showNotification(title, body) {
    if (Notification.permission === "granted") {
        try {
            const notification = new Notification(title, {
                body: body,
                icon: "https://www.fatehpurhubs.co.in/icons/icon-192x192.png",
                badge: "https://www.fatehpurhubs.co.in/icons/badge.png"
            });
            
            notification.onclick = function() {
                window.focus();
                notification.close();
            };
            
            return notification;
        } catch (error) {
            console.error("Error showing notification:", error);
            // Fallback to alert
            alert(title + ": " + body);
        }
    }
    return null;
}

// Step 3: Create notification button on page load
function initNotificationSystem() {
    console.log("Initializing notification system...");
    
    // Check browser support
    if (!("Notification" in window)) {
        console.log("Browser doesn't support notifications");
        return;
    }
    
    const permission = Notification.permission;
    console.log("Current notification permission:", permission);
    
    // If permission not asked yet, show button
    if (permission === "default") {
        createNotificationButton();
    } 
    // If already granted, show success message
    else if (permission === "granted") {
        console.log("✅ Notifications already enabled");
        
        // Check if we should show welcome notification
        if (!localStorage.getItem('notifications_welcome_shown')) {
            setTimeout(() => {
                showNotification("Fatehpur Hubs", "आपका स्वागत है! नई सेवाएं और नौकरियों के अपडेट आपको मिलेंगे।");
            }, 2000);
            localStorage.setItem('notifications_welcome_shown', 'true');
        }
    }
}

// Step 4: Create notification button
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
    
    console.log("Notification button created at top-right corner");
}

// Step 5: Send notification for new service/job (Firebase integration)
function sendNewServiceNotification(serviceData) {
    if (Notification.permission !== "granted") return;
    
    const title = "🛠️ नई सेवा उपलब्ध";
    const body = `${serviceData.category} - ${serviceData.area} में`;
    
    showNotification(title, body);
    
    // Also send to Firebase for other users (optional)
    if (typeof firebase !== 'undefined' && firebase.database) {
        const db = firebase.database();
        db.ref('notifications').push({
            title: title,
            body: body,
            type: 'new_service',
            timestamp: Date.now(),
            serviceId: serviceData.id
        });
    }
}

function sendNewJobNotification(jobData) {
    if (Notification.permission !== "granted") return;
    
    const title = "💼 नई जॉब उपलब्ध";
    const body = `${jobData.title} - ${jobData.salary} वेतन`;
    
    showNotification(title, body);
    
    // Also send to Firebase for other users (optional)
    if (typeof firebase !== 'undefined' && firebase.database) {
        const db = firebase.database();
        db.ref('notifications').push({
            title: title,
            body: body,
            type: 'new_job',
            timestamp: Date.now(),
            jobId: jobData.id
        });
    }
}

// Step 6: Integrate with your existing service/job registration
// Override your existing registerService function
const originalRegisterService = window.registerService;
if (originalRegisterService) {
    window.registerService = function() {
        const result = originalRegisterService.apply(this, arguments);
        
        // If service registration successful, send notification
        setTimeout(() => {
            const serviceData = {
                category: document.getElementById('serviceCategory')?.value,
                area: document.getElementById('providerArea')?.value,
                id: Date.now().toString()
            };
            sendNewServiceNotification(serviceData);
        }, 1000);
        
        return result;
    };
}

// Override your existing registerJob function
const originalRegisterJob = window.registerJob;
if (originalRegisterJob) {
    window.registerJob = function() {
        const result = originalRegisterJob.apply(this, arguments);
        
        // If job registration successful, send notification
        setTimeout(() => {
            const jobData = {
                title: document.getElementById('jobTitle')?.value,
                salary: document.getElementById('jobSalary')?.value,
                id: Date.now().toString()
            };
            sendNewJobNotification(jobData);
        }, 1000);
        
        return result;
    };
}

// Step 7: Initialize when page loads
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded - starting notification system");
    
    // Wait a bit for page to fully load
    setTimeout(initNotificationSystem, 1000);
    
    // Also add test button for debugging
    addTestButton();
});

// Step 8: Add test button for debugging
function addTestButton() {
    // Only add in development/debugging
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('vercel')) {
        const testBtn = document.createElement('button');
        testBtn.innerHTML = '🔔 Test Notification';
        testBtn.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 10px;
            background: #2196F3;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            z-index: 99999;
        `;
        testBtn.onclick = function() {
            showNotification("Test Notification", "यह टेस्ट नोटिफिकेशन है!");
        };
        document.body.appendChild(testBtn);
    }
}

// Step 9: Make functions available globally
window.enableNotifications = enableNotifications;
window.showNotification = showNotification;
window.initNotificationSystem = initNotificationSystem;

console.log("✅ Notification system code loaded successfully!");
// ================= FIREBASE CLOUD MESSAGING SETUP =================
// Add this to your existing notification.js file

function initializeFirebaseMessaging() {
    console.log("Initializing Firebase Messaging...");
    
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined' || !firebase.messaging) {
        console.error("Firebase messaging not available");
        return;
    }
    
    try {
        const messaging = firebase.messaging();
        const vapidKey = "BEyN-5jhBHRlQBVYIODA3i7xIkWY1uJGGifqtkahlu9kR3I8O865mA-BqSTDcsaN5RjKUt6pu5u4-UYUHYTbjDQ";
        
        // Get FCM token
        messaging.getToken({ vapidKey: vapidKey }).then((currentToken) => {
            if (currentToken) {
                console.log('FCM Token obtained:', currentToken.substring(0, 20) + '...');
                
                // Save token to Firebase database
                saveFCMTokenToDatabase(currentToken);
                
                localStorage.setItem('fcm_token', currentToken);
                console.log('✅ FCM Token saved');
            } else {
                console.log('No FCM token available');
            }
        }).catch((err) => {
            console.error('Error getting FCM token:', err);
        });
        
        // Handle foreground messages
        messaging.onMessage((payload) => {
            console.log('Foreground message:', payload);
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
        const userId = localStorage.getItem('user_uid') || 'anonymous_' + Date.now();
        const db = firebase.database();
        const tokenRef = db.ref('fcm_tokens/' + userId);
        
        const tokenData = {
            token: token,
            userId: userId,
            timestamp: Date.now()
        };
        
        tokenRef.set(tokenData);
        console.log('Token saved to Firebase');
    } catch (error) {
        console.error('Error saving token:', error);
    }
}

// Send notification to all users
function sendServiceNotificationToAll(serviceData) {
    try {
        const db = firebase.database();
        const notificationRef = db.ref('notifications').push();
        
        const notificationData = {
            title: '🛠️ नई सेवा उपलब्ध',
            body: `${serviceData.category} - ${serviceData.area} में`,
            type: 'new_service',
            timestamp: Date.now()
        };
        
        notificationRef.set(notificationData);
        console.log('Service notification saved to DB');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

function sendJobNotificationToAll(jobData) {
    try {
        const db = firebase.database();
        const notificationRef = db.ref('notifications').push();
        
        const notificationData = {
            title: '💼 नई जॉब उपलब्ध',
            body: `${jobData.title} - ${jobData.shopName} (${jobData.salary})`,
            type: 'new_job',
            timestamp: Date.now()
        };
        
        notificationRef.set(notificationData);
        console.log('Job notification saved to DB');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Initialize when Firebase is ready
setTimeout(() => {
    if (typeof firebase !== 'undefined' && firebase.messaging) {
        initializeFirebaseMessaging();
    }
}, 5000);
