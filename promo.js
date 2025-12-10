// Wait for page load
document.addEventListener('DOMContentLoaded', function() {
  const popup = document.getElementById('specialPromoPopup');
  const closeBtn = document.getElementById('closePromo');
  
  // Show after 10 seconds
  setTimeout(() => {
    popup.style.display = 'flex';
    console.log('Popup shown after 10 sec');
  }, 10000);
  
  // Close button
  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });
  
  // Also show after every 5th mistri
  // यहाँ तुम्हारा mistri counter logic लगाओ
});
