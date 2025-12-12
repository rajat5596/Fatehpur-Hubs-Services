// ===================================
// REVIEWS & RATINGS SYSTEM v1.0
// ===================================

// Firebase Configuration (तुम्हारा)
const firebaseConfig = {
    apiKey: "AIzaSyBMJEeMJsy40OsNimdTSu3D0vfRx8FJ-2c",
    authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
    databaseURL: "https://fatehpur-hubs-a3a9f-default-rtdb.firebaseio.com",
    projectId: "fatehpur-hubs-a3a9f",
    storageBucket: "fatehpur-hubs-a3a9f.firebasestorage.app",
    messagingSenderId: "1051032210694",
    appId: "1:1051032210694:web:0facd40dd3de925ec6d204",
    measurementId: "G-P2SDX7W0V7"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

// ===== FIND MISTRI CARD =====
function findMistriCard(element) {
    // Navigate up to find the mistri card
    let currentElement = element;
    while (currentElement) {
        if (currentElement.classList && 
            (currentElement.classList.contains('mistri-card') || 
             currentElement.classList.contains('service-item') ||
             currentElement.classList.contains('bg-white') ||
             currentElement.classList.contains('shadow-md'))) {
            return currentElement;
        }
        currentElement = currentElement.parentElement;
    }
    return null;
}

// ===== GET MISTRI NAME FROM CARD =====
function getMistriNameFromCard(card) {
    // Try different selectors for mistri name
    const selectors = ['h3', '.text-lg.font-bold', 'h4', '.service-title'];
    
    for (const selector of selectors) {
        const element = card.querySelector(selector);
        if (element && element.textContent) {
            return element.textContent.trim();
        }
    }
    
    // Fallback: get first h* element
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
    return heading ? heading.textContent.trim() : 'Unknown Mistri';
}

// ===== LOAD RATINGS FOR ALL MISTRIS =====
function loadRatingsForAllMistris() {
    database.ref('reviews').once('value').then(snapshot => {
        const reviewsData = snapshot.val();
        if (!reviewsData) return;
        
        // Calculate average ratings for each mistri
        const mistriRatings = {};
        
        for (const reviewId in reviewsData) {
            const review = reviewsData[reviewId];
            const mistriName = review.mistriName;
            
            if (!mistriRatings[mistriName]) {
                mistriRatings[mistriName] = {
                    totalRating: 0,
                    count: 0,
                    reviews: []
                };
            }
            
            mistriRatings[mistriName].totalRating += review.rating;
            mistriRatings[mistriName].count++;
            mistriRatings[mistriName].reviews.push(review);
        }
        
        // Update UI for each mistri
        updateAllMistriRatings(mistriRatings);
        
    }).catch(error => {
        console.error('Error loading ratings:', error);
    });
}

// ===== UPDATE ALL MISTRI RATINGS IN UI =====
function updateAllMistriRatings(mistriRatings) {
    // Get all mistri cards
    const mistriCards = document.querySelectorAll('.mistri-card, .service-item, .bg-white.shadow-md');
    
    mistriCards.forEach(card => {
        const mistriName = getMistriNameFromCard(card);
        const ratingData = mistriRatings[mistriName];
        
        if (ratingData) {
            const avgRating = ratingData.totalRating / ratingData.count;
            addRatingToCard(card, mistriName, avgRating, ratingData.count);
        } else {
            addRatingToCard(card, mistriName, 0, 0); // No reviews yet
        }
    });
}

// ===== ADD RATING DISPLAY TO CARD =====
function addRatingToCard(card, mistriName, avgRating, reviewCount) {
    // Check if rating already exists
    if (card.querySelector('.rating-container')) {
        return;
    }
    
    // Create rating HTML
    const ratingHTML = `
        <div class="rating-container mt-2 mb-2">
            <div class="flex items-center">
                <!-- Stars -->
                <div class="stars inline-flex text-yellow-400 text-lg">
                    ${getStarsHTML(avgRating)}
                </div>
                
                <!-- Rating Number -->
                <span class="ml-2 font-bold text-gray-700">${avgRating.toFixed(1)}</span>
                
                <!-- Review Count -->
                <span class="ml-2 text-sm text-gray-500">(${reviewCount} reviews)</span>
                
                <!-- View Reviews Button -->
                <button class="view-reviews-btn ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    View Reviews
                </button>
                
                <!-- Give Review Button -->
                <button class="give-review-btn ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                    Add Review
                </button>
            </div>
        </div>
    `;
    
    // Insert after the mistri name/title
    const title = card.querySelector('h3, .text-lg.font-bold, h4');
    if (title) {
        title.insertAdjacentHTML('afterend', ratingHTML);
    } else {
        // Insert at beginning of card
        card.insertAdjacentHTML('afterbegin', ratingHTML);
    }
}

// ===== GET STARS HTML =====
function getStarsHTML(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// ===== SHOW REVIEW FORM =====
function showReviewForm(mistriName, mistriCard) {
    // Remove existing modal
    const existingModal = document.querySelector('.review-modal');
    if (existingModal) existingModal.remove();
    
    // Create modal HTML
    const modalHTML = `
        <div class="review-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="p-4 border-b">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold">Rate ${mistriName}</h3>
                        <button class="close-review-modal text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="p-4">
                    <!-- Star Rating -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <div class="star-rating flex space-x-1 text-2xl">
                            <i class="far fa-star text-yellow-400 cursor-pointer hover:text-yellow-500" data-rating="1"></i>
                            <i class="far fa-star text-yellow-400 cursor-pointer hover:text-yellow-500" data-rating="2"></i>
                            <i class="far fa-star text-yellow-400 cursor-pointer hover:text-yellow-500" data-rating="3"></i>
                            <i class="far fa-star text-yellow-400 cursor-pointer hover:text-yellow-500" data-rating="4"></i>
                            <i class="far fa-star text-yellow-400 cursor-pointer hover:text-yellow-500" data-rating="5"></i>
                        </div>
                        <div class="text-sm text-gray-500 mt-1" id="rating-text">Tap stars to rate</div>
                    </div>
                    
                    <!-- Review Text -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Your Review (optional)</label>
                        <textarea 
                            id="review-text" 
                            class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3" 
                            placeholder="Share your experience..."
                        ></textarea>
                    </div>
                    
                    <!-- User Name -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Your Name (optional)</label>
                        <input 
                            type="text" 
                            id="user-name" 
                            class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your name"
                        >
                    </div>
                    
                    <!-- Submit Button -->
                    <div class="flex space-x-2">
                        <button 
                            id="submit-review" 
                            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                            data-mistri-name="${mistriName}"
                        >
                            <i class="fas fa-paper-plane mr-2"></i>Submit Review
                        </button>
                        <button 
                            class="close-review-modal bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize star rating
    initStarRating();
    
    // Add submit event
    document.getElementById('submit-review').addEventListener('click', submitReview);
}

// ===== INITIALIZE STAR RATING =====
function initStarRating() {
    const stars = document.querySelectorAll('.star-rating i');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
        
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            highlightStars(selectedRating);
            document.getElementById('rating-text').textContent = `${selectedRating}/5 stars`;
        });
    });
    
    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star text-yellow-500 cursor-pointer';
            } else {
                star.className = 'far fa-star text-yellow-400 cursor-pointer hover:text-yellow-500';
            }
        });
    }
}

// ===== SUBMIT REVIEW =====
function submitReview() {
    const button = document.getElementById('submit-review');
    const mistriName = button.dataset.mistriName;
    
    // Get selected stars
    const filledStars = document.querySelectorAll('.star-rating .fa-star.fas');
    if (filledStars.length === 0) {
        alert('Please select a rating');
        return;
    }
    
    const rating = filledStars.length;
    const reviewText = document.getElementById('review-text').value.trim();
    const userName = document.getElementById('user-name').value.trim() || 'Anonymous';
    
    // Create review object
    const review = {
        mistriName: mistriName,
        rating: rating,
        comment: reviewText,
        userName: userName,
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('hi-IN')
    };
    
    // Generate unique ID
    const reviewId = 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Save to Firebase
    database.ref('reviews/' + reviewId).set(review)
        .then(() => {
            alert('Thank you for your review!');
            
            // Close modal
            document.querySelector('.review-modal').remove();
            
            // Reload ratings
            setTimeout(loadRatingsForAllMistris, 1000);
        })
        .catch(error => {
            console.error('Error saving review:', error);
            alert('Error submitting review. Please try again.');
        });
}

// ===== SHOW REVIEWS MODAL =====
function showReviewsModal(mistriName, mistriCard) {
    // Remove existing modal
    const existingModal = document.querySelector('.review-modal');
    if (existingModal) existingModal.remove();
    
    // Create modal HTML
    const modalHTML = `
        <div class="review-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="p-4 border-b">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold">Reviews for ${mistriName}</h3>
                        <button class="close-review-modal text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Reviews List -->
                <div class="p-4">
                    <div id="reviews-list">
                        <div class="text-center py-8">
                            <i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
                            <p class="mt-2 text-gray-500">Loading reviews...</p>
                        </div>
                    </div>
                    
                    <!-- Add Review Button -->
                    <button 
                        id="add-review-from-list" 
                        class="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                        data-mistri-name="${mistriName}"
                    >
                        <i class="fas fa-plus mr-2"></i>Add Your Review
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Load reviews
    loadReviewsForMistri(mistriName);
    
    // Add event for Add Review button
    document.getElementById('add-review-from-list').addEventListener('click', function() {
        document.querySelector('.review-modal').remove();
        showReviewForm(mistriName, mistriCard);
    });
}

// ===== LOAD REVIEWS FOR MISTRI =====
function loadReviewsForMistri(mistriName) {
    database.ref('reviews').orderByChild('mistriName').equalTo(mistriName).once('value')
        .then(snapshot => {
            const reviews = snapshot.val();
            const reviewsList = document.getElementById('reviews-list');
            
            if (!reviews || Object.keys(reviews).length === 0) {
                reviewsList.innerHTML = `
                    <div class="text-center py-8">
                        <i class="far fa-comments text-gray-300 text-3xl"></i>
                        <p class="mt-2 text-gray-500">No reviews yet</p>
                        <p class="text-sm text-gray-400">Be the first to review ${mistriName}</p>
                    </div>
                `;
                return;
            }
            
            let reviewsHTML = '';
            const reviewsArray = Object.values(reviews);
            
            // Sort by timestamp (newest first)
            reviewsArray.sort((a, b) => b.timestamp - a.timestamp);
            
            reviewsArray.forEach(review => {
                reviewsHTML += `
                    <div class="mb-4 pb-4 border-b last:border-b-0">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="font-medium text-gray-800">${review.userName}</span>
                                <div class="flex items-center mt-1">
                                    <div class="text-yellow-500">
                                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <span class="ml-2 text-sm text-gray-500">${review.rating}/5</span>
                                </div>
                            </div>
                            <span class="text-sm text-gray-400">${review.date}</span>
                        </div>
                        ${review.comment ? `<p class="mt-2 text-gray-600">${review.comment}</p>` : ''}
                    </div>
                `;
            });
            
            reviewsList.innerHTML = reviewsHTML;
        })
        .catch(error => {
            console.error('Error loading reviews:', error);
            document.getElementById('reviews-list').innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p class="mt-2">Error loading reviews</p>
                </div>
            `;
        });
}

// ===== FIREBASE AUTH (Optional) =====
function getUserProfile() {
    const user = firebase.auth().currentUser;
    if (user) {
        return {
            uid: user.uid,
            name: user.displayName,
            email: user.email
        };
    }
    return null;
                          }
