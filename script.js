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
// D. औसत रेटिंग लोड करने और डिस्प्ले करने का फ़ंक्शन
function loadAverageRating(serviceId) {
    const reviewsRef = firebase.database().ref('reviews/' + serviceId);
    
    reviewsRef.once('value', function(snapshot) {
        let totalRating = 0;
        let reviewCount = 0;

        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const review = childSnapshot.val();
                if (review.rating) {
                    totalRating += review.rating;
                    reviewCount++;
                }
            });
        }

        const avgRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;
        
        // रेटिंग डिस्प्ले अपडेट करें
        const displayElement = document.getElementById('average-rating-display-' + serviceId);
        if (displayElement) {
            displayElement.innerHTML = `
                <h4 style="margin-bottom: 5px;">कुल रेटिंग: ${avgRating} / 5 (${reviewCount} रिव्यू)</h4>
            `;
        }

        // रिव्यू बटन पर काउंट अपडेट करें
        const toggleButton = document.getElementById('toggle-btn-' + serviceId);
        if (toggleButton) {
             if (reviewCount > 0) {
                 toggleButton.innerHTML = `रिव्यू और रेटिंग देखें (${reviewCount}) ⭐ ${avgRating}`;
             } else {
                 toggleButton.innerHTML = `रिव्यू और रेटिंग देखें (0)`;
             }
        }
    });
                 }
// E. टेक्स्ट रिव्यू लोड करने और डिस्प्ले करने का फ़ंक्शन
function loadAndDisplayReviews(serviceId) {
    const reviewsRef = firebase.database().ref('reviews/' + serviceId);
    const displayContainer = document.getElementById('all-reviews-display-' + serviceId);
    
    if (!displayContainer) return;

    reviewsRef.once('value', function(snapshot) {
        let reviewsHtml = '<h4>यूज़र रिव्यू</h4>';
        
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const review = childSnapshot.val();
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                const reviewDate = review.timestamp ? new Date(review.timestamp).toLocaleDateString() : 'Unknown Date'; 

                reviewsHtml += `
                    <div style="border: 1px solid #eee; padding: 10px; margin-top: 10px; border-radius: 5px; background-color: #f9f9f9;">
                        <p style="margin: 0; font-size: 14px; color: #555;">
                            ${stars} (${review.rating}/5)
                        </p>
                        <p style="margin-top: 5px; font-weight: bold;">"${review.text}"</p>
                        <small style="color: #888;">- ${review.reviewer} | ${reviewDate}</small>
                    </div>
                `;
            });
        } else {
             reviewsHtml += `<p style="color: #888;">अभी कोई रिव्यू उपलब्ध नहीं है।</p>`;
        }
        
        displayContainer.innerHTML = reviewsHtml;
    });
}
// C. रिव्यू सेक्शन को दिखाने/छिपाने का फ़ंक्शन
function toggleReviewSection(serviceId) {
    const section = document.getElementById('review-section-' + serviceId);
    const button = document.getElementById('toggle-btn-' + serviceId);

    if (section.style.display === 'none') {
        section.style.display = 'block';
        button.textContent = 'रिव्यू और रेटिंग छुपाएँ';
        initializeRatingHandlers(serviceId); // स्टार्स को एक्टिवेट करें
        loadAndDisplayReviews(serviceId); // रिव्यू लोड करें
    } else {
        section.style.display = 'none';
        // जब छिपता है, तब रेटिंग और रिव्यू काउंट वाला टेक्स्ट वापस आ जाता है
        loadAverageRating(serviceId); 
    }
}
// B. स्टार क्लिक को हैंडल करने का फ़ंक्शन
function initializeRatingHandlers(serviceId) {
    const container = document.querySelector('.rating-stars-' + serviceId);
    if (!container) return; 

    container.querySelectorAll('.star').forEach(star => {
        if (star.getAttribute('data-handler') === 'true') return; 

        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            document.getElementById('selected-rating-' + serviceId).value = rating; 
            
            container.querySelectorAll('.star').forEach(s => {
                if (parseInt(s.getAttribute('data-rating')) <= rating) {
                    s.classList.add('rated');
                } else {
                    s.classList.remove('rated');
                }
            });
        });
        star.setAttribute('data-handler', 'true'); // हैंडलर को मार्क करें
    });
}
// A. रिव्यू सबमिट करने का फ़ंक्शन
function submitReview(serviceId) {
    const rating = document.getElementById('selected-rating-' + serviceId).value;
    const reviewText = document.getElementById('review-text-' + serviceId).value;

    if (rating == 0 || reviewText.trim() === "") {
        alert("कृपया स्टार रेटिंग दें और रिव्यू लिखें।");
        return;
    }

    const reviewsRef = firebase.database().ref('reviews/' + serviceId);
    
    const newReview = {
        rating: parseInt(rating),
        text: reviewText,
        reviewer: 'User', 
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    reviewsRef.push(newReview)
        .then(() => {
            alert("आपका रिव्यू सफलतापूर्वक सबमिट हो गया!");
            document.getElementById('review-text-' + serviceId).value = ''; 
            document.getElementById('selected-rating-' + serviceId).value = '0';
            
            // सक्सेस के बाद रेटिंग और रिव्यू को तुरंत अपडेट करें
            loadAverageRating(serviceId);
            loadAndDisplayReviews(serviceId);
        })
        .catch(error => {
            console.error("रिव्यू सबमिट करते समय त्रुटि:", error);
            alert("रिव्यू सबमिट नहीं हो सका।");
        });
}
