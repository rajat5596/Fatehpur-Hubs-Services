// Wait for page to fully load
document.addEventListener('DOMContentLoaded', function() {
  
  // Get elements
  const popup = document.getElementById('promoPopup');
  const closeBtn = document.getElementById('closePopupBtn');
  const promoLink = document.getElementById('promoLink');
  
  // Check if popup exists
  if (!popup) {
    console.error('Popup element not found!');
    return;
  }
  
  console.log('Promo popup script loaded successfully!');
  
  // ===== SHOW POPUP AFTER 10 SECONDS =====
  setTimeout(function() {
    console.log('10 seconds completed - showing popup');
    popup.style.display = 'flex'; // Show popup
    
    // Optional: Add blur effect to background
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }, 10000); // 10 seconds = 10000 milliseconds
  
  // ===== CLOSE BUTTON FUNCTIONALITY =====
  closeBtn.addEventListener('click', function() {
    console.log('Close button clicked');
    popup.style.display = 'none'; // Hide popup
    document.body.style.overflow = 'auto'; // Allow scrolling again
  });
  
  // ===== CLOSE POPUP WHEN CLICKING OUTSIDE =====
  popup.addEventListener('click', function(event) {
    // If clicked directly on overlay (not content)
    if (event.target === popup) {
      popup.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
  
  // ===== PROMO LINK CLICK =====
  // (Already works with <a href> but we can add tracking)
  promoLink.addEventListener('click', function() {
    console.log('Promo banner clicked - redirecting to link');
    // Optional: Send analytics event here
  });
  
  // ===== KEYBOARD SUPPORT (ESC to close) =====
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && popup.style.display === 'flex') {
      popup.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
  
});
