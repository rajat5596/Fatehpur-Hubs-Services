// ===================================
// SIMPLE PROMOTION POPUP
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ===== SET YOUR PROMOTION HERE =====
  // यहीं सब कुछ सेट करो - बस 3 चीज़ें बदलो!
  const MY_PROMOTION = {
    // 1. IMAGE LINK: यहाँ promotion image का link डालो
    imageUrl: "gs://fatehpur-hubs-a3a9f.firebasestorage.app/imgandroid-chrome-512x512.png",
    
    // 2. CLICK LINK: User click करे तो कहाँ जाए?
    redirectTo: "https://wa.me/919889904191", // WhatsApp, Instagram, Website
    
    // 3. PROMOTION TEXT: नीचे दिखने वाला text
    text: "🎉 SPECIAL OFFER! CONTACT NOW! 🎉"
  };
  // ===== END SETTINGS =====
  
  // Wait for 10 seconds
  setTimeout(function() {
    createAndShowPopup(MY_PROMOTION);
  }, 10000);
  
  function createAndShowPopup(promo) {
    // Create HTML
    const popupHTML = `
      <div id="simplePromoPopup" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      ">
        <div style="
          background: white;
          border-radius: 20px;
          padding: 25px;
          max-width: 90%;
          max-height: 90%;
          text-align: center;
          position: relative;
        ">
          <!-- Close Button -->
          <button id="closePopupBtn" style="
            position: absolute;
            top: -15px;
            right: -15px;
            background: red;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 22px;
            cursor: pointer;
          ">×</button>
          
          <!-- Promotion Banner -->
          <a href="${promo.redirectTo}" target="_blank" style="display: block; text-decoration: none;">
            <img src="${promo.imageUrl}" alt="Promotion" style="
              width: 100%;
              max-width: 500px;
              border-radius: 15px;
              display: block;
              margin: 0 auto;
            ">
          </a>
          
          <!-- Promotion Text -->
          <p style="
            margin-top: 20px;
            font-size: 18px;
            font-weight: bold;
            color: #333;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 10px;
          ">${promo.text}</p>
        </div>
      </div>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Close button functionality
    document.getElementById('closePopupBtn').onclick = function() {
      document.getElementById('simplePromoPopup').remove();
    };
    
    // Close when clicking outside (optional)
    document.getElementById('simplePromoPopup').onclick = function(e) {
      if (e.target.id === 'simplePromoPopup') {
        this.remove();
      }
    };
    
    console.log('Promotion popup shown!');
  }
  
});
