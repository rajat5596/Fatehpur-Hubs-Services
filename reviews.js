
// ===========================================
// FINAL WORKING RATING SYSTEM WITH FIREBASE
// ===========================================

console.log("🔥 FINAL RATING SYSTEM LOADED!");

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA37JsLUIG-kypZ55vdpLTp3WKHgRH2IwY",
    authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
    databaseURL: "https://fatehpur-hubs-a3a9f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fatehpur-hubs-a3a9f",
    storageBucket: "fatehpur-hubs-a3a9f.firebasestorage.app",
    messagingSenderId: "294360741451",
    appId: "1:294360741451:web:3bc85078805750b9fabfce",
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
console.log("✅ Firebase connected!");

// ===========================================
// MAIN FUNCTION TO SHOW RATINGS
// ===========================================
function loadAndShowRatings() {
  console.log("Loading ratings from Firebase...");
  
  // 1. First, load all reviews from Firebase
  database.ref('reviews').once('value').then(snapshot => {
    const allReviews = snapshot.val();
    console.log("Total reviews in DB:", allReviews ? Object.keys(allReviews).length : 0);
    
    // 2. Find all mistri cards
    const cards = document.querySelectorAll('.mistri-card, .bg-white.shadow-md, .profile-card');
    console.log(`Found ${cards.length} cards to update`);
    
    if (cards.length === 0) {
      console.error("❌ No cards found!");
      return;
    }
    
    // 3. Process each card
    cards.forEach((card, index) => {
      // Skip if already has rating
      if (card.querySelector('.final-rating-box')) return;
      
      // Get mistri name from card
      const h3 = card.querySelector('h3, h4, .text-lg');
      if (!h3) return;
      
      const mistriName = h3.textContent.trim();
      
      // 4. Find reviews for this mistri
      let mistriReviews = [];
      let totalRating = 0;
      let reviewCount = 0;
      
      if (allReviews) {
        Object.values(allReviews).forEach(review => {
          if (review.mistriName === mistriName) {
            mistriReviews.push(review);
            totalRating += review.rating;
            reviewCount++;
          }
        });
      }
      
      // 5. Calculate average rating
      const avgRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : "0.0";
      
      // 6. Create stars HTML
      let starsHTML = '';
      const numericRating = parseFloat(avgRating);
      const fullStars = Math.floor(numericRating);
      const hasHalfStar = numericRating % 1 >= 0.5;
      
      for (let i = 0; i < fullStars; i++) starsHTML += '★';
      if (hasHalfStar) starsHTML += '½';
      for (let i = starsHTML.length; i < 5; i++) starsHTML += '☆';
      
      // 7. Create rating HTML
      const ratingHTML = `
        <div class="final-rating-box" style="
          margin: 10px 0;
          padding: 12px;
          background: ${reviewCount > 0 ? 'linear-gradient(to right, #4CAF50, #2E7D32)' : 'linear-gradient(to right, #757575, #424242)'};
          color: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        ">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 5px;">
                <span style="font-size: 18px; color: #FFEB3B;">${starsHTML}</span>
                <span style="font-weight: bold; margin-left: 5px; font-size: 16px;">${avgRating}/5</span>
                <span style="font-size: 12px; opacity: 0.9; margin-left: 5px;">
                  ${reviewCount > 0 ? `(${reviewCount} reviews)` : '(No reviews yet)'}
                </span>
              </div>
              <div style="font-size: 11px; margin-top: 3px; opacity: 0.8;">
                ${reviewCount > 0 ? 'Based on real reviews' : 'Be the first to review!'}
              </div>
            </div>
            <button class="final-rate-btn" style="
              background: white;
              color: ${reviewCount > 0 ? '#2E7D32' : '#757575'};
              border: none;
              padding: 8px 15px;
              border-radius: 20px;
              font-weight: bold;
              cursor: pointer;
              font-size: 13px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              transition: all 0.3s;
            " data-name="${mistriName}">
              ${reviewCount > 0 ? '✏️ ADD REVIEW' : '⭐ BE FIRST'}
            </button>
          </div>
        </div>
      `;
      
      // 8. Insert into card
      h3.insertAdjacentHTML('afterend', ratingHTML);
      
      // 9. Add click event
      const btn = card.querySelector('.final-rate-btn');
      if (btn) {
        btn.onclick = function() {
          const name = this.getAttribute('data-name');
          showFinalRatingForm(name);
        };
      }
    });
    
    console.log(`✅ Updated ${cards.length} cards with real ratings!`);
    
  }).catch(error => {
    console.error("❌ Error loading reviews:", error);
    showEmergencyRatings(); // Fallback if Firebase fails
  });
}

// ===========================================
// FINAL RATING FORM (SAVES TO FIREBASE)
// ===========================================
function showFinalRatingForm(mistriName) {
  // Remove old form if exists
  const oldForm = document.getElementById('final-rating-form');
  if (oldForm) oldForm.remove();
  
  // Create form HTML
  const formHTML = `
    <div id="final-rating-form" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.85);
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        animation: slideIn 0.3s ease-out;
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 24px; color: #333; font-weight: bold;">
            ⭐ Rate ${mistriName}
          </div>
          <div style="color: #666; font-size: 14px; margin-top: 5px;">
            Your review helps others choose better
          </div>
        </div>
        
        <!-- Stars Rating -->
        <div style="text-align: center; margin: 25px 0;">
          <div id="final-rating-stars" style="font-size: 42px; color: #FFD700; cursor: pointer; letter-spacing: 5px;">
            <span data-rating="1">☆</span>
            <span data-rating="2">☆</span>
            <span data-rating="3">☆</span>
            <span data-rating="4">☆</span>
            <span data-rating="5">☆</span>
          </div>
          <div id="final-rating-text" style="color: #4CAF50; margin-top: 10px; font-weight: bold; font-size: 16px;">
            Tap stars to rate (1-5)
          </div>
        </div>
        
        <!-- Name Input -->
        <div style="margin: 20px 0;">
          <input type="text" 
                 id="reviewer-name" 
                 placeholder="Your name (optional)" 
                 style="
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #E0E0E0;
                    border-radius: 8px;
                    font-size: 15px;
                    transition: all 0.3s;
                 "
                 onfocus="this.style.borderColor='#4CAF50'"
                 onblur="this.style.borderColor='#E0E0E0'">
        </div>
        
        <!-- Comment -->
        <div style="margin: 20px 0;">
          <textarea 
            id="review-comment" 
            placeholder="Share your experience (optional)" 
            rows="3"
            style="
              width: 100%;
              padding: 12px 15px;
              border: 2px solid #E0E0E0;
              border-radius: 8px;
              font-size: 15px;
              font-family: inherit;
              resize: vertical;
              transition: all 0.3s;
            "
            onfocus="this.style.borderColor='#4CAF50'"
            onblur="this.style.borderColor='#E0E0E0'"
          ></textarea>
        </div>
        
        <!-- Buttons -->
        <div style="display: flex; gap: 12px; margin-top: 30px;">
          <button id="final-submit-rating" style="
            flex: 1;
            background: linear-gradient(to right, #4CAF50, #2E7D32);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76, 175, 80, 0.4)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(76, 175, 80, 0.3)'">
            ✅ SUBMIT REVIEW
          </button>
          <button id="final-close-form" style="
            background: #f5f5f5;
            color: #757575;
            border: 2px solid #E0E0E0;
            padding: 16px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
          " onmouseover="this.style.background='#E0E0E0'"
          onmouseout="this.style.background='#f5f5f5'">
            ✕ CANCEL
          </button>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `;
  
  // Add to page
  document.body.insertAdjacentHTML('beforeend', formHTML);
  
  // Star rating logic
  let selectedRating = 0;
  const stars = document.querySelectorAll('#final-rating-stars span');
  const ratingText = document.getElementById('final-rating-text');
  
  stars.forEach(star => {
    star.addEventListener('mouseover', function() {
      const rating = parseInt(this.dataset.rating);
      highlightFinalStars(rating);
      ratingText.textContent = `${rating}/5 - ${getRatingText(rating)}`;
      ratingText.style.color = getRatingColor(rating);
    });
    
    star.addEventListener('click', function() {
      selectedRating = parseInt(this.dataset.rating);
      highlightFinalStars(selectedRating);
      ratingText.textContent = `${selectedRating}/5 - ${getRatingText(selectedRating)} ✅`;
      ratingText.style.color = getRatingColor(selectedRating);
    });
  });
  
  function highlightFinalStars(rating) {
    stars.forEach((star, index) => {
      star.textContent = index < rating ? '★' : '☆';
      star.style.color = index < rating ? getRatingColor(rating) : '#FFD700';
      star.style.textShadow = index < rating ? '0 0 10px rgba(255, 193, 7, 0.5)' : 'none';
    });
  }
  
  function getRatingText(rating) {
    const texts = ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];
    return texts[rating - 1] || '';
  }
  
  function getRatingColor(rating) {
    const colors = ['#FF5252', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50'];
    return colors[rating - 1] || '#FFC107';
  }
  
  // Submit button - SAVES TO FIREBASE
  document.getElementById('final-submit-rating').onclick = function() {
    if (selectedRating === 0) {
      alert('Please select a rating by tapping the stars');
      return;
    }
    
    const reviewerName = document.getElementById('reviewer-name').value.trim() || 'Anonymous';
    const comment = document.getElementById('review-comment').value.trim();
    
    // Create review object
    const review = {
      mistriName: mistriName,
      rating: selectedRating,
      userName: reviewerName,
      comment: comment,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('hi-IN'),
      time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
    };
    
    // Generate unique ID
    const reviewId = 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Show loading
    this.innerHTML = '⏳ SAVING...';
    this.disabled = true;
    
    // Save to Firebase
    database.ref('reviews/' + reviewId).set(review)
      .then(() => {
        alert(`✅ Thank you! Your ${selectedRating}-star review for "${mistriName}" has been saved!`);
        document.getElementById('final-rating-form').remove();
        
        // Reload ratings after 2 seconds
        setTimeout(loadAndShowRatings, 2000);
      })
      .catch(error => {
        console.error("Error saving review:", error);
        alert('❌ Error saving review. Please try again.');
        this.innerHTML = '✅ SUBMIT REVIEW';
        this.disabled = false;
      });
  };
  
  // Close button
  document.getElementById('final-close-form').onclick = function() {
    document.getElementById('final-rating-form').remove();
  };
}

// ===========================================
// EMERGENCY FALLBACK (if Firebase fails)
// ===========================================
function showEmergencyRatings() {
  console.log("Using emergency ratings...");
  
  const cards = document.querySelectorAll('.mistri-card, .bg-white.shadow-md');
  cards.forEach(card => {
    if (card.querySelector('.final-rating-box')) return;
    
    const h3 = card.querySelector('h3');
    if (!h3) return;
    
    const emergencyHTML = `
      <div class="final-rating-box" style="
        margin: 10px 0;
        padding: 12px;
        background: linear-gradient(to right, #FF9800, #FF5722);
        color: white;
        border-radius: 10px;
      ">
        <div style="text-align: center;">
          <div style="font-size: 16px;">⭐ Rating System</div>
          <div style="font-size: 12px; opacity: 0.9;">Firebase loading...</div>
          <button onclick="alert('Firebase is loading, try again in 10 seconds')" style="
            background: white;
            color: #FF5722;
            border: none;
            padding: 6px 12px;
            border-radius: 5px;
            margin-top: 8px;
            cursor: pointer;
          ">
            TRY AGAIN
          </button>
        </div>
      </div>
    `;
    
    h3.insertAdjacentHTML('afterend', emergencyHTML);
  });
}

// ===========================================
// START THE SYSTEM
// ===========================================

// Wait 3 seconds for page to load
setTimeout(() => {
  console.log("🚀 Starting rating system...");
  loadAndShowRatings();
}, 3000);

// Also reload when new cards appear (like after "Load More")
setInterval(() => {
  const newCards = document.querySelectorAll('.mistri-card:not(:has(.final-rating-box))');
  if (newCards.length > 0) {
    console.log(`Found ${newCards.length} new cards, updating...`);
    loadAndShowRatings();
  }
}, 5000);

console.log("🎯 Rating System Ready! Will start in 3 seconds...");
