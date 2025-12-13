
// SIMPLE WORKING REVIEWS.JS
console.log("🔥 Reviews.js LOADED!");

// Wait for mistri cards
setTimeout(() => {
  console.log("Looking for mistri cards...");
  
  // Find all mistri cards
  const cards = document.querySelectorAll('.mistri-card');
  console.log(`Found ${cards.length} cards`);
  
  if (cards.length > 0) {
    // Add test button to EACH card
    cards.forEach((card, index) => {
      if (!card.querySelector('.test-rating-btn')) {
        // Get mistri name from h3
        const h3 = card.querySelector('h3');
        const mistriName = h3 ? h3.textContent.trim() : `Mistri ${index+1}`;
        
        // Add test button
        const btnHTML = `
          <div style="margin:10px 0; padding:10px; background:#4CAF50; color:white; border-radius:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span>⭐ ${mistriName}</span>
              <button class="test-rating-btn" style="background:white; color:green; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">
                TEST RATING
              </button>
            </div>
          </div>
        `;
        
        // Insert after h3
        if (h3) {
          h3.insertAdjacentHTML('afterend', btnHTML);
        } else {
          card.insertAdjacentHTML('afterbegin', btnHTML);
        }
        
        // Add click event
        card.querySelector('.test-rating-btn').onclick = function() {
          alert(`Rating system working for: ${mistriName}`);
        };
      }
    });
  } else {
    console.error("❌ No mistri-card elements found!");
  }
}, 4000); // 4 seconds delay
