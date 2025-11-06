// **SCRIPT.JS - FINAL CORRECTED CODE with Firebase, Share & Jobs**

// 1. Global Variables (Firebase se data aane tak khali rakhein)
let serviceProviders = [];
let jobListings = [];
let providersLimit = 10; // ⬅️ NEW: यह नियंत्रित करता है कि एक बार में कितनी सर्विस दिखानी है

// All Categories List (Used for search screen and registration form)
const ALL_CATEGORIES = [
    { cat: 'Plumber', icon: '💧' },
    { cat: 'Electrician', icon: '⚡' },
    { cat: 'Carpenter', icon: '🔨' },
    { cat: 'Mason', icon: '🧱' },
    { cat: 'Painter', icon: '🎨' },
    { cat: 'AC Mechanic', icon: '❄️' },
    { cat: 'TV Mechanic', icon: '📺' },
    { cat: 'Tiler', icon: '◻️' },
    { cat: 'Private Teacher', icon: '🎓' },
    { cat: 'Welder', icon: '🔥' },
    { cat: 'Computer Repair', icon: '💻' }
];


// **FIREBASE DATA LISTENER FUNCTION (Called from index.html)**
function startFirebaseListener(providersRef, jobsRef) { 
    console.log("Starting Firebase Listeners...");

    // पुराने SERVICES_PER_BATCH और lastKey को हटा दिया गया है।
    // loadMoreBtn और serviceListElement अब loadServiceProviders फ़ंक्शन के अंदर मिलेंगे।
    
    // 2. Jobs Listener (New)
    jobsRef.on('value', (snapshot) => {
        jobListings = []; 
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const job = childSnapshot.val();
                job.id = childSnapshot.key;
                jobListings.push(job);
            });
        }
        loadJobListings();
    });

    // 3. Service Providers Listener
    providersRef.on('value', (snapshot) => {
        serviceProviders = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const provider = childSnapshot.val();
                if (provider) serviceProviders.push(provider);
            });
            // ⭐️ UPDATE: providersLimit का उपयोग करके सर्विस लोड करें
            loadServiceProviders('mistri-list');
            loadServiceProviders('mistri-list-full'); // For search screen
        } else {
            // यह सुनिश्चित करने के लिए कि listDiv मौजूद है:
            const listHome = document.getElementById('mistri-list');
            if(listHome) listHome.innerHTML = '<p style="text-align: center; color: #666;">No services registered yet.</p>';
        }
    });

    // Anonymous Login (StartFirebaseListener में अनावश्यक, इसे अंत में रखा गया है)
}


// Initialize services on page load
document.addEventListener('DOMContentLoaded', function() {
    
    loadAllCategories();
    populateRegistrationCategories(); // Loads categories into the registration form select dropdown
    
    // Add event listeners to category buttons on Home Screen
    document.querySelectorAll('#mistri-categories .cat-btn').forEach(button => {
        if(button.id !== 'more-cat-btn') {
            button.addEventListener('click', (e) => {
                // Remove selected class from all buttons
                document.querySelectorAll('#mistri-categories .cat-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // Add selected class to clicked button
                e.target.classList.add('selected');
                
                // Filter services by category
                const category = e.target.dataset.cat;
                filterByCategory(category, 'mistri-list');
            });
        }
    });
    
     // Add search event listener 
     document.getElementById('main-search-bar').addEventListener('input', searchProviders);
     
     // Form event listener (बग फिक्स के लिए यहाँ जोड़ा गया है)
     const regForm = document.getElementById('service-registration-form');
     if(regForm) regForm.addEventListener('submit', handleServiceRegistration);
     
     const jobForm = document.getElementById('job-posting-form');
     if(jobForm) jobForm.addEventListener('submit', postJob);
});

// ✅ LOAD SERVICES (पूरा फ़ंक्शन बदलें - 10/10 लॉजिक)
function loadServiceProviders(listId) {
    const mistriListDiv = document.getElementById(listId);
    const loadMoreBtn = document.getElementById('loadMoreButton'); 
    
    if (!mistriListDiv) return;
    
    // Providers को हाल ही के अनुसार सॉर्ट करें (अच्छा रहता है)
    const sortedProviders = serviceProviders.sort((a, b) => b.timestamp - a.timestamp); 
    
    // ⭐️ बदलाव: केवल लिमिट के अनुसार सर्विस दिखाएँ (पहले 10, फिर 20, 30...)
    const providersToShow = sortedProviders.slice(0, providersLimit);
    
    // List का शीर्षक सेट करें और उसे खाली करें
    mistriListDiv.innerHTML = listId === 'mistri-list' ? '<h3>Available Services</h3>' : '';
    
    if (providersToShow.length === 0) {
        mistriListDiv.innerHTML += '<p style="text-align: center; color: #666; padding: 15px;">No services available.</p>';
    } else {
        providersToShow.forEach(provider => {
            const card = createProfileCard(provider);
            mistriListDiv.appendChild(card);
        });
    }

    // ⭐️ बदलाव: "Load More" बटन को नियंत्रित करें (केवल Home Screen की लिस्ट के लिए)
    if (listId === 'mistri-list' && loadMoreBtn) {
        if (serviceProviders.length > providersLimit) {
            loadMoreBtn.style.display = 'block'; 
        } else {
            loadMoreBtn.style.display = 'none'; 
        }
    }
}

// Helper function to create a profile card (Includes SHARE option)
function createProfileCard(provider) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    // आपकी रेटिंग फील्ड 'New' हो सकती है।
    const displayRating = provider.rating && provider.rating !== 'New' ? provider.rating : ''; 

    card.innerHTML = `
        <h3>${provider.name} ${displayRating}</h3>
        <p><strong>${provider.category}</strong> | ${provider.area}</p>
        <p>Experience: ${provider.experience}</p>
        <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="contact-btn" onclick="callNumber('${provider.phone}')">
                📞 Call Now
            </button>
            <button class="whatsapp-btn" onclick="openWhatsApp('${provider.phone}')">
                💬 WhatsApp
            </button>
            <button class="share-btn-inline" onclick="shareProvider('${provider.name}', '${provider.category}', '${provider.phone}')">
                📤 Share
            </button>
        </div>
    `;
    return card;
}

// Direct Call Function
function callNumber(phone) {
    window.location.href = `tel:+91${phone}`;
}

// WhatsApp Function
function openWhatsApp(phone) {
    const message = "Hello, I need your service from Fatehpur Hubs app. Please contact me.";
    // Note: wa.me requires the country code (91)
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

// Share App Function (Play Store Link)
function shareApp() {
    const appLink = "https://play.google.com/store/apps/details?id=in.co.fatehpur.hubs"; 
    
    if (navigator.share) {
        navigator.share({
            title: 'Fatehpur Hubs - Local Services App',
            text: 'Fatehpur ki sabhi local services ek hi jagah! Abhi download karein.',
            url: appLink, 
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
        // Fallback for desktop (opens WhatsApp with the message)
        const shareText = `Fatehpur Hubs - Local Services App\nFatehpur ki sabhi local services ek hi jagah! Abhi download karein:\n${appLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
}


// NEW FUNCTION for Provider Share
function shareProvider(name, category, phone) {
    const message = `✨ Fatehpur Hubs Par ${category} Service!\n\n👨‍🔧 Naam: ${name}\n📞 Phone: ${phone}\n\nFatehpur mein sabhi local services ke liye app download karein।`;
    
    if (navigator.share) {
        navigator.share({
            title: `Service Provider: ${name}`,
            text: message,
            url: window.location.href 
        });
    } else {
        // Fallback for desktop/old browsers (opens WhatsApp with the message)
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
}


// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.classList.add('active');
    }
}

// Category Functions for Search Screen
function loadAllCategories() {
    const allCatList = document.getElementById('all-categories-list');
    if (!allCatList) return;
    allCatList.innerHTML = '';
    
    ALL_CATEGORIES.forEach(item => {
        const button = document.createElement('button');
        button.className = 'cat-btn';
        button.dataset.cat = item.cat;
        button.innerHTML = `${item.icon} ${item.cat}`;
        button.addEventListener('click', (e) => {
            // Remove selected class from all buttons
            document.querySelectorAll('#all-categories-list .cat-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            e.target.classList.add('selected');
            
            filterByCategory(e.target.dataset.cat, 'mistri-list-full');
        });
        allCatList.appendChild(button);
    });
}

// FUNCTION: Populate Registration Form Categories (for the <select> dropdown)
function populateRegistrationCategories() {
    const select = document.getElementById('reg-category');
    if (!select) return;

    select.innerHTML = '<option value="">-- Service Category Chunein (कैटेगरी) --</option>';
    
    ALL_CATEGORIES.forEach(item => {
        const option = document.createElement('option');
        option.value = item.cat;
        option.textContent = `${item.icon} ${item.cat}`;
        select.appendChild(option);
    });
}

function filterByCategory(category, listId) {
    const mistriListDiv = document.getElementById(listId);
    if (!mistriListDiv) return;
    
    // Home Screen पर फिल्टर करने पर Load More बटन को छुपा दें
    if(listId === 'mistri-list') {
        const loadMoreBtn = document.getElementById('loadMoreButton');
        if(loadMoreBtn) loadMoreBtn.style.display = 'none';
    }

    mistriListDiv.innerHTML = `<h3>${category} Services</h3>`;
    
    const filteredProviders = category === 'All' 
        ? serviceProviders 
        : serviceProviders.filter(p => p.category === category);
    
    if (filteredProviders.length === 0) {
        mistriListDiv.innerHTML += '<p style="color:red; text-align: center; padding: 20px;">Is category mein abhi koi service available nahi hai.</p>';
        return;
    }

    // यहाँ फिल्टर होने के बाद सभी सर्विस दिखेंगी (10/10 लॉजिक फिल्टर पर लागू नहीं होता)
    filteredProviders.forEach(provider => {
        const card = createProfileCard(provider);
        mistriListDiv.appendChild(card);
    });
}

// ✅ HANDLE SERVICE REGISTRATION (बग फिक्स: Duplicates और Proper Firebase Save)
function handleServiceRegistration(e) {
    if (e) e.preventDefault(); 
    
    const providersRef = window.providersRef; // ग्लोबल ऑब्जेक्ट से Firebase ref लें
    if (!providersRef) {
        alert("Firebase connection error. Please try again.");
        return;
    }
    
    const name = document.getElementById('providerName').value.trim();
    const phone = document.getElementById('providerPhone').value.trim();
    const category = document.getElementById('serviceCategory').value;
    const area = document.getElementById('providerArea').value.trim();
    const experience = document.getElementById('providerExperience').value.trim();
    
    if (!name || !phone || !category || !area || !experience) {
        alert('Please fill all fields'); 
        return;
    }
    
    if (phone.length !== 10 || isNaN(phone)) {
        alert('Enter valid 10-digit phone number');
        return;
    }
    
    const submitBtn = document.getElementById('registerBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Checking...';
    submitBtn.disabled = true;
    
    // DUPLICATE CHECK
    providersRef.orderByChild('phone').equalTo(phone).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                alert('❌ This phone number is already registered! One phone can register only once.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return; 
            } 
            
            // DUPLICATE CHECK PASSED: Add new data to Firebase
            const providerData = {
                name: name,
                phone: phone,
                category: category,
                area: area,
                experience: experience,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                rating: '⭐️⭐️⭐️⭐️' // Default Rating
            };

            return providersRef.push(providerData);
        })
        .then(() => {
            alert('✅ Service Registered Successfully! We will review and publish it soon.');
            document.getElementById('service-registration-form').reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            showScreen('home-screen'); // Home screen पर वापस जाएँ
        })
        .catch((error) => {
            console.error("Registration Error:", error);
            alert('An error occurred during registration. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}


// Search Functionality (यह अब सही mistri-list पर सर्च रिजल्ट दिखाएगा)
function searchProviders(e) {
    const searchTerm = e.target.value.toLowerCase();
    const mistriListDiv = document.getElementById('mistri-list');
    const loadMoreBtn = document.getElementById('loadMoreButton');

    mistriListDiv.innerHTML = '<h3>Search Results</h3>';
    if(loadMoreBtn) loadMoreBtn.style.display = 'none'; // सर्च के दौरान लोड मोर बटन छुपाएँ
    
    const filtered = serviceProviders.filter(provider => 
        provider.name.toLowerCase().includes(searchTerm) ||
        provider.category.toLowerCase().includes(searchTerm) ||
        provider.area.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length === 0) {
        mistriListDiv.innerHTML += '<p style="color:red; text-align: center; padding: 20px;">Koi service nahi mili.</p>';
        return;
    }

    filtered.forEach(provider => {
        const card = createProfileCard(provider);
        mistriListDiv.appendChild(card);
    });
}


// **********************************************
// ********* LOCAL JOBS FUNCTIONALITY ***********
// **********************************************

// Function to load job listings
function loadJobListings() {
    const jobListDiv = document.getElementById('job-listings');
    if (!jobListDiv) return;

    jobListDiv.innerHTML = ''; 

    if (jobListings.length === 0) {
        jobListDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 15px;">Currently no job postings available.</p>';
        return;
    }

    // Newest job first
    // Note: jobListings array Firebase Listener में भरा जा रहा है, वहाँ key नहीं आ रही थी।
    // Fix: Firebase Listener में key जोड़ी गई है।
    
    const sortedJobs = jobListings.sort((a, b) => b.timestamp - a.timestamp);

    sortedJobs.forEach(job => { 
        const card = createJobCard(job);
        jobListDiv.appendChild(card);
    });
}

// Helper function to create a job card
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'profile-card job-card'; 
    card.style.marginBottom = '15px';
    
    // Contact information extraction is complex. We will display it directly and rely on user input.
    const contactDisplay = job.contact.includes('tel:') ? job.contact.replace('tel:', '') : job.contact;
    const phoneNumber = contactDisplay.match(/\d{10}/);
    const validPhone = phoneNumber ? phoneNumber[0] : null;

    card.innerHTML = `
        <h4 style="color: #2a5298; font-weight: bold;">${job.title}</h4>
        <p style="margin-bottom: 5px;">📍 **Location:** ${job.location}</p>
        <p style="margin-bottom: 10px;">${job.description}</p>
        <div style="font-size: 14px; color: #666;">
            Posted: ${new Date(job.timestamp).toLocaleDateString('en-IN')}
        </div>
        <div style="margin-top: 10px;">
            <button class="contact-btn" style="background: #e91e63;" onclick="${validPhone ? `callNumber('${validPhone}')` : `alert('Valid number not found')`}">
                📞 Call Contact
            </button>
            <button class="whatsapp-btn" onclick="${validPhone ? `openWhatsAppForJob('${validPhone}', '${job.title}')` : `alert('Valid number not found')`}">
                💬 Message
            </button>
        </div>
    `;
    return card;
}

// WhatsApp for Job Function
function openWhatsAppForJob(phone, jobTitle) {
    const message = `Hello, I saw your job posting "${jobTitle}" on Fatehpur Hubs and am interested. Please tell me more about the job.`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

// Function to post a new job
function postJob(e) {
    if (e) e.preventDefault();

    const jobsRef = window.jobsRef; 
    if (!jobsRef) {
        alert("Firebase connection error. Cannot post job.");
        return;
    }

    const title = document.getElementById('jobTitle').value.trim();
    const description = document.getElementById('jobDescription').value.trim();
    const contact = document.getElementById('jobContact').value.trim();
    const location = document.getElementById('jobLocation').value.trim();
    const postJobBtn = document.getElementById('postJobBtn');

    if (!title || !description || !contact || !location) {
        alert("Please fill all job posting fields.");
        return;
    }
    
    if (contact.length < 10) { // Simple validation
        alert("Please enter a valid contact (Phone or Email).");
        return;
    }


    postJobBtn.textContent = 'Posting...';
    postJobBtn.disabled = true;

    const newJob = {
        title: title,
        description: description,
        contact: contact,
        location: location,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    jobsRef.push(newJob)
        .then(() => {
            alert('✅ Job Posted Successfully!');
            postJobBtn.textContent = 'Post Job';
            postJobBtn.disabled = false;
            // Clear form and go to job screen
            document.getElementById('job-posting-form').reset();
            showScreen('jobs-screen'); 
        })
        .catch(error => {
            alert('❌ Error posting job. Try again.');
            postJobBtn.textContent = 'Post Job';
            postJobBtn.disabled = false;
            console.error("Error posting job: ", error);
        });
}


// ⭐️ NEW FUNCTION: Load 10 more services (loadNextBatch की जगह)
window.loadMoreServices = function() {
    const loadMoreBtn = document.getElementById('loadMoreButton');
    if (loadMoreBtn) {
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;
    }

    providersLimit += 10; // लिमिट 10 बढ़ाएँ
    
    setTimeout(() => {
        // 'mistri-list' ID के लिए लोड फ़ंक्शन को कॉल करें
        loadServiceProviders('mistri-list');
        
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'और सेवाएं लोड करें (Load More Services)';
            loadMoreBtn.disabled = false;

            if (serviceProviders.length <= providersLimit) {
                loadMoreBtn.style.display = 'none';
            }
        }
    }, 100);
}


// Initialize Firebase (ये लाइनें कोड के अंत में ही रहनी चाहिए)
// Note: firebaseConfig variable को index.html में परिभाषित किय
