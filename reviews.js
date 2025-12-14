// ===========================================
// SIMPLE WORKING RATING SYSTEM
// ===========================================

console.log("⭐ SIMPLE RATING SYSTEM LOADED!");

// Wait for page to load
setTimeout(() => {
  console.log("Checking for mistri cards...");
  
  // Find ALL possible card elements
  const selectors = [
    '.mistri-card',
    '.bg-white.shadow-md', 
    '.service-item',
    '.profile-card',
    '.bg-white.rounded-lg',
    'div[style*="background: white"]'
  ];
  
  let cards = [];
  selectors.forEach(selector => {
    const found = document.querySelectorAll(selector);
    cards = cards.concat(Array.from(found));
  });
  
  // Remove duplicates
  cards = [...new Set(cards)];
  
  console.log(`Found ${cards.length} cards on page`);
  
  if (cards.length === 0) {
    console.error("❌ No cards found! Adding debug button...");
    addDebugButton();
    return;
  }
  
  // Add SIMPLE rating to each card
  cards.forEach((card, index) => {
    // Skip if already has our rating
    if (card.querySelector('.simple-rating-box')) return;
    
    // Find title in card (h3, h4, or any text)
    const title = card.querySelector('h3, h4, h2, .text-lg, .text-xl, .text-lg.font-bold') || 
                  card.querySelector('div:first-child');
    
    const mistriName = title ? title.textContent.trim().substring(0, 20) : `Provider ${index+1}`;
    
    // SIMPLE RATING HTML
    const ratingHTML = `
      <div class="simple-rating-box" style="
        margin: 10px 0;
        padding: 12px;
        background: linear-gradient(to right, #4CAF50, #8BC34A);
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      ">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="font-size: 20px; color: #FFEB3B;">★★★★★</span>
              <span style="font-weight: bold; margin-left: 5px;">5.0</span>
              <span style="font-size: 12px; opacity: 0.9;">(10 reviews)</span>
            </div>
            <div style="font-size: 12px; margin-top: 3px;">Click to rate</div>
          </div>
          <button class="simple-rate-btn" style="
            background: white;
            color: #4CAF50;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          " data-name="${mistriName}">
            ⭐ RATE
          </button>
        </div>
      </div>
    `;
    
    // Insert into card
    if (title) {
      title.insertAdjacentHTML('afterend', ratingHTML);
    } else {
      // Insert at the beginning of card
      card.insertAdjacentHTML('afterbegin', ratingHTML);
    }
    
    // Add click event to button
    const btn = card.querySelector('.simple-rate-btn');
    if (btn) {
      btn.onclick = function() {
        const name = this.getAttribute('data-name');
        showSimpleRatingForm(name);
      };
    }
  });
  
  console.log(`✅ Added ratings to ${cards.length} cards`);
  
  // Check again after 5 seconds (for "Load More" buttons)
  setTimeout(() => {
    const newCards = document.querySelectorAll('.mistri-card:not(:has(.simple-rating-box))');
    if (newCards.length > 0) {
      console.log(`Found ${newCards.length} new cards, adding ratings...`);
      // Re-run the same function
      setTimeout(arguments.callee, 1000);
    }
  }, 5000);
  
}, 3000);

// ===========================================
// SIMPLE RATING FORM
// ===========================================
function showSimpleRatingForm(mistriName) {
  // Remove existing form if any
  const oldForm = document.getElementById('simple-rating-form');
  if (oldForm) oldForm.remove();
  
  // Create form HTML
  const formHTML = `
    <div id="simple-rating-form" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
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
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      ">
        <h3 style="color: #333; margin-bottom: 20px; text-align: center;">
          ⭐ Rate ${mistriName}
        </h3>
        
        <!-- Stars -->
        <div style="text-align: center; margin: 20px 0;">
          <div id="rating-stars" style="font-size: 40px; color: #FFD700; cursor: pointer;">
            <span data-rating="1">☆</span>
            <span data-rating="2">☆</span>
            <span data-rating="3">☆</span>
            <span data-rating="4">☆</span>
            <span data-rating="5">☆</span>
          </div>
          <div id="rating-text" style="color: #666; margin-top: 10px;">
            Tap stars to rate
          </div>
        </div>
        
        <!-- Buttons -->
        <div style="display: flex; gap: 10px; margin-top: 25px;">
          <button id="submit-rating" style="
            flex: 1;
            background: #4CAF50;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
          ">
            👍 SUBMIT
          </button>
          <button id="close-form" style="
            background: #f44336;
            color: white;
            border: none;
            padding: 15px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
          ">
            ✕ CLOSE
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.insertAdjacentHTML('beforeend', formHTML);
  
  // Star rating logic
  let selectedRating = 0;
  const stars = document.querySelectorAll('#rating-stars span');
  
  stars.forEach(star => {
    star.addEventListener('mouseover', function() {
      const rating = parseInt(this.dataset.rating);
      highlightStars(rating);
    });
    
    star.addEventListener('click', function() {
      selectedRating = parseInt(this.dataset.rating);
      highlightStars(selectedRating);
      document.getElementById('rating-text').textContent = `${selectedRating}/5 - Thanks!`;
    });
  });
  
  function highlightStars(rating) {
    stars.forEach((star, index) => {
      star.textContent = index < rating ? '★' : '☆';
      star.style.color = index < rating ? '#FF9800' : '#FFD700';
    });
  }
  
  // Submit button
  document.getElementById('submit-rating').onclick = function() {
    if (selectedRating === 0) {
      alert('Please select a rating by tapping the stars');
      return;
    }
    
    alert(`✅ Thank you! You rated ${mistriName} with ${selectedRating} stars!`);
    document.getElementById('simple-rating-form').remove();
  };
  
  // Close button
  document.getElementById('close-form').onclick = function() {
    document.getElementById('simple-rating-form').remove();
  };
}

// ===========================================
// DEBUG FUNCTION (if no cards found)
// ===========================================
function addDebugButton() {
  const debugBtn = document.createElement('button');
  debugBtn.innerHTML = `
    <div style="
      position: fixed;
      top: 100px;
      right: 20px;
      background: #FF5722;
      color: white;
      padding: 15px;
      border-radius: 10px;
      z-index: 99999;
      cursor: pointer;
      font-weight: bold;
      text-align: center;
      box-shadow: 0 5px 15px rgba(255,87,34,0.4);
    ">
      🐛 DEBUG<br>
      <small>No cards found</small>
    </div>
  `;
  
  document.body.appendChild(debugBtn);
  
  debugBtn.onclick = function() {
    // Show all elements on page
    const allElements = document.querySelectorAll('*');
    console.log("Total elements on page:", allElements.length);
    
    // Show all classes
    const allClasses = [];
    allElements.forEach(el => {
      if (el.className && el.className.trim() !== '') {
        allClasses.push(el.className);
      }
    });
    
    const uniqueClasses = [...new Set(allClasses)];
    console.log("All classes found:", uniqueClasses);
    
    alert(`Page has ${allElements.length} elements and ${uniqueClasses.length} unique classes.\n\nCheck Console for details.`);
  };
}

console.log("✅ Simple Rating System READY! Waiting for page...");
