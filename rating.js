// rating.js - FIXED PERMANENT RATING SYSTEM
console.log("⭐ Rating System Loaded - Permanent Fix");

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

// 3. SUBMIT RATING (FIXED - Permanent save)
function submitRating(providerPhone, rating, providerName) {
    console.log("Submitting rating for phone:", providerPhone);
    
    if (!firebase.auth().currentUser) {
        alert("कृपया पहले लॉगिन करें");
        return;
    }
    
    const user = firebase.auth().currentUser;
    const userId = user.uid;
    const userName = user.displayName || localStorage.getItem('user_name') || 'User';
    
    // ✅ FIXED: Create proper provider ID
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
    
    console.log("Saving rating for providerId:", providerId);
    
    // ✅ FIXED: Use correct Firebase path
    const db = firebase.database();
    
    // Save rating under provider
    db.ref('ratings/' + providerId + '/' + userId).set(ratingData)
        .then(() => {
            console.log("✅ Rating saved permanently");
            showSuccessMessage(`आपने ${providerName} को ${rating} ⭐ दिए`);
            
            // Immediately update display
            const ratingDiv = document.getElementById('rating-' + providerId);
            if (ratingDiv) {
                loadRatingForProvider(providerPhone);
            }
        })
        .catch(error => {
            console.error("❌ Save error:", error);
            alert("Rating save नहीं हुई: " + error.message);
        });
}

// 4. LOAD RATING (FIXED - Always show saved ratings)
function loadRatingForProvider(providerPhone) {
    const providerId = 'provider_' + providerPhone;
    const ratingDiv = document.getElementById('rating-' + providerId);
    
    if (!ratingDiv) {
        console.log("Rating div not found for:", providerId);
        return;
    }
    
    // Show loading
    ratingDiv.innerHTML = '<span style="color:#ccc; font-size:12px;">⏳ Loading...</span>';
    
    firebase.database().ref('ratings/' + providerId).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                ratingDiv.innerHTML = '<span style="color:#999; font-size:12px;">No ratings yet</span>';
                return;
            }
            
            // Calculate statistics
            let total = 0;
            let count = 0;
            let ratings = [];
            
            snapshot.forEach(child => {
                const data = child.val();
                if (data.rating && data.rating >= 1 && data.rating <= 5) {
                    total += data.rating;
                    count++;
                    ratings.push(data);
                }
            });
            
            if (count === 0) {
                ratingDiv.innerHTML = '<span style="color:#999; font-size:12px;">No ratings yet</span>';
                return;
            }
            
            const average = (total / count).toFixed(1);
            const stars = getStarsHTML(average);
            
            // ✅ PERMANENT DISPLAY - Refresh hone par bhi rahega
            ratingDiv.innerHTML = `
                <div onclick="showAllRatings('${providerPhone}')" 
                     style="cursor:pointer; display:flex; align-items:center; gap:5px;">
                    <div style="color:#ff9800; font-size:14px;">${stars}</div>
                    <span style="font-weight:bold; color:#333;">${average}</span>
                    <span style="color:#666; font-size:11px; background:#f0f0f0; padding:1px 6px; border-radius:10px;">
                        ${count} ratings
                    </span>
                </div>
            `;
            
            // Also save to local storage as backup
            localStorage.setItem('rating_' + providerId, JSON.stringify({
                average: average,
                count: count,
                lastUpdated: Date.now()
            }));
        })
        .catch(error => {
            console.error("Load error:", error);
            
            // Try local storage backup
            const localData = localStorage.getItem('rating_' + providerId);
            if (localData) {
                const data = JSON.parse(localData);
                ratingDiv.innerHTML = `
                    <div style="display:flex; align-items:center; gap:5px;">
                        <div style="color:#ff9800; font-size:14px;">${getStarsHTML(data.average)}</div>
                        <span style="font-weight:bold;">${data.average}</span>
                        <small style="color:#999;">(${data.count})</small>
                    </div>
                `;
            }
        });
}

// 5. SHOW ALL RATINGS
function showAllRatings(providerPhone) {
    const providerId = 'provider_' + providerPhone;
    
    firebase.database().ref('ratings/' + providerId).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                alert("No ratings available");
                return;
            }
            
            let html = `
                <div style="max-height:400px; overflow-y:auto; padding:10px;">
                    <h4 style="color:#2a5298; margin-bottom:15px; text-align:center;">
                        ⭐ All Ratings
                    </h4>
            `;
            
            let ratings = [];
            snapshot.forEach(child => {
                ratings.push(child.val());
            });
            
            // Sort by newest first
            ratings.sort((a, b) => b.timestamp - a.timestamp);
            
            if (ratings.length === 0) {
                html += '<p style="text-align:center; color:#666;">No ratings yet</p>';
            } else {
                ratings.forEach(r => {
                    const date = new Date(r.timestamp).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });
                    
                    html += `
                        <div style="border-bottom:1px solid #eee; padding:8px 0; margin:5px 0;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="color:#333;">${r.userName}</strong>
                                <span style="color:#ff9800; font-size:16px;">${'★'.repeat(r.rating)}</span>
                            </div>
                            <div style="color:#666; font-size:12px; margin-top:3px;">
                                📅 ${date}
                            </div>
                        </div>
                    `;
                });
            }
            
            html += '</div>';
            
            // Show modal
            showModal('All Ratings', html);
        });
}

// 6. ADD RATING SECTION TO CARDS (FIXED)
function addRatingToCards() {
    const cards = document.querySelectorAll('.profile-card');
    
    cards.forEach((card, index) => {
        // Skip if already has rating section
        if (card.querySelector('.rating-section-permanent')) return;
        
        const phone = getProviderPhoneFromCard(card);
        const name = getProviderNameFromCard(card);
        
        if (!phone || phone.length < 10) {
            console.log("Invalid phone for card", index);
            return;
        }
        
        const providerId = 'provider_' + phone;
        
        // Create rating section
        const ratingHTML = `
            <div class="rating-section-permanent" style="margin:12px 0; padding:10px; background:#f8f9fa; border-radius:8px; border:1px solid #e0e0e0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <small style="color:#666; font-weight:bold;">⭐ इस प्रोवाइडर को रेट करें:</small>
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
        
        // Load rating after 1 second
        setTimeout(() => {
            loadRatingForProvider(phone);
        }, 1000 + (index * 200)); // Staggered loading
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
    // Remove existing messages
    document.querySelectorAll('.rating-success-msg').forEach(el => el.remove());
    
    const msg = document.createElement('div');
    msg.className = 'rating-success-msg';
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 18px;
        border-radius: 8px;
        z-index: 99999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 300px;
    `;
    msg.innerHTML = `<strong>✅ Success!</strong><br>${text}`;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => msg.remove(), 300);
    }, 3000);
}

function showModal(title, content) {
    // Remove existing modal
    document.querySelectorAll('.rating-modal').forEach(el => el.remove());
    
    const modal = document.createElement('div');
    modal.className = 'rating-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 100000;
        width: 90%;
        max-width: 450px;
        max-height: 80vh;
        overflow: hidden;
    `;
    
    modal.innerHTML = `
        <div style="margin-bottom:15px;">
            <h3 style="color:#2a5298; margin:0; text-align:center;">${title}</h3>
        </div>
        ${content}
        <div style="text-align:center; margin-top:20px; padding-top:15px; border-top:1px solid #eee;">
            <button onclick="this.closest('.rating-modal').remove()" 
                    style="background:#2a5298; color:white; border:none; padding:10px 25px; border-radius:6px; cursor:pointer; font-weight:bold;">
                Close
            </button>
        </div>
    `;
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 99999;
    `;
    overlay.onclick = () => {
        modal.remove();
        overlay.remove();
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}

// 8. INITIALIZE
window.addEventListener('load', function() {
    console.log("🚀 Initializing Permanent Rating System");
    
    // Add CSS animations
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
        .rating-section-permanent button {
            transition: all 0.2s;
        }
        .rating-section-permanent button:hover {
            background: #ffc107 !important;
            transform: scale(1.05);
        }
        .rating-section-permanent button:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);
    
    // Run rating system
    setTimeout(addRatingToCards, 1500);
    
    // Check every 3 seconds for new cards
    setInterval(addRatingToCards, 3000);
    
    // Also run when screen changes
    if (typeof goHome === 'function') {
        const originalGoHome = goHome;
        window.goHome = function() {
            originalGoHome();
            setTimeout(addRatingToCards, 1000);
        };
    }
});

// 9. GLOBAL FUNCTIONS
window.submitRating = submitRating;
window.loadRatingForProvider = loadRatingForProvider;
window.showAllRatings = showAllRatings;
window.addRatingToCards = addRatingToCards;

console.log("✅ Permanent Rating System Ready!");
// rating.js - FIXED POPUP CLOSE ISSUE
console.log("⭐ Rating System Loaded - Fixed Popup");

// ============ FIXED MODAL FUNCTIONS ============

// SHOW MODAL (FIXED CLOSE ISSUE)
function showModal(title, content) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.rating-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'rating-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 99998;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'rating-modal';
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        width: 100%;
        max-width: 450px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: modalFadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color:#2a5298; margin:0;">${title}</h3>
                <button onclick="closeModal()" 
                        style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    ✕
                </button>
            </div>
            <div style="max-height: 60vh; overflow-y: auto; padding-right: 5px;">
                ${content}
            </div>
            <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
                <button onclick="closeModal()" 
                        style="background: #2a5298; color: white; border: none; padding: 10px 25px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    // Append to body
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close on overlay click (outside modal)
    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            closeModal();
        }
    });
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

// CLOSE MODAL (FIXED)
function closeModal() {
    const overlay = document.querySelector('.rating-modal-overlay');
    if (overlay) {
        // Add fade out animation
        overlay.style.animation = 'modalFadeOut 0.3s ease';
        setTimeout(() => {
            overlay.remove();
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Force app focus (important fix)
            setTimeout(() => {
                // Trigger a focus event on app container
                const appContainer = document.getElementById('mainApp') || 
                                    document.querySelector('.profile-card')?.closest('div');
                if (appContainer) {
                    appContainer.focus();
                }
                
                // Also trigger click to remove any focus traps
                document.body.click();
            }, 100);
        }, 300);
    }
}

// SHOW ALL RATINGS (UPDATED)
function showAllRatings(providerPhone) {
    const providerId = 'provider_' + providerPhone;
    
    firebase.database().ref('ratings/' + providerId).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                alert("No ratings available");
                return;
            }
            
            let html = '';
            let ratings = [];
            
            snapshot.forEach(child => {
                ratings.push(child.val());
            });
            
            // Sort by newest first
            ratings.sort((a, b) => b.timestamp - a.timestamp);
            
            if (ratings.length === 0) {
                html = '<p style="text-align:center; color:#666; padding:20px;">No ratings yet</p>';
            } else {
                html = '<div style="max-height:300px; overflow-y:auto;">';
                
                ratings.forEach(r => {
                    const date = new Date(r.timestamp).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });
                    
                    html += `
                        <div style="border-bottom:1px solid #eee; padding:10px 0; margin:5px 0;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <strong style="color:#333;">${r.userName}</strong>
                                    <div style="color:#666; font-size:12px; margin-top:3px;">
                                        📅 ${date}
                                    </div>
                                </div>
                                <span style="color:#ff9800; font-size:18px;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
            }
            
            showModal('⭐ All Ratings', html);
        })
        .catch(error => {
            console.error("Error loading ratings:", error);
            alert("Could not load ratings");
        });
}

// ============ ADD CSS ANIMATIONS ============
window.addEventListener('load', function() {
    console.log("🚀 Initializing Rating System with Fixed Modal");
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes modalFadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
        
        .rating-modal-overlay {
            animation: modalFadeIn 0.3s ease;
        }
        
        /* Prevent background scroll when modal open */
        body.modal-open {
            overflow: hidden;
            position: fixed;
            width: 100%;
            height: 100%;
        }
        
        /* Modal scrollbar styling */
        .rating-modal div[style*="overflow-y: auto"]::-webkit-scrollbar {
            width: 6px;
        }
        
        .rating-modal div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }
        
        .rating-modal div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
        }
        
        .rating-modal div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    `;
    document.head.appendChild(style);
    
    // Rest of your initialization code...
});

// ============ GLOBAL FUNCTIONS ============
window.showModal = showModal;
window.closeModal = closeModal;
window.showAllRatings = showAllRatings;

// ============ ESC KEY TO CLOSE MODAL ============
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

console.log("✅ Fixed Modal System Ready!");
