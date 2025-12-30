// notification.js - Fatehpur Hubs Push Notification System

console.log("=== Fatehpur Hubs Notification System Loaded ===");

// VAPID Key
const vapidKey = "BEyN-5jhBHRlQBVYIODA3i7xIkWY1uJGGifqtkahlu9kR3I8O865mA-BqSTDcsaN5RjKUt6pu5u4-UYUHYTbjDQ";

// Permission button banao
function createNotificationButton() {
    if (document.getElementById('notif-btn') || Notification.permission === 'granted') return;

    const btn = document.createElement('button');
    btn.id = 'notif-btn';
    btn.innerHTML = '🔔 नोटिफिकेशन चालू करें';
    btn.style.cssText = 'position:fixed;bottom:80px;right:10px;background:#4CAF50;color:white;border:none;padding:12px 18px;border-radius:50px;font-weight:bold;box-shadow:0 4px 10px rgba(0,0,0,0.2);z-index:9999;';
    btn.onclick = requestPermission;
    document.body.appendChild(btn);
}

// Permission maang aur token le
function requestPermission() {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            const btn = document.getElementById('notif-btn');
            if (btn) btn.remove();
            alert('✅ नोटिफिकेशन चालू हो गया!');

            const messaging = firebase.messaging();
            messaging.getToken({ vapidKey: vapidKey })
                .then((token) => {
                    if (token) {
                        saveToken(token);
                    }
                }).catch(err => {
                    console.error("Token error:", err);
                });
        }
    });
}

// Token Firebase mein save karo
function saveToken(token) {
    const db = firebase.database();
    const userId = localStorage.getItem('user_uid') || 'anonymous_' + Date.now();
    db.ref('fcm_tokens/' + userId).set({
        token: token,
        timestamp: Date.now(),
        userId: userId
    }).then(() => {
        console.log("Token saved in Firebase");
    }).catch(err => {
        console.error("Save error:", err);
    });
}

// App load hone par button dikhao
window.addEventListener('load', () => {
    setTimeout(createNotificationButton, 3000);
});

// Foreground notification (app open hone par)
firebase.messaging().onMessage((payload) => {
    console.log("Foreground notification:", payload);
    new Notification(payload.notification?.title || 'Fatehpur Hubs', {
        body: payload.notification?.body || 'Naya update!',
        icon: '/icons/icon-192x192.png'
    });
});

console.log("Notification.js ready");
