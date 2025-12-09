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
// ===================== script.js - 100% Working Version =====================
let serviceProviders = [];
let currentFilter = '';

// 1. Toggle Review Section
function toggleReviewSection(key) {
    const section = document.getElementById('review-section-' + key);
    const btn = document.getElementById('toggle-btn-' + key);

    if (!section || !btn) return;

    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'block';
        btn.innerHTML = 'रिव्यू छुपाएं';
        loadAndDisplayReviews(key);
    } else {
        section.style.display = 'none';
        const count = document.querySelectorAll('#all-reviews-display-' + key + ' .review-item').length || 0;
        btn.innerHTML = 'रिव्यू और रेटिंग देखें (' + count + ')';
    }
}

// 2. Average Rating Load
function loadAverageRating(key) {
    const ref = firebase.database().ref('reviews/' + key);
    const display = document.getElementById('average-rating-display-' + key);
    const btn = document.getElementById('toggle-btn-' + key);

    if (!display) return;

    ref.on('value', snap => {
        if (!snap.exists()) {
            display.innerHTML = '<p style="color:#999;font-size:14px;">अभी कोई रेटिंग नहीं</p>';
            if (btn) btn.innerHTML = 'रिव्यू और रेटिंग देखें (0)';
            return;
        }
        let total = 0, count = 0;
        snap.forEach(child => { total += child.val().rating; count++; });
        const avg = (total / count).toFixed(1);
        display.innerHTML = `<strong style="color:#e67e22;">⭐ \( {avg}/5</strong> <small>( \){count} रिव्यू)</small>`;
        if (btn) btn.innerHTML = 'रिव्यू और रेटिंग देखें (' + count + ')';
    });
}

// 3. All Reviews Load
function loadAndDisplayReviews(key) {
    const container = document.getElementById('all-reviews-display-' + key);
    if (!container) return;
    
    firebase.database().ref('reviews/' + key).once('value', snap => {
        container.innerHTML = '<h4 class="mt-4 mb-2 font-bold">यूज़र रिव्यू</h4>';
        if (!snap.exists()) {
            container.innerHTML += '<p style="color:#999;">अभी कोई रिव्यू नहीं है।</p>';
            return;
        }
        const reviews = [];
        snap.forEach(child => reviews.push(child.val()));
        reviews.reverse().slice(0, 10).forEach(r => {
            const date = new Date(r.timestamp).toLocaleDateString('hi-IN');
            container.innerHTML += `
                <div class="review-item border-b pb-3 mb-3">
                    <div class="flex justify-between">
                        <strong>${r.reviewer || 'किसी ने'}</strong>
                        <span style="color:#f39c12;">${'★'.repeat(r.rating)}</span>
                    </div>
                    <p class="my-1 text-sm">${r.text}</p>
                    <small class="text-gray-500">${date}</small>
                </div>`;
        });
    });
}

// 4. Star Rating Click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('star')) {
        const rating = e.target.dataset.rating;
        const starsContainer = e.target.parentElement;
        const key = starsContainer.className.split('rating-stars-')[1];
        
        document.getElementById('selected-rating-' + key).value = rating;
        starsContainer.querySelectorAll('.star').forEach(s => {
            s.style.color = (s.dataset.rating <= rating) ? '#f39c12' : '#ccc';
        });
    }
});

// 5. Submit Review
function submitReview(key) {
    const rating = document.getElementById('selected-rating-' + key)?.value;
    const text = document.getElementById('review-text-' + key)?.value.trim();
    const user = firebase.auth().currentUser;

    if (!user) return alert("पहले लॉगिन करें");
    if (!rating || rating == '0' || !text) return alert("रेटिंग और रिव्यू दोनों दें");

    const newRev = {
        rating: parseInt(rating),
        text: text,
        reviewer: user.displayName || user.phoneNumber || user.email.split('@')[0],
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    firebase.database().ref('reviews/' + key).push(newRev)
        .then(() => {
            alert("रिव्यू सबमिट हो गया!");
            document.getElementById('review-text-' + key).value = '';
            document.getElementById('selected-rating-' + key).value = '0';
            document.querySelectorAll(`.rating-stars-${key} .star`).forEach(s => s.style.color = '#ccc');
            loadAverageRating(key);
        })
        .catch(err => alert("Error: " + err.message));
}

// 6. WhatsApp
function openWhatsApp(phone) {
    window.open(`https://wa.me/91${phone}`, '_blank');
}

// 7. Card HTML
function renderProviderCard(p) {
    const key = p.key || p.id;
    return `
    <div class="bg-white rounded-lg shadow-md p-4 mb-4">
        <h4 class="text-lg font-bold text-blue-800">\( {p.name} <span class="text-sm font-normal text-gray-600">( \){p.category})</span></h4>
        <p class="text-sm text-gray-600">\( {p.area} | अनुभव: \){p.experience}</p>

        <div id="average-rating-display-${key}" class="my-3"></div>

        <div class="flex gap-2 flex-wrap mb-3">
            <button onclick="openWhatsApp('${p.phone}')" class="bg-green-600 text-white px-4 py-2 rounded text-sm">WhatsApp</button>
            <button onclick="location.href='tel:${p.phone}'" class="bg-blue-600 text-white px-4 py-2 rounded text-sm">Call Now</button>
            <button onclick="navigator.share?.({title:'\( {p.name}',text:' \){p.category} in ${p.area}'})" class="bg-gray-600 text-white px-4 py-2 rounded text-sm">Share</button>
        </div>

        <button id="toggle-btn-\( {key}" onclick="toggleReviewSection(' \){key}')" 
            class="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 text-center font-medium">
            रिव्यू और रेटिंग देखें (0)
        </button>

        <div id="review-section-${key}" style="display:none;" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-bold mb-2">अपना रिव्यू दें</h4>
            <div class="rating-stars rating-stars-${key} text-3xl mb-3">
                <span class="star" data-rating="1">★</span>
                <span class="star" data-rating="2">★</span>
                <span class="star" data-rating="3">★</span>
                <span class="star" data-rating="4">★</span>
                <span class="star" data-rating="5">★</span>
            </div>
            <input type="hidden" id="selected-rating-${key}" value="0">
            <textarea id="review-text-${key}" placeholder="अपना अनुभव लिखें..." rows="3" class="w-full border rounded p-2 mb-2"></textarea>
            <button onclick="submitReview('${key}')" class="bg-blue-600 text-white px-4 py-2 rounded">सबमिट करें</button>
            <div id="all-reviews-display-${key}" class="mt-4"></div>
        </div>
    </div>`;
}

// 8. Display All Providers
function displayServices() {
    let filtered = serviceProviders;
    const search = document.getElementById('main-search-bar')?.value.toLowerCase() || '';
    
    if (currentFilter) filtered = filtered.filter(p => p.category === currentFilter);
    if (search) filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.category.toLowerCase().includes(search) || 
        p.area.toLowerCase().includes(search)
    );

    const container = document.getElementById('mistri-list');
    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-10">कोई मिस्त्री नहीं मिला</p>';
        return;
    }

    container.innerHTML = filtered.map(p => renderProviderCard(p)).join('');

    filtered.forEach(p => {
        const key = p.key || p.id;
        loadAverageRating(key);
    });
}

// 9. Start Listening
function startFirebaseListener() {
    if (!window.providersRef) {
        console.error("providersRef not found!");
        return;
    }

    window.providersRef.on('value', snapshot => {
        serviceProviders = [];
        snapshot.forEach(child => {
            serviceProviders.push({ key: child.key, ...child.val() });
        });
        displayServices();
    });
}

// 10. Start Everything
window.onload = function() {
    setTimeout(() => {
        if (window.providersRef) {
            startFirebaseListener();
        } else {
            console.error("Firebase not loaded yet");
        }
    }, 1000);
};

    // बस ये 6 लाइनें script.js के सबसे नीचे डाल दो
function startFirebaseListener() {
    if (window.providersRef) {
        window.providersRef.on('value', snap => {
            serviceProviders = [];
            snap.forEach(child => serviceProviders.push({key: child.key, ...child.val()}));
            displayServices();
        });
    }
}
startFirebaseListener();   // ← ये लाइन डालते ही सब आ जाएगा
