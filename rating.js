// rating.js - SIMPLE RATING SYSTEM FOR FATEHPUR HUBS
console.log("⭐ Rating System Loaded");

// ============ RATING FUNCTIONS ============

// 1. SUBMIT RATING
function submitRating(providerId, rating, providerName) {
    console.log("Submitting rating for", providerId, "stars:", rating);
    
    // Check if user is logged in
    if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
        alert("कृपया रेटिंग देने के लिए पहले लॉगिन करें");
        return;
    }
    
    const user = firebase.auth().currentUser;
    const userId = user.uid;
    const userName = user.displayName || localStorage.getItem('user_name') || 'User';
    
    const ratingData = {
        rating: rating,
        userName: userName,
        userId: userId,
        timestamp: Date.now()
    };
    
    // Save to Firebase
    firebase.database().ref('ratings/' + providerId + '/' + userId).set(ratingData)
        .then(() => {
            console.log("✅ Rating submitted");
            // Show success message
            showRatingSuccess(providerName, rating);
            // Refresh rating display
            setTimeout(() => {
                loadRatingForProvider(providerId);
            }, 500);
        })
        .catch(error => {
            console.error("❌ Rating error:", error);
            alert("रेटिंग सेव नहीं हुई: " + error.message);
        });
}

// 2. LOAD RATING FOR A PROVIDER
function loadRatingForProvider(providerId) {
    if (!providerId || typeof firebase === 'undefined') return;
    
    const ratingDiv = document.getElementById('rating-' + providerId);
    if (!ratingDiv) return;
    
    firebase.database().ref('ratings/' + providerId).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                ratingDiv.innerHTML = '<span style="color:#999; font-size:12px;">No ratings yet</span>';
                return;
            }
            
            let total = 0;
            let count = 0;
            
            snapshot.forEach(child => {
                total += child.val().rating;
                count++;
            });
            
            const average = (total / count).toFixed(1);
            const stars = getStarHTML(average);
            
            ratingDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="color: #ff9800; font-size: 14px;">
                        ${stars}
                    </div>
                    <span style="font-weight: bold; color: #666;">${average}</span>
                    <small style="color: #888;">(${count})</small>
                </div>
            `;
        })
        .catch(error => {
            console.error("Rating load error:", error);
            ratingDiv.innerHTML = '<span style="color:#999">Rating error</span>';
        });
}

// 3. GET STAR HTML
function getStarHTML(average) {
    const fullStars = Math.floor(average);
    const halfStar = (average % 1) >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    // Half star
    if (halfStar) {
        stars += '½';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

// 4. SHOW RATING SUCCESS MESSAGE
function showRatingSuccess(providerName, rating) {
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 99999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    successDiv.innerHTML = `
        <strong>✅ Rating Submitted!</strong><br>
        You gave ${'★'.repeat(rating)}${'☆'.repeat(5-rating)} to ${providerName}
    `;
    
    document.body.appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 300);
    }, 3000);
}

// 5. ADD RATING TO EXISTING CARDS
function addRatingToCards() {
    console.log("Adding rating system to cards...");
    
    // Wait for cards to load
    setTimeout(() => {
        const cards = document.querySelectorAll('.profile-card');
        console.log("Found", cards.length, "cards");
        
        cards.forEach((card, index) => {
            // Check if rating already added
            if (card.querySelector('.rating-section')) return;
            
            // Get provider info from card
            const nameElement = card.querySelector('h4');
            if (!nameElement) return;
            
            const providerName = nameElement.textContent.split('-')[0].trim();
            const providerId = 'provider_' + index + '_' + Date.now();
            
            // Create rating section
            const ratingSection = document.createElement('div');
            ratingSection.className = 'rating-section';
            ratingSection.style.cssText = `
                margin: 8px 0;
                padding: 8px;
                background: #f9f9f9;
                border-radius: 5px;
                border: 1px solid #eee;
            `;
            
            ratingSection.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <small style="color:#666;">Rate this provider:</small>
                    <div id="rating-${providerId}" style="color:#ff9800; font-size:12px;">
                        Loading...
                    </div>
                </div>
                <div style="display: flex; gap: 3px; margin-top: 5px;">
                    ${[1,2,3,4,5].map(star => `
                        <button onclick="submitRating('${providerId}', ${star}, '${providerName.replace(/'/g, "\\'")}')"
                                style="background: #ffd700; 
                                       border: none; 
                                       border-radius: 3px; 
                                       width: 30px; 
                                       height: 30px; 
                                       font-size: 14px; 
                                       cursor: pointer;
                                       color: #333;">
                            ${star}★
                        </button>
                    `).join('')}
                </div>
            `;
            
            // Insert after name
            nameElement.parentNode.insertBefore(ratingSection, nameElement.nextSibling);
            
            // Load rating
            setTimeout(() => {
                loadRatingForProvider(providerId);
            }, 500);
        });
    }, 1000);
}

// 6. AUTO-RUN WHEN PAGE LOADS
window.addEventListener('load', function() {
    console.log("Page loaded, initializing rating system...");
    
    // Run every 2 seconds to catch new cards
    setInterval(addRatingToCards, 2000);
    
    // Also run when screen changes
    const originalShowScreen = window.showScreen;
    if (originalShowScreen) {
        window.showScreen = function(screenId) {
            originalShowScreen(screenId);
            setTimeout(addRatingToCards, 500);
        };
    }
});

// 7. CSS FOR ANIMATIONS
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
    
    .rating-section button:hover {
        background: #ffc107 !important;
        transform: scale(1.1);
        transition: all 0.2s;
    }
`;
document.head.appendChild(style);

// ============ GLOBAL FUNCTIONS ============
window.submitRating = submitRating;
window.loadRatingForProvider = loadRatingForProvider;
window.addRatingToCards = addRatingToCards;

console.log("✅ Rating system ready!");
