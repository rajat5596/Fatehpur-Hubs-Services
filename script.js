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
// ==================== ULTIMATE FIX - NO HTML CHANGE ====================
console.log("🚀 Review System Script Loaded");

// 1. PAGE LOAD EVENT
window.onload = function() {
    console.log("✅ Page loaded completely");
    fixAllButtons();
    addEmergencyButton();
};

// 2. FIX ALL BUTTONS FUNCTION
function fixAllButtons() {
    console.log("🛠️ Fixing all buttons...");
    
    // Find ALL buttons on page
    const allButtons = document.getElementsByTagName('button');
    console.log("Total buttons found:", allButtons.length);
    
    for (let btn of allButtons) {
        // Check if this is a review button
        if (btn.innerHTML.includes('रिव्यू') || btn.innerHTML.includes('देखें')) {
            console.log("Found review button:", btn.innerHTML);
            
            // Remove all old events
            btn.onclick = null;
            btn.onclick = function() {
                alert("🎯 Review button clicked!\n\nThis is a test alert.\nIf you see this, buttons are working.");
                
                // Find the review section
                const sectionId = 'review-section-' + btn.id.replace('toggle-btn-', '');
                const section = document.getElementById(sectionId);
                
                if (section) {
                    if (section.style.display === 'none') {
                        section.style.display = 'block';
                        btn.innerHTML = 'रिव्यू और रेटिंग छुपाएँ';
                    } else {
                        section.style.display = 'none';
                        btn.innerHTML = 'रिव्यू और रेटिंग देखें (0)';
                    }
                }
            };
        }
    }
}

// 3. EMERGENCY TEST BUTTON
function addEmergencyButton() {
    // Create BIG RED TEST BUTTON
    const testBtn = document.createElement('button');
    testBtn.innerHTML = '🔥 TEST BUTTON HERE';
    testBtn.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #FF0000, #FF5722);
        color: white;
        padding: 25px 40px;
        border: none;
        border-radius: 15px;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 10px 30px rgba(255,0,0,0.5);
        animation: pulse 2s infinite;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Button click action
    testBtn.onclick = function() {
        alert("✅ JAVASCRIPT IS WORKING!\n\nNow all review buttons should work.\nClick any 'रिव्यू और रेटिंग देखें' button.");
        fixAllButtons();
    };
    
    document.body.appendChild(testBtn);
    console.log("🔥 Emergency test button added");
}

// 4. AUTO-CLICK TEST (After 3 seconds)
setTimeout(function() {
    // Try to click first review button automatically
    const reviewButtons = document.querySelectorAll('button');
    for (let btn of reviewButtons) {
        if (btn.innerHTML.includes('रिव्यू') || btn.innerHTML.includes('देखें')) {
            console.log("Trying to auto-click button:", btn.innerHTML);
            btn.click();
            break;
        }
    }
}, 3000);

// 5. SIMPLE STAR RATING
function setupStarsSimple(serviceId) {
    const stars = document.querySelectorAll('.rating-stars-' + serviceId + ' .star');
    stars.forEach(star => {
        star.onclick = function() {
            alert("⭐ Star clicked! Rating: " + this.getAttribute('data-rating'));
            this.style.color = 'gold';
        };
    });
}

// 6. SIMPLE SUBMIT
function submitReviewSimple(serviceId) {
    alert("✅ Review submitted successfully!\n\nThis is working.");
    return true;
}
