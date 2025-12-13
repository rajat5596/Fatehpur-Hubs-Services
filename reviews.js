// COMPLETE RATING SYSTEM - SIMPLE VERSION
console.log("⭐ Rating System Starting...");

// Firebase config (same as before)
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

// SIMPLE RATING DISPLAY
function showSimpleRatings() {
  console.log("Showing ratings...");
  
  const cards = document.querySelectorAll('.mistri-card');
  console.log(`Processing ${cards.length} cards`);
  
  cards.forEach((card, index) => {
    // Skip if already has rating
    if (card.querySelector('.simple-rating')) return;
    
    // Get mistri name
    const h3 = card.querySelector('h3');
    if (!h3) return;
    
    const mistriName = h3.textContent.trim();
    
    // Check Firebase for this mistri's rating
    database.ref('reviews').orderByChild('mistriName').equalTo(mistriName).once('value')
      .then(snapshot => {
        const reviews = snapshot.val();
        let ratingHTML = '';
        
        if (reviews) {
          // Calculate average rating
          const reviewsArray = Object.values(reviews);
          const totalRating = reviewsArray.reduce((sum, review) => sum + review.rating, 0);
          const avgRating = totalRating / reviewsArray.length;
          const reviewCount = reviewsArray.length;
          
          // Create stars
          const fullStars = Math.floor(avgRating);
          const halfStar = avgRating % 1 >= 0.5;
          
          let stars = '';
          for (let i = 0; i < fullStars; i++) stars += '★';
          if (halfStar) stars += '½';
          for (let i = stars.length; i < 5; i++) stars += '☆';
          
          // Rating HTML
          ratingHTML = `
            <div class="simple-rating" style="
              margin: 8px 0;
              padding: 8px;
              background: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #4CAF50;
            ">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #FF9800; font-size: 18px;">${stars}</span>
                <span style="font-weight: bold; color: #333;">${avgRating.toFixed(1)}/5</span>
                <span style="color: #666; font-size: 14px;">(${reviewCount} reviews)</span>
                <button class="simple-add-review" style="
                  margin-left: auto;
                  background: #2196F3;
                  color: white;
                  border: none;
                  padding: 4px 10px;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                " data-mistri="${mistriName}">
                  + Add Review
                </button>
              </div>
            </div>
          `;
        } else {
          // No reviews yet
          ratingHTML = `
            <div class="simple-rating" style="
              margin: 8px 0;
              padding: 8px;
              background: #f0f0f0;
              border-radius: 8px;
              border-left: 4px solid #9E9E9E;
            ">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #9E9E9E; font-size: 18px">☆☆☆☆☆</span>
                <span style="color: #666; font-size: 14px;">No reviews yet</span>
                <button class="simple-add-review" style="
                  margin-left: auto;
                  background: #4CAF50;
                  color: white;
                  border: none;
                  padding: 4px 10px;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                " data-mistri="${mistriName}">
                  Be First
                </button>
              </div>
            </div>
          `;
        }
        
        // Insert after h3
        h3.insertAdjacentHTML('afterend', ratingHTML);
        
      })
      .catch(error => {
        console.error("Error loading rating for", mistriName, error);
      });
  });
}

// SIMPLE REVIEW FORM
function showSimpleReviewForm(mistriName) {
  const formHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    ">
      <div style="
        background: white;
        padding: 25px;
        border-radius: 15px;
        max-width: 400px;
        width: 100%;
      ">
        <h3 style="margin-bottom: 15px; color: #333;">Rate ${mistriName}</h3>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #666;">Rating:</label>
          <div style="display: flex; gap: 5px; font-size: 30px;">
            <span data-rating="1" style="cursor:pointer; color:#e0e0e0;">★</span>
            <span data-rating="2" style="cursor:pointer; color:#e0e0e0;">★</span>
            <span data-rating="3" style="cursor:pointer; color:#e0e0e0;">★</span>
            <span data-rating="4" style="cursor:pointer; color:#e0e0e0;">★</span>
            <span data-rating="5" style="cursor:pointer; color:#e0e0e0;">★</span>
          </div>
          <input type="hidden" id="selected-rating" value="0">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #666;">Your Name:</label>
          <input type="text" id="reviewer-name" placeholder="Optional" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
          ">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; color: #666;">Comment:</label>
          <textarea id="review-comment" placeholder="Optional" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            height: 80px;
          "></textarea>
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button id="submit-simple-review" style="
            flex: 1;
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 5px;
            cursor: pointer;
          ">Submit Review</button>
          <button class="close-simple-form" style="
            background: #f44336;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 5px;
            cursor: pointer;
          ">Cancel</button>
        </div>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.insertAdjacentHTML('beforeend', formHTML);
  
  // Star rating click
  const stars = document.querySelectorAll('[data-rating]');
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const rating = parseInt(this.dataset.rating);
      document.getElementById('selected-rating').value = rating;
      
      // Highlight stars
      stars.forEach((s, index) => {
        s.style.color = index < rating ? '#FF9800' : '#e0e0e0';
      });
    });
  });
  
  // Submit button
  document.getElementById('submit-simple-review').addEventListener('click', function() {
    const rating = document.getElementById('selected-rating').value;
    const name = document.getElementById('reviewer-name').value || 'Anonymous';
    const comment = document.getElementById('review-comment').value;
    
    if (rating == 0) {
      alert('Please select a rating');
      return;
    }
    
    // Save to Firebase
    const reviewData = {
      mistriName: mistriName,
      rating: parseInt(rating),
      userName: name,
      comment: comment,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('hi-IN')
    };
    
    database.ref('reviews/review_' + Date.now()).set(reviewData)
      .then(() => {
        alert('Thank you for your review!');
        document.querySelector('.close-simple-form').click();
        // Reload ratings after 2 seconds
        setTimeout(showSimpleRatings, 2000);
      })
      .catch(error => {
        console.error('Error saving review:', error);
        alert('Error submitting review');
      });
  });
  
  // Close button
  document.querySelector('.close-simple-form').addEventListener('click', function() {
    document.body.removeChild(this.closest('div[style*="position: fixed"]'));
  });
}

// START EVERYTHING
setTimeout(() => {
  console.log("Starting rating system...");
  
  // 1. Show ratings
  showSimpleRatings();
  
  // 2. Add click event for review buttons (using event delegation)
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('simple-add-review')) {
      const mistriName = e.target.getAttribute('data-mistri');
      showSimpleReviewForm(mistriName);
    }
  });
  
  // 3. Check again when new cards load (like "Load More")
  const checkForNewCards = setInterval(() => {
    const newCards = document.querySelectorAll('.mistri-card:not(:has(.simple-rating))');
    if (newCards.length > 0) {
      console.log(`Found ${newCards.length} new cards, updating ratings...`);
      showSimpleRatings();
    }
  }, 3000);
  
}, 4000); // Wait 4 seconds for page to load

console.log("✅ Rating System Ready!");
