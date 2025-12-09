Let serviceProviders = [];
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
        const isOwner = currentUserId && p.userId === currentUserId;

        const ownerActions = isOwner ? `
            <button class="edit-btn" onclick="editService('${p.id}')">Edit</button>
            <button class="delete-btn" onclick="deleteService('${p.id}')">Delete</button>
        ` : ''; 

        return `
            <div class="profile-card">
                <h4 style="margin:0 0 5px;color:#2a5298;">${p.name} <span style="font-size:12px;color:#666;">(${p.category})</span></h4>
                <p style="margin:5px 0;color:#666;">${p.area} | ${p.experience}</p>
                
                <div id="average-rating-display-${p.id}" style="margin-bottom: 10px;">
                    </div>

                <div style="display:flex;justify-content:space-between;margin-top:10px; flex-wrap: wrap; gap: 8px;">
                    <button class="contact-btn" onclick="window.location.href='tel:${p.phone}'">Call</button>
                    <button class="whatsapp-btn" onclick="openWhatsApp('${p.phone}')">WhatsApp</button>
                    
                    <button id="toggle-btn-${p.id}" class="review-btn" onclick="toggleReviewSection('${p.id}')">
                         रिव्यू और रेटिंग देखें (0)
                    </button>
                    
                    ${isOwner ? '' : `<button class="share-btn-inline" onclick="navigator.share({title:'${p.name}', text:'${p.category} in ${p.area}', url:'${window.location.href}'})">Share</button>`}
                    
                    ${ownerActions}
                </div>
                
                <div id="review-section-${p.id}" style="display:none; margin-top: 15px; padding: 10px; border-top: 1px solid #ddd;">
                    <div style="margin-bottom: 15px;">
                        <h5>अपनी रेटिंग दें:</h5>
                        <div class="rating-stars rating-stars-${p.id}" style="font-size: 24px; cursor: pointer;">
                            <span class="star" data-rating="1">★</span>
                            <span class="star" data-rating="2">★</span>
                            <span class="star" data-rating="3">★</span>
                            <span class="star" data-rating="4">★</span>
                            <span class="star" data-rating="5">★</span>
                        </div>
                        <input type="hidden" id="selected-rating-${p.id}" value="0">
                        <textarea id="review-text-${p.id}" placeholder="अपना रिव्यू यहाँ लिखें..." style="width: 95%; margin-top: 10px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                        <button class="submit-review-btn" onclick="submitReview('${p.id}')">रिव्यू सबमिट करें</button>
                    </div>

                    <div id="all-reviews-display-${p.id}">
                        </div>
                </div>

                ${isOwner ? '<p style="color:green;font-size:10px;text-align:right;">(आपका डेटा)</p>' : ''}
            </div>
        `;
    }).join('');
    
    // यह फ़िक्स हर कार्ड के लिए रेटिंग लोड करेगा और बटन को सक्रिय करेगा
    filtered.forEach(p => {
        loadAverageRating(p.id); 
    });
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
// 🔥 फुल-स्क्रीन स्पेशल प्रमोशन — बिना index.html छेड़े 🔥
const fullScreenPromo = {
    enabled: true,                                           // false कर दोगे तो बंद
    image: "https://i.imgur.com/Jh0nS0n.jpg",                // ← अपना बैनर यहाँ बदलना
    text: "Johnson Square – 50% छूट आज ही!"                // ← अपना मैसेज यहाँ
};

// डायनामिक div बनाकर पेज में जोड़ दो
function showFullScreenPromo() {
    if (!fullScreenPromo.enabled) return;

    const div = document.createElement('div');
    div.id = 'myFullScreenPromo';
    div.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.97); z-index:99999; justify-content:center; align-items:center; flex-direction:column; color:white; text-align:center;';
    div.innerHTML = `
        <button onclick="this.parentElement.remove()" style="position:absolute; top:15px; right:20px; background:red; color:white; border:none; padding:10px 18px; border-radius:50%; font-size:24px; cursor:pointer;">✕</button>
        <img src="${fullScreenPromo.image}" style="max-width:92%; max-height:65%; border-radius:18px; box-shadow:0 0 30px gold;">
        <h2 style="margin:20px; font-size:28px; color:gold;">${fullScreenPromo.text}</h2>
        <p style="font-size:19px;">स्पेशल ऑफर सिर्फ आज के लिए!</p>
    `;
    document.body.appendChild(div);

    // 2 सेकंड बाद दिखाओ
    setTimeout(() => {
        div.style.display = 'flex';
    }, 2000);
}

// पेज लोड होते ही चलाओ
showFullScreenPromo();
