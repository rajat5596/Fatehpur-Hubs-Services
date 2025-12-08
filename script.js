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
// ==================== SIMPLE RATING SYSTEM ====================

// 1. TOGGLE BUTTON FUNCTION
function toggleReviewSection(serviceId) {
    console.log("Button clicked for:", serviceId);
    
    // Find elements
    const section = document.getElementById('review-section-' + serviceId);
    const button = document.getElementById('toggle-btn-' + serviceId);
    
    if (!section) {
        alert("Error: review-section-" + serviceId + " not found!");
        return;
    }
    
    if (!button) {
        alert("Error: toggle-btn-" + serviceId + " not found!");
        return;
    }
    
    console.log("Section found:", section);
    console.log("Button found:", button);
    
    // Toggle display
    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'block';
        button.textContent = 'रिव्यू और रेटिंग छुपाएँ';
        console.log("Section shown");
    } else {
        section.style.display = 'none';
        button.textContent = 'रिव्यू और रेटिंग देखें (0)';
        console.log("Section hidden");
    }
}

// 2. STAR RATING FUNCTION
function setupStars(serviceId) {
    console.log("Setting up stars for:", serviceId);
    
    const stars = document.querySelectorAll('.rating-stars-' + serviceId + ' .star');
    const hiddenInput = document.getElementById('selected-rating-' + serviceId);
    
    if (!stars.length) {
        console.error("No stars found for:", serviceId);
        return;
    }
    
    if (!hiddenInput) {
        console.error("Hidden input not found for:", serviceId);
        return;
    }
    
    stars.forEach(star => {
        star.onclick = function() {
            const rating = this.getAttribute('data-rating');
            console.log("Star clicked:", rating);
            hiddenInput.value = rating;
            
            // Color all stars
            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.style.color = '#FFD700'; // GOLD
                } else {
                    s.style.color = '#CCCCCC'; // GRAY
                }
            });
        };
    });
}

// 3. SUBMIT REVIEW FUNCTION
function submitReview(serviceId) {
    console.log("Submit review for:", serviceId);
    
    const ratingInput = document.getElementById('selected-rating-' + serviceId);
    const reviewText = document.getElementById('review-text-' + serviceId);
    
    if (!ratingInput) {
        alert("Error: Rating input not found!");
        return;
    }
    
    if (!reviewText) {
        alert("Error: Review textarea not found!");
        return;
    }
    
    const rating = ratingInput.value;
    const text = reviewText.value;
    
    console.log("Rating:", rating, "Review:", text);
    
    if (rating == 0) {
        alert("कृपया स्टार रेटिंग दें!");
        return;
    }
    
    if (text.trim() === "") {
        alert("कृपया रिव्यू लिखें!");
        return;
    }
    
    // SUCCESS
    alert("✅ रिव्यू सबमिट हो गया!\nरेटिंग: " + rating + " स्टार\nरिव्यू: " + text);
    
    // Reset form
    ratingInput.value = 0;
    reviewText.value = "";
    
    // Reset stars
    const stars = document.querySelectorAll('.rating-stars-' + serviceId + ' .star');
    stars.forEach(star => {
        star.style.color = '#CCCCCC';
    });
}

// ==================== RENDER CARD FUNCTION ====================
function renderProviderCard(p) {
    return `
    <div class="profile-card" style="border:1px solid #ddd; border-radius:10px; padding:15px; margin:10px 0; background:white;">
        <h4 style="color:#2a5298;">${p.name} - (${p.category})</h4>
        <p style="font-size:12px;color:#555;">📍 ${p.area} | Experience: ${p.experience}</p>

        <div style="margin-top:10px; display:flex; gap:5px;">
            <button onclick="window.open('https://wa.me/${p.phone}', '_blank')" style="flex:1; background:#25D366; color:white; border:none; padding:8px; border-radius:5px;">WhatsApp</button>
            <button onclick="window.location='tel:${p.phone}'" style="flex:1; background:#007bff; color:white; border:none; padding:8px; border-radius:5px;">Call Now</button>
            <button onclick="alert('Share feature')" style="flex:1; background:#6c757d; color:white; border:none; padding:8px; border-radius:5px;">Share</button>
        </div>
        
        <hr style="margin:15px 0;">
        
        <!-- REVIEW BUTTON -->
        <button 
            id="toggle-btn-${p.key}" 
            onclick="toggleReviewSection('${p.key}')" 
            style="width:100%; padding:10px; background:#4CAF50; color:white; border:none; border-radius:5px; cursor:pointer; font-size:16px;">
            🔍 रिव्यू और रेटिंग देखें
        </button>
        
        <!-- REVIEW SECTION (HIDDEN BY DEFAULT) -->
        <div id="review-section-${p.key}" style="display:none; margin-top:15px; padding:15px; border:1px solid #eee; border-radius:8px;">
            <h4 style="color:#333;">⭐ अपना रिव्यू दें</h4>
            
            <!-- STAR RATING -->
            <div class="rating-stars-${p.key}" style="font-size:30px; margin:10px 0;">
                <span class="star" data-rating="1" style="color:#CCCCCC; cursor:pointer; margin:0 5px;">★</span>
                <span class="star" data-rating="2" style="color:#CCCCCC; cursor:pointer; margin:0 5px;">★</span>
                <span class="star" data-rating="3" style="color:#CCCCCC; cursor:pointer; margin:0 5px;">★</span>
                <span class="star" data-rating="4" style="color:#CCCCCC; cursor:pointer; margin:0 5px;">★</span>
                <span class="star" data-rating="5" style="color:#CCCCCC; cursor:pointer; margin:0 5px;">★</span>
            </div>
            
            <input type="hidden" id="selected-rating-${p.key}" value="0">
            
            <!-- REVIEW TEXT -->
            <textarea 
                id="review-text-${p.key}" 
                placeholder="अपने अनुभव के बारे में लिखें..." 
                rows="3" 
                style="width:100%; padding:10px; margin:10px 0; border:1px solid #ddd; border-radius:5px;">
            </textarea>
            
            <!-- SUBMIT BUTTON -->
            <button 
                onclick="submitReview('${p.key}')" 
                style="width:100%; padding:12px; background:#2196F3; color:white; border:none; border-radius:5px; cursor:pointer; font-size:16px;">
                📤 रिव्यू सबमिट करें
            </button>
        </div>
    </div>
    `;
}

// ==================== TEST FUNCTION ====================
// इस फंक्शन को कॉल करके टेस्ट करो
function testReviewSystem() {
    console.log("=== TESTING REVIEW SYSTEM ===");
    
    // Create a test provider
    const testProvider = {
        key: "test123",
        name: "Test Mistri",
        category: "Plumber",
        area: "Fatehpur",
        experience: "5 years",
        phone: "9999999999"
    };
    
    // Add to page
    document.body.innerHTML += renderProviderCard(testProvider);
    
    // Show message
    alert("Test card added! Click the GREEN button to test.");
    
    // Auto-setup stars after a delay
    setTimeout(() => {
        setupStars("test123");
        console.log("Stars setup complete for test123");
    }, 500);
}

// पेज लोड होने पर टेस्ट बटन जोड़ें
window.onload = function() {
    // Add test button to page
    const testBtn = document.createElement('button');
    testBtn.innerHTML = "🧪 टेस्ट रिव्यू सिस्टम";
    testBtn.style.position = 'fixed';
    testBtn.style.top = '10px';
    testBtn.style.right = '10px';
    testBtn.style.zIndex = '1000';
    testBtn.style.padding = '10px';
    testBtn.style.background = '#FF9800';
    testBtn.style.color = 'white';
    testBtn.style.border = 'none';
    testBtn.style.borderRadius = '5px';
    testBtn.style.cursor = 'pointer';
    testBtn.onclick = testReviewSystem;
    
    document.body.appendChild(testBtn);
    console.log("Test button added to page");
};
