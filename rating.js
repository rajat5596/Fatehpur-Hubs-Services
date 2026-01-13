// rating.js - COMPLETE WORKING RATING SYSTEM (Fixed Popup)
console.log("⭐ Rating System Loaded - Perfect Version");

// ============ CORE RATING FUNCTIONS ============

// 1. GET PROVIDER PHONE FROM CARD
function getProviderPhoneFromCard(card) {
    // Try WhatsApp button
    const whatsappBtn = card.querySelector('button[onclick*="openWhatsApp"]');
    if (whatsappBtn) {
        const onclick = whatsappBtn.getAttribute('onclick') || '';
        const match = onclick.match(/openWhatsApp\('([^']+)'/);
        if (match && match[1]) {
            return match[1].replace(/\D/g, ''); // Sirf numbers
        }
    }
    
    // Try Call button
    const callBtn = card.querySelector('button[onclick*="tel:"]');
    if (callBtn) {
        const onclick = callBtn.getAttribute('onclick') || '';
        const match = onclick.match(/tel:([^']+)/);
        if (match && match[1]) {
            return match[1].replace(/\D/g, '');
        }
    }
    
    return null;
}

// 2. GET PROVIDER NAME FROM CARD
function getProviderNameFromCard(card) {
    const nameElement = card.querySelector('h4');
    if (nameElement) {
        let name = nameElement.textContent.split('-')[0].trim();
        name = name.replace(/'/g, '').replace(/"/g, '').substring(0, 30);
        return name;
    }
    return "Unknown Provider";
}

// 3. SUBMIT RATING
function submitRating(providerPhone, rating, providerName) {
    console.log("Submitting rating for:", providerPhone);
    
    if (!firebase.auth().currentUser) {
        alert("कृपया पहले लॉगिन करें");
        return;
    }
    
    const user = firebase.auth().currentUser;
    const userId = user.uid;
    const userName = user.displayName || localStorage.getItem('user_name') || 'User';
    
    const providerId = 'provider_' + providerPhone;
    
    const ratingData = {
        rating: rating,
        userName: userName,
        userId: userId,
        providerName: providerName,
        providerPhone: providerPhone,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
    };
    
    // Save to Firebase
    firebase.database().ref('ratings/' + providerId + '/' + userId).set(ratingData)
        .then(() => {
            console.log("✅ Rating saved");
            showSuccessMessage(`आपने ${providerName} को ${rating} ⭐ दिए`);
            
            // Update display immediately
            setTimeout(() => {
                loadRatingForProvider(providerPhone);
            }, 500);
        })
        .catch(error => {
            console.error("❌ Save error:", error);
            alert("Rating save नहीं हुई");
        });
}

// 4. LOAD RATING FOR PROVIDER
function loadRatingForProvider(providerPhone) {
    const providerId = 'provider_' + providerPhone;
    const ratingDiv = document.getElementById('rating-' + providerId);
    
    if (!ratingDiv) {
        console.log("Rating div not found");
        return;
    }
    
    // Show loading
    ratingDiv.innerHTML = '<span style="color:#ccc;">⏳</span>';
    
    firebase.database().ref('ratings/' + providerId).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                ratingDiv.innerHTML = '<span style="color:#999;">No ratings</span>';
                return;
            }
            
            let total = 0;
            let count = 0;
            
            snapshot.forEach(child => {
                const data = child.val();
                if (data.rating >= 1 && data.rating <= 5) {
                    total += data.rating;
                    count++;
                }
            });
            
            if (count === 0) {
                ratingDiv.innerHTML = '<span style="color:#999;">No ratings</span>';
                return;
            }
            
            const average = (total / count).toFixed(1);
            const stars = getStarsHTML(average);
            
            // Rating display WITHOUT CLICK - Simple display only
            ratingDiv.innerHTML = `
                <div style="display:flex; align-items:center; gap:5px;">
                    <div style="color:#ff9800; font-size:14px;">${stars}</div>
                    <span style="font-weight:bold; color:#333;">${average}</span>
                    <small style="color:#666; background:#f0f0f0; padding:1px 6px; border-radius:10px;">
                        ${count}
                    </small>
                </div>
            `;
            
            // Save locally as backup
            localStorage.setItem('rating_' + providerId, JSON.stringify({
                average: average,
                count: count,
                time: Date.now()
            }));
        })
        .catch(error => {
            console.error("Load error:", error);
            // Try local storage
            const localData = localStorage.getItem('rating_' + providerId);
            if (localData) {
                const data = JSON.parse(localData);
                const stars = getStarsHTML(data.average);
                ratingDiv.innerHTML = `
                    <div style="display:flex; align-items:center; gap:5px;">
                        <div style="color:#ff9800; font-size:14px;">${stars}</div>
                        <span style="font-weight:bold;">${data.average}</span>
                        <small style="color:#999;">(${data.count})</small>
                    </div>
                `;
            }
        });
}

// 5. SHOW ALL RATINGS (SIMPLE ALERT VERSION - NO POPUP ISSUE)
function showAllRatings(providerPhone) {
    const providerId = 'provider_' + providerPhone;
    
    // Show loading
    const ratingDiv = document.getElementById('rating-' + providerId);
    if (ratingDiv) {
        ratingDiv.innerHTML = '<span style="color:#999;">Loading...</span>';
    }
    
    firebase.database().ref('ratings/' + providerId).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                if (ratingDiv) {
                    ratingDiv.innerHTML = '<span style="color:#999;">No ratings</span>';
                }
                alert("📊 No ratings available yet");
                return;
            }
            
            let ratings = [];
            let total = 0;
            let count = 0;
            
            snapshot.forEach(child => {
                const r = child.val();
                ratings.push(r);
                total += r.rating;
                count++;
            });
            
            // Sort newest first
            ratings.sort((a, b) => b.timestamp - a.timestamp);
            
            // Create simple alert message
            let message = `⭐ ${count} Ratings\n`;
            message += `Average: ${(total/count).toFixed(1)}/5\n\n`;
            
            // Show last 3 ratings only
            const recent = ratings.slice(0, 3);
            recent.forEach(r => {
                const date = new Date(r.timestamp).toLocaleDateString('hi-IN');
                message += `${r.userName}: ${'★'.repeat(r.rating)}\n`;
                message += `${date}\n\n`;
            });
            
            if (ratings.length > 3) {
                message += `... and ${ratings.length - 3} more`;
            }
            
            // Show alert (NO MODAL, NO POPUP ISSUE)
            alert(message);
            
            // Update display
            if (ratingDiv) {
                const average = (total / count).toFixed(1);
                const stars = getStarsHTML(average);
                ratingDiv.innerHTML = `
                    <div style="display:flex; align-items:center; gap:5px;">
                        <div style="color:#ff9800; font-size:14px;">${stars}</div>
                        <span style="font-weight:bold; color:#333;">${average}</span>
                        <small style="color:#666; background:#f0f0f0; padding:1px 6px; border-radius:10px;">
                            ${count}
                        </small>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Could not load ratings");
        });
}

// 6. ADD RATING TO CARDS
function addRatingToCards() {
    const cards = document.querySelectorAll('.profile-card');
    
    cards.forEach((card, index) => {
        if (card.querySelector('.rating-section-added')) return;
        
        const phone = getProviderPhoneFromCard(card);
        const name = getProviderNameFromCard(card);
        
        if (!phone || phone.length < 10) return;
        
        const providerId = 'provider_' + phone;
        
        // Create rating section
        const ratingHTML = `
            <div class="rating-section-added" style="margin:10px 0; padding:10px; background:#f8f9fa; border-radius:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <small style="color:#666; font-weight:bold;">⭐ Rate this provider:</small>
                    <div id="rating-${providerId}" style="color:#ff9800; font-size:12px;">
                        Loading...
                    </div>
                </div>
                <div style="display:flex; gap:3px; justify-content:center;">
                    <button onclick="submitRating('${phone}', 1, '${name}')" 
                            style="background:#ffd700; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; flex:1;">
                        1★
                    </button>
                    <button onclick="submitRating('${phone}', 2, '${name}')" 
                            style="background:#ffd700; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; flex:1;">
                        2★
                    </button>
                    <button onclick="submitRating('${phone}', 3, '${name}')" 
                            style="background:#ffd700; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; flex:1;">
                        3★
                    </button>
                    <button onclick="submitRating('${phone}', 4, '${name}')" 
                            style="background:#ffd700; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; flex:1;">
                        4★
                    </button>
                    <button onclick="submitRating('${phone}', 5, '${name}')" 
                            style="background:#ffd700; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; flex:1;">
                        5★
                    </button>
                </div>
            </div>
        `;
        
        // Insert before buttons
        const buttonsDiv = card.querySelector('div[style*="display: flex; justify-content: space-between"]');
        if (buttonsDiv) {
            buttonsDiv.insertAdjacentHTML('beforebegin', ratingHTML);
        } else {
            card.insertAdjacentHTML('beforeend', ratingHTML);
        }
        
        // Load rating
        setTimeout(() => {
            loadRatingForProvider(phone);
        }, 800 + (index * 100));
    });
}

// 7. HELPER FUNCTIONS
function getStarsHTML(average) {
    const full = Math.floor(average);
    const half = (average % 1) >= 0.5;
    let stars = '';
    
    for (let i = 0; i < full; i++) stars += '★';
    if (half) stars += '½';
    for (let i = stars.length; i < 5; i++) stars += '☆';
    
    return stars;
}

function showSuccessMessage(text) {
    // Remove old messages
    document.querySelectorAll('.rating-success').forEach(el => el.remove());
    
    const msg = document.createElement('div');
    msg.className = 'rating-success';
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 99999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    `;
    msg.innerHTML = `<strong>✅</strong> ${text}`;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => msg.remove(), 300);
    }, 2000);
}

// 8. CLEANUP ANY STUCK MODALS
function cleanupStuckModals() {
    // Remove any modal elements
    const elements = document.querySelectorAll('.rating-modal, .rating-modal-overlay, .modal-backdrop');
    elements.forEach(el => el.remove());
    
    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
}

// 9. INITIALIZE
window.addEventListener('load', function() {
    console.log("🚀 Rating System Starting...");
    
    // Cleanup first
    cleanupStuckModals();
    
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .rating-section-added button {
            transition: all 0.2s;
        }
        .rating-section-added button:hover {
            background: #ffc107 !important;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
    
    // Start rating system
    setTimeout(addRatingToCards, 1000);
    
    // Check for new cards every 2 seconds
    setInterval(addRatingToCards, 2000);
    
    // Cleanup on screen changes
    if (typeof goHome === 'function') {
        const originalGoHome = goHome;
        window.goHome = function() {
            originalGoHome();
            setTimeout(() => {
                cleanupStuckModals();
                setTimeout(addRatingToCards, 500);
            }, 100);
        };
    }
});

// 10. GLOBAL FUNCTIONS
window.submitRating = submitRating;
window.loadRatingForProvider = loadRatingForProvider;
window.showAllRatings = showAllRatings;
window.addRatingToCards = addRatingToCards;
window.cleanupStuckModals = cleanupStuckModals;

console.log("✅ Rating System Ready!");
