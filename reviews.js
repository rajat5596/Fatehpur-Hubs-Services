
// ===========================================
// LOAD AND SHOW REVIEWS FROM FIREBASE
// ===========================================

function loadFirebaseReviews() {
  console.log("📡 Loading reviews from Firebase...");
  
  if (!firebase || !firebase.database) {
    console.error("Firebase not loaded");
    return;
  }
  
  var db = firebase.database();
  
  // Load all reviews
  db.ref('reviews').once('value').then(function(snapshot) {
    var allReviews = snapshot.val();
    console.log("Firebase reviews:", allReviews);
    
    if (!allReviews || typeof allReviews !== 'object') {
      console.log("No reviews in Firebase yet");
      showNoReviewsMessage();
      return;
    }
    
    // Find all mistri cards
    var cards = document.querySelectorAll('.profile-card, .mistri-card');
    console.log("Found cards:", cards.length);
    
    cards.forEach(function(card) {
      if (card.querySelector('.firebase-rating')) return;
      
      var h3 = card.querySelector('h3');
      if (!h3) return;
      
      var mistriName = h3.textContent.trim();
      
      // Find reviews for this mistri
      var mistriReviews = [];
      var totalRating = 0;
      var reviewCount = 0;
      
      Object.values(allReviews).forEach(function(review) {
        if (review.mistriName === mistriName) {
          mistriReviews.push(review);
          totalRating += review.rating;
          reviewCount++;
        }
      });
      
      // Calculate average
      var avgRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;
      
      // Create rating display
      var ratingHTML = createFirebaseRatingHTML(mistriName, avgRating, reviewCount, mistriReviews);
      
      // Insert into card
      h3.insertAdjacentHTML('afterend', ratingHTML);
    });
    
  }).catch(function(error) {
    console.error("Error loading Firebase reviews:", error);
  });
}

// Helper function
function createFirebaseRatingHTML(mistriName, avgRating, reviewCount, reviews) {
  var stars = '';
  var fullStars = Math.floor(avgRating);
  var hasHalf = (avgRating % 1) >= 0.5;
  
  for (var i = 0; i < fullStars; i++) stars += '★';
  if (hasHalf) stars += '½';
  for (var i = stars.length; i < 5; i++) stars += '☆';
  
  return `
  <div class="firebase-rating" style="
    margin: 10px 0;
    padding: 12px;
    background: ${reviewCount > 0 ? '#e8f5e9' : '#fff3e0'};
    border-radius: 8px;
    border-left: 4px solid ${reviewCount > 0 ? '#4CAF50' : '#ff9800'};
  ">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="color: #ff9800; font-size: 16px; font-weight: bold;">
          ${stars} <span style="color: #2a5298;">${avgRating}/5</span>
        </div>
        <div style="font-size: 12px; color: #666; margin-top: 3px;">
          ${reviewCount > 0 ? 
            reviewCount + ' review' + (reviewCount > 1 ? 's' : '') + ' from real users' : 
            'No reviews yet'}
        </div>
      </div>
      <button onclick="addFirebaseReview('${mistriName.replace(/'/g, "\\'")}')" 
        style="
          background: ${reviewCount > 0 ? '#2196F3' : '#4CAF50'};
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          font-size: 12px;
          cursor: pointer;
          font-weight: bold;
        ">
        ${reviewCount > 0 ? 'ADD REVIEW' : 'BE FIRST'}
      </button>
    </div>
    
    ${reviews.length > 0 ? `
    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ddd;">
      <div style="font-size: 11px; color: #666; margin-bottom: 5px;">Recent reviews:</div>
      ${reviews.slice(0, 2).map(function(review) {
        return `
        <div style="font-size: 12px; margin-bottom: 5px; padding: 5px; background: #f9f9f9; border-radius: 4px;">
          <span style="color: #ff9800;">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
          <span style="color: #666; margin-left: 5px;">${review.comment || 'No comment'}</span>
          <div style="font-size: 10px; color: #999; margin-top: 2px;">
            - ${review.userName || 'Anonymous'} • ${new Date(review.timestamp).toLocaleDateString('hi-IN')}
          </div>
        </div>
        `;
      }).join('')}
    </div>
    ` : ''}
  </div>`;
}

// Add review to Firebase
window.addFirebaseReview = function(mistriName) {
  var rating = prompt("Rate " + mistriName + " (1-5 stars):");
  if (!rating || rating < 1 || rating > 5) {
    alert("Please enter a rating between 1 and 5");
    return;
  }
  
  var comment = prompt("Your review (optional):");
  var userName = prompt("Your name (optional):") || 'Anonymous';
  
  var reviewData = {
    mistriName: mistriName,
    rating: parseInt(rating),
    userName: userName,
    comment: comment || '',
    timestamp: Date.now()
  };
  
  // Generate unique ID
  var reviewId = 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // Save to Firebase
  firebase.database().ref('reviews/' + reviewId).set(reviewData)
    .then(function() {
      alert("✅ Thank you! Your review has been saved to cloud!\nAll users can now see it.");
      setTimeout(loadFirebaseReviews, 1000);
    })
    .catch(function(error) {
      console.error("Error saving to Firebase:", error);
      alert("Error saving review. Please try again.");
    });
};

// Start loading reviews
setTimeout(loadFirebaseReviews, 4000);

// Auto-refresh
setInterval(function() {
  if (document.querySelector('.profile-card:not(:has(.firebase-rating))')) {
    loadFirebaseReviews();
  }
}, 5000);
