// notification.js - COMPLETE NOTIFICATION SYSTEM FOR FATEHPUR HUBS
console.log("=== Fatehpur Hubs Notification System LOADING ===");

// IMMEDIATELY make functions available for script.js
window.sendDealNotification = function(dealData) {
    console.log("sendDealNotification called (early)", dealData);
    
    // Store data to send later when full system loads
    if (!window.pendingNotifications) window.pendingNotifications = [];
    window.pendingNotifications.push({
        type: 'deal',
        data: dealData,
        time: Date.now()
    });
    
    console.log("Deal notification queued, will send when system ready");
};

// Rest of your ORIGINAL code continues from here...
// VAPID Key
const vapidKey = "BEyN-5jhBHRlQBVYIODA3i7xIkWY1uJGGifqtkahlu9kR3I8O865mA-BqSTDcsaN5RjKUt6pu5u4-UYUHYTbjDQ";

// ================= BASIC NOTIFICATION FUNCTIONS =================
// ... rest of your original code ...
// notification.js - SIMPLE VERSION (NO ERRORS)
console.log("=== Simple Notification System ===");

// Basic notification functions
function enableNotifications() {
    console.log("Enable Notifications clicked");
    
    if (!("Notification" in window)) {
        alert("Browser notifications not supported!");
        return;
    }
    
    Notification.requestPermission().then(function(permission) {
        console.log("Permission result:", permission);
        
        if (permission === "granted") {
            alert("✅ Notifications enabled!");
            
            // Hide button
            const btn = document.getElementById('notif-btn');
            if (btn) btn.style.display = 'none';
            
            // Show test notification
            const notification = new Notification("Fatehpur Hubs", {
                body: "अब आपको नई सेवाओं और नौकरियों के अपडेट मिलेंगे!",
                icon: "https://www.fatehpurhubs.co.in/icons/icon-192x192.png"
            });
            
            // Save permission
            localStorage.setItem('notifications_enabled', 'true');
            
        } else if (permission === "denied") {
            alert("❌ Notifications blocked.");
        }
    });
}

// Create notification button
function createNotificationButton() {
    if (document.getElementById('notif-btn')) return;
    
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
    `;
    
    button.onclick = enableNotifications;
    document.body.appendChild(button);
    console.log("Notification button created");
}

// Initialize
function initNotificationSystem() {
    console.log("Initializing notification system...");
    
    if (!("Notification" in window)) {
        console.log("Browser doesn't support notifications");
        return;
    }
    
    if (Notification.permission === "default") {
        createNotificationButton();
    } else if (Notification.permission === "granted") {
        console.log("✅ Notifications already enabled");
    }
}

// Simple send notification functions
function sendDealNotification(dealData) {
    if (Notification.permission !== "granted") return;
    
    try {
        new Notification("🏪 नया डील ऑफर", {
            body: `${dealData.title || 'Offer'} - ${dealData.shopName || 'Shop'}`,
            icon: "https://www.fatehpurhubs.co.in/icons/icon-192x192.png"
        });
        console.log("Deal notification sent");
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

function sendServiceNotification(serviceData) {
    if (Notification.permission !== "granted") return;
    
    try {
        new Notification("🛠️ नई सेवा उपलब्ध", {
            body: `${serviceData.category || 'Service'} - ${serviceData.area || 'Fatehpur'} में`,
            icon: "https://www.fatehpurhubs.co.in/icons/icon-192x192.png"
        });
        console.log("Service notification sent");
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

function sendJobNotification(jobData) {
    if (Notification.permission !== "granted") return;
    
    try {
        new Notification("💼 नई जॉब उपलब्ध", {
            body: `${jobData.title || 'Job'} - ${jobData.shopName || 'Company'}`,
            icon: "https://www.fatehpurhubs.co.in/icons/icon-192x192.png"
        });
        console.log("Job notification sent");
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

// Start after page loads
setTimeout(initNotificationSystem, 2000);

// Make functions available
window.enableNotifications = enableNotifications;
window.sendDealNotification = sendDealNotification;
window.sendServiceNotification = sendServiceNotification;
window.sendJobNotification = sendJobNotification;

console.log("✅ Simple notification system loaded");
// ================= PROCESS PENDING NOTIFICATIONS =================

// After system loads, process any pending notifications
function processPendingNotifications() {
    console.log("Processing pending notifications...");
    
    if (window.pendingNotifications && window.pendingNotifications.length > 0) {
        console.log(`Found ${window.pendingNotifications.length} pending notifications`);
        
        window.pendingNotifications.forEach((item, index) => {
            if (item.type === 'deal') {
                // Use the actual sendDealNotification function
                setTimeout(() => {
                    console.log("Sending queued deal notification:", item.data);
                    
                    // Your actual notification sending code
                    if (Notification.permission === "granted") {
                        try {
                            new Notification("🏪 नया डील ऑफर", {
                                body: `${item.data.title || 'Offer'} - ${item.data.shopName || 'Shop'}`,
                                icon: "https://www.fatehpurhubs.co.in/icons/icon-192x192.png"
                            });
                            console.log("✅ Queued notification sent");
                        } catch (error) {
                            console.error("Error sending queued notification:", error);
                        }
                    }
                }, index * 1000); // Stagger them
            }
        });
        
        // Clear pending
        window.pendingNotifications = [];
    }
}

// Override the temporary sendDealNotification with real one
window.sendDealNotification = function(dealData) {
    console.log("sendDealNotification (real) called:", dealData);
    
    if (!("Notification" in window)) {
        console.log("Notifications not supported");
        return;
    }
    
    if (Notification.permission !== "granted") {
        console.log("Notification permission not granted");
        return;
    }
    
    try {
        const notification = new Notification("🏪 नया डील ऑफर", {
            body: `${dealData.title || 'Offer'} - ${dealData.shopName || 'Shop'} (${dealData.category || ''})`,
            icon: "https://www.fatehpurhubs.co.in/icons/icon-192x192.png"
        });
        
        console.log("✅ Deal notification sent successfully");
        return notification;
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

// Process any pending notifications after 3 seconds
setTimeout(processPendingNotifications, 3000);

// ================= DEBUGGING =================
console.log("✅ Notification system fully loaded!");
console.log("window.sendDealNotification:", typeof window.sendDealNotification);
console.log("Firebase messaging available:", typeof firebase !== 'undefined' && firebase.messaging ? 'Yes' : 'No');
