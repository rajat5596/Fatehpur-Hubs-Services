let serviceProviders = [];
let currentFilter = '';

// providersRef, jobsRef, और database variables index.html से window scope में सेट हैं।

function startFirebaseListener() {
    // Ensure providersRef is available (it should be set in index.html's window.onload)
    if (!window.providersRef || !window.jobsRef) {
        console.error("Firebase references (providersRef/jobsRef) are not initialized.");
        return;
    }

    window.providersRef.on('value', snapshot => {
        serviceProviders = [];
        snapshot.forEach(child => {
            serviceProviders.push({ id: child.key, ...child.val() });
        });
        displayServices();
    });

    window.jobsRef.on('value', snapshot => {
        const jobs = [];
        snapshot.forEach(child => jobs.push({ id: child.key, ...child.val() }));
        displayJobs(jobs);
    });
}

function loadCategories() {
    const categories = [
        "Plumber", "Electrician", "Carpenter", "Mason", "Painter", 
        "AC Mechanic", "Tiler", "Beautician", "Home Cleaning", "Security Guard", 
        "Laundry Service", "Legal Consultant", "Private Teacher", "Computer Repair", "Welder",
        // NEW CATEGORIES
        "DJ Service", "Driver", "Catering", "Event Planner", "Photographer", "Car Mechanic"
    ];
    
    const container = document.getElementById('mistri-categories');
    container.innerHTML = categories.map(cat => 
        `<button class="cat-btn" onclick="filterByCategory('${cat}')">${cat}</button>`
    ).join('');
}

function filterByCategory(cat) {
    currentFilter = cat;
    // event.target is used, so ensure this function is called via an HTML onclick
    // Safely check if event is available before using event.target
    if (typeof event !== 'undefined' && event.target) {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
        event.target.classList.add('selected');
    }
    displayServices();
}

function searchServices() {
    displayServices();
}

function displayServices() {
    let filtered = window.serviceProviders;
    const search = document.getElementById('main-search-bar').value.toLowerCase();
    
    // वर्तमान लॉग-इन यूज़र की ID प्राप्त करें 
    // यह ID हमें यह चेक करने में मदद करेगी कि कौन रिकॉर्ड का मालिक है।
    const currentUserId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;

    // Filter logic
    if (window.currentFilter) filtered = filtered.filter(p => p.category === window.currentFilter);
    if (search) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search) || 
            p.category.toLowerCase().includes(search) || 
            p.area.toLowerCase().includes(search)
        );
    }

    const list = document.getElementById('mistri-list');
    if (filtered.length === 0) {
        list.innerHTML = '<h3>उपलब्ध सेवाएं</h3><p style="text-align:center;color:#999;">कोई सर्विस नहीं मिली</p>';
        return;
    }

    list.innerHTML = '<h3>उपलब्ध सेवाएं</h3>' + filtered.map(p => {
        // चेक करें: क्या यह रिकॉर्ड वर्तमान लॉग-इन यूज़र का है?
        const isOwner = currentUserId && p.userId === currentUserId;

        // ओनर के लिए Edit/Delete बटन का HTML
        const ownerActions = isOwner ? `
            <button class="edit-btn" onclick="editService('${p.id}')">Edit</button>
            <button class="delete-btn" onclick="deleteService('${p.id}')">Delete</button>
        ` : ''; 

        return `
            <div class="profile-card">
                <h4 style="margin:0 0 5px;color:#2a5298;">${p.name} <span style="font-size:12px;color:#666;">(${p.category})</span></h4>
                <p style="margin:5px 0;color:#666;">${p.area} | ${p.experience}</p>
                <div style="display:flex;justify-content:space-between;margin-top:10px; flex-wrap: wrap; gap: 8px;">
                    <button class="contact-btn" onclick="window.location.href='tel:${p.phone}'">Call</button>
                    <button class="whatsapp-btn" onclick="openWhatsApp('${p.phone}')">WhatsApp</button>
                    
                    ${isOwner ? '' : `<button class="share-btn-inline" onclick="navigator.share({title:'${p.name}', text:'${p.category} in ${p.area}', url:'${window.location.href}'})">Share</button>`}
                    
                    ${ownerActions}
                </div>
                ${isOwner ? '<p style="color:green;font-size:10px;text-align:right;">(आपका डेटा)</p>' : ''}
            </div>
        `;
    }).join('');
}

function loadPromotionAds() { 
    // This is often where special ad/promotion banners are loaded from DB.
    console.log("Loading promotion ads...");
}



function loadJobs() {
    // This function can be called to explicitly reload jobs, though the listener is running.
    console.log("Loading job list screen...");
    if (!window.jobsRef) {
        console.error("Jobs reference not initialized.");
    }
}
// Function 1: HTML Card banane ke liye
    const container = document.getElementById('jobs-list');
    // वर्तमान लॉग-इन यूज़र की ID प्राप्त करें (Used for owner check)
    const currentUserId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;
    
    container.innerHTML = ''; // Clear the container

    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:#555;">अभी कोई जॉब पोस्ट नहीं हुई है।</p>';
        return;
    }

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'profile-card job-card';
        
        // Check: Is this record owned by the current logged-in user?
        const isOwner = currentUserId && job.posterId === currentUserId;

        // Edit/Delete buttons for the owner
        const ownerActions = isOwner ? `
            <div style="margin-top:15px; text-align:right; display:flex; justify-content: flex-end; gap: 10px;">
                <!-- These functions will be defined in index.html -->
                <button class="edit-btn" onclick="editJob('${job.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteJob('${job.id}')">Delete</button>
            </div>
            <p style="color:green;font-size:10px;text-align:right;">(आपकी जॉब)</p>
        ` : '';

        card.innerHTML = `
            <h3 style="color:#2a5298; margin-bottom:5px;">${job.title}</h3>
            <p><strong>दुकान/कंपनी:</strong> ${job.shopName}</p>
            <p><strong>लोकेशन:</strong> ${job.location}</p>
            <p><strong>सैलरी:</strong> ₹${job.salary} / महीना</p>
            <p style="margin-top:10px;">${job.description}</p>
            <div style="margin-top:15px; text-align:right;">
                <button class="whatsapp-btn" onclick="openWhatsApp('${job.phone}')">
                    WhatsApp/Call (${job.phone})
                </button>
            </div>
            ${ownerActions}
        `;
        container.appendChild(card);
    });


// Function 2: Firebase se data fetch karne ke liye
function loadJobs() {
    // Check if jobsRef is initialized (from index.html window.onload)
    if (!window.jobsRef) {
        console.error("jobsRef is not initialized. Firebase might not be fully loaded.");
        // If not loaded, wait a moment and try again (Handles script timing)
        setTimeout(loadJobs, 500); 
        return;
    }

    // Data ko Realtime Database se fetch karo
    window.jobsRef.on('value', (snapshot) => {
        const jobs = [];
        snapshot.forEach((childSnapshot) => {
            const job = childSnapshot.val();
            // Job data ko array mein add karo
            jobs.push(job);
        });

        // Nayi jobs ko display karo
        displayJobs(jobs.reverse()); // Jobs ko latest se pehle dikhane ke liye reverse()
        
        console.log(`Loaded ${jobs.length} jobs.`);
    }, (error) => {
        console.error("Firebase Jobs Load Error:", error);
        document.getElementById('jobs-list').innerHTML = '<p style="color:red;">जॉब्स लोड करने में एरर आई।</p>';
    });
} 
// ==================== SIMPLE FIX - NO HTML CHANGE ====================

// 1. WAIT FOR PAGE TO LOAD
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, adding review system...");
    setTimeout(initReviewSystem, 1000);
});

// 2. MAIN FUNCTION
function initReviewSystem() {
    console.log("Initializing review system...");
    
    // Add TEST button to page (visible)
    addTestButton();
    
    // Setup click handlers for all existing buttons
    setupAllButtons();
}

// 3. ADD VISIBLE TEST BUTTON
function addTestButton() {
    // Remove old test button if exists
    const oldBtn = document.getElementById('fix-review-btn');
    if (oldBtn) oldBtn.remove();
    
    // Create new button
    const btn = document.createElement('button');
    btn.id = 'fix-review-btn';
    btn.innerHTML = '🔧 REVIEW SYSTEM FIX';
    btn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #FF5722;
        color: white;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 99999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    // Button click action
    btn.onclick = function() {
        alert("🎯 Review system activated!\n\n1. Click any 'Review & Rating' button\n2. Click stars to rate\n3. Type review\n4. Click submit");
        setupAllButtons();
    };
    
    document.body.appendChild(btn);
    console.log("Test button added to page");
}

// 4. SETUP ALL BUTTONS ON PAGE
function setupAllButtons() {
    console.log("Setting up all buttons...");
    
    // Find all review toggle buttons
    const buttons = document.querySelectorAll('button[id^="toggle-btn-"]');
    console.log("Found buttons:", buttons.length);
    
    buttons.forEach(button => {
        const serviceId = button.id.replace('toggle-btn-', '');
        
        // Remove old onclick
        button.setAttribute('onclick', '');
        
        // Add new onclick
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Button clicked:", serviceId);
            showReviewSection(serviceId);
        });
        
        console.log("Button setup for:", serviceId);
    });
}

// 5. SHOW REVIEW SECTION
function showReviewSection(serviceId) {
    console.log("Showing review section for:", serviceId);
    
    const section = document.getElementById('review-section-' + serviceId);
    const button = document.getElementById('toggle-btn-' + serviceId);
    
    if (!section) {
        console.error("Section not found for:", serviceId);
        alert("Section not found: review-section-" + serviceId);
        return;
    }
    
    // Toggle display
    if (section.style.display === 'none' || !section.style.display) {
        section.style.display = 'block';
        if (button) button.textContent = 'रिव्यू और रेटिंग छुपाएँ';
        setupStars(serviceId);
        console.log("Section shown");
    } else {
        section.style.display = 'none';
        if (button) button.textContent = 'रिव्यू और रेटिंग देखें (0)';
        console.log("Section hidden");
    }
}

// 6. SETUP STARS
function setupStars(serviceId) {
    console.log("Setting up stars for:", serviceId);
    
    const stars = document.querySelectorAll('.rating-stars-' + serviceId + ' .star');
    const hiddenInput = document.getElementById('selected-rating-' + serviceId);
    
    if (!stars.length) {
        console.error("No stars found");
        return;
    }
    
    stars.forEach(star => {
        // Remove old events
        star.replaceWith(star.cloneNode(true));
    });
    
    // Get fresh stars
    const newStars = document.querySelectorAll('.rating-stars-' + serviceId + ' .star');
    
    newStars.forEach(star => {
        star.style.cursor = 'pointer';
        star.style.fontSize = '24px';
        star.style.color = '#CCCCCC';
        
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            console.log("Star clicked:", rating);
            
            if (hiddenInput) {
                hiddenInput.value = rating;
                console.log("Rating set to:", rating);
            }
            
            // Color stars
            newStars.forEach(s => {
                const sRating = s.getAttribute('data-rating');
                if (sRating <= rating) {
                    s.style.color = '#FFD700'; // GOLD
                } else {
                    s.style.color = '#CCCCCC'; // GRAY
                }
            });
        });
    });
    
    console.log("Stars setup complete");
}

// 7. SUBMIT REVIEW
function submitReview(serviceId) {
    console.log("Submitting review for:", serviceId);
    
    const rating = document.getElementById('selected-rating-' + serviceId).value;
    const reviewText = document.getElementById('review-text-' + serviceId).value;
    
    console.log("Rating:", rating, "Review:", reviewText);
    
    if (rating == 0) {
        alert("कृपया स्टार रेटिंग दें!");
        return;
    }
    
    if (!reviewText.trim()) {
        alert("कृपया रिव्यू लिखें!");
        return;
    }
    
    // SUCCESS
    alert(`✅ रिव्यू सबमिट हो गया!\n\n⭐ रेटिंग: ${rating} स्टार\n📝 रिव्यू: ${reviewText}`);
    
    // Reset
    document.getElementById('selected-rating-' + serviceId).value = 0;
    document.getElementById('review-text-' + serviceId).value = '';
    
    // Reset stars
    const stars = document.querySelectorAll('.rating-stars-' + serviceId + ' .star');
    stars.forEach(star => {
        star.style.color = '#CCCCCC';
    });
}

// 8. AUTO-RUN
console.log("Review system script loaded");
setTimeout(initReviewSystem, 500);
