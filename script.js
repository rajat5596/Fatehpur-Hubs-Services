// **SCRIPT.JS - FINAL CORRECTED CODE with Firebase, Share & Jobs**

// Global Variables (Firebase se data aane tak khali rakhein)
let serviceProviders = [];
let jobListings = [];

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
    { cat: 'Computer Repair', icon: '💻' },
    { cat: 'Beautician', icon: '💅' },
    { cat: 'Home Cleaning', icon: '🧹' },
    { cat: 'Security Guard', icon: '🛡️' },
    { cat: 'Laundry Service', icon: '🧺' },
    { cat: 'Legal Consultant', icon: '⚖️' }
];


// **FIREBASE DATA LISTENER FUNCTION (Called from index.html)**
// providersRef aur jobsRef ko index.html se pass kiya jayega
function startFirebaseListener(providersRef, jobsRef) { 
    console.log("Starting Firebase Listeners...");
    
    // 1. Service Providers Listener
    providersRef.on('value', (snapshot) => {
        const data = snapshot.val();
        serviceProviders = []; // Array ko har baar khali karein
        if (data) {
            for (let key in data) {
                let provider = data[key];
                provider.id = key; 
                serviceProviders.push(provider);
            }
        }
        // Data load hone ke baad hi list ko update karein
        loadServiceProviders('mistri-list');
        console.log(`Providers Loaded: ${serviceProviders.length}`);
    });

    // 2. Jobs Listener (New)
    jobsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        jobListings = []; // Array ko har baar khali karein
        if (data) {
            for (let key in data) {
                let job = data[key];
                job.id = key;
                jobListings.push(job);
            }
        }
        loadJobListings();
        console.log(`Jobs Loaded: ${jobListings.length}`);
    });
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
});

// Function to load the main list of service providers
function loadServiceProviders(listId) {
    const mistriListDiv = document.getElementById(listId);
    if (!mistriListDiv) return;
    
    mistriListDiv.innerHTML = '<h3>Available Services</h3>';
    
    if (serviceProviders.length === 0) {
         mistriListDiv.innerHTML += '<p style="text-align: center; color: #666; padding: 15px;">No services available.</p>';
    }
    
    serviceProviders.forEach(provider => {
        const card = createProfileCard(provider);
        mistriListDiv.appendChild(card);
    });
}

// Helper function to create a profile card (Includes SHARE option)
function createProfileCard(provider) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.innerHTML = `
        <h3>${provider.name} ${provider.rating}</h3>
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
    mistriListDiv.innerHTML = `<h3>${category} Services</h3>`;
    
    const filteredProviders = category === 'All' 
        ? serviceProviders 
        : serviceProviders.filter(p => p.category === category);
    
    if (filteredProviders.length === 0) {
        mistriListDiv.innerHTML += '<p style="color:red; text-align: center; padding: 20px;">Is category mein abhi koi service available nahi hai.</p>';
        return;
    }

    filteredProviders.forEach(provider => {
        const card = createProfileCard(provider);
        mistriListDiv.appendChild(card);
    });
}

// FUNCTION: Handle Service Registration (Saves data to Firebase)
function handleServiceRegistration(e) {
    if (e) e.preventDefault(); 
    
    // Get providersRef from the global window object (set in index.html)
    const providersRef = window.providersRef;
    if (!providersRef) {
        console.error("Firebase providers reference not found.");
        return;
    }
    
    const regMessage = document.getElementById('registration-message');
    regMessage.textContent = 'Submitting... (जमा हो रहा है...)';
    regMessage.style.color = '#2a5298';
    
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const category = document.getElementById('reg-category').value;
    const area = document.getElementById('reg-area').value.trim();
    const experience = document.getElementById('reg-experience').value.trim();
    
    if (!name || !phone || !category || !area || !experience) {
        regMessage.textContent = '❌ Please fill all fields (कृपया सभी फ़ील्ड भरें).';
        regMessage.style.color = 'red';
        return false;
    }
    
    const newProvider = {
        name: name,
        category: category,
        phone: phone,
        area: area,
        experience: experience,
        rating: "New", 
        timestamp: firebase.database.ServerValue.TIMESTAMP 
    };
    
    // Save to Firebase
    providersRef.push(newProvider)
        .then(() => {
            regMessage.textContent = '✅ Registration Successful! आपकी सर्विस लिस्ट में जोड़ दी गई है।';
            regMessage.style.color = 'green';

            // Clear form and go to Home Screen after 1.5 seconds
            document.getElementById('service-registration-form').reset();
            setTimeout(() => {
                showScreen('home-screen');
            }, 1500);
        })
        .catch(error => {
            regMessage.textContent = `❌ Error: ${error.message}`;
            regMessage.style.color = 'red';
            console.error("Error registering service provider: ", error);
        });
    
    return false; 
}


// Search Functionality
function searchProviders(e) {
    const searchTerm = e.target.value.toLowerCase();
    const mistriListDiv = document.getElementById('mistri-list');
    mistriListDiv.innerHTML = '<h3>Search Results</h3>';
    
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
    jobListings.reverse().forEach(job => { 
        const card = createJobCard(job);
        jobListDiv.appendChild(card);
    });
}

// Helper function to create a job card
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'profile-card job-card'; // Reusing profile-card style
    card.style.marginBottom = '15px';
    card.innerHTML = `
        <h4 style="color: #2a5298; font-weight: bold;">${job.title}</h4>
        <p style="margin-bottom: 5px;">📍 **Location:** ${job.location}</p>
        <p style="margin-bottom: 10px;">${job.description}</p>
        <div style="font-size: 14px; color: #666;">
            Posted: ${new Date(job.timestamp).toLocaleDateString('en-IN')}
        </div>
        <div style="margin-top: 10px;">
            <button class="contact-btn" style="background: #e91e63;" onclick="callNumber('${job.contact.match(/\d+/)[0]}')">
                📞 Call Contact
            </button>
            <button class="whatsapp-btn" onclick="openWhatsAppForJob('${job.contact}', '${job.title}')">
                💬 Message
            </button>
        </div>
    `;
    return card;
}

// WhatsApp for Job Function
function openWhatsAppForJob(contactInfo, jobTitle) {
    // Attempt to extract only the phone number
    const phoneMatch = contactInfo.match(/\d{10}/); // Assuming 10-digit Indian number
    const phone = phoneMatch ? phoneMatch[0] : null;

    if (!phone) {
        // Since we cannot use alert(), log error to console for debug
        console.error("Contact number not clearly found. Please dial manually: " + contactInfo);
        // Fallback UI message (if implemented) is better than nothing
        return;
    }

    const message = `Hello, I saw your job posting "${jobTitle}" on Fatehpur Hubs and am interested. Please tell me more about the job.`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

// Function to post a new job
function postJob(e) {
    if (e) e.preventDefault();

    // Get jobsRef from the global window object (set in index.html)
    const jobsRef = window.jobsRef; 
    if (!jobsRef) {
        console.error("Firebase jobs reference not found.");
        document.getElementById('postJobBtn').textContent = '❌ Error posting job.';
        return;
    }

    const title = document.getElementById('jobTitle').value.trim();
    const description = document.getElementById('jobDescription').value.trim();
    const contact = document.getElementById('jobContact').value.trim();
    const location = document.getElementById('jobLocation').value.trim();
    const postJobBtn = document.getElementById('postJobBtn');

    if (!title || !description || !contact || !location) {
        // Since we cannot use alert(), log error to console for debug
        console.error("Please fill all job posting fields.");
        return false;
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
            postJobBtn.textContent = '✅ Job Posted!';
            setTimeout(() => {
                postJobBtn.textContent = 'Post Job';
                postJobBtn.disabled = false;
                document.getElementById('jobTitle').value = '';
                document.getElementById('jobDescription').value = '';
                document.getElementById('jobContact').value = '';
                document.getElementById('jobLocation').value = '';
                // The job listener will automatically reload the job listings
            }, 1500);
        })
        .catch(error => {
            postJobBtn.textContent = '❌ Error posting job. Try again.';
            postJobBtn.disabled = false;
            console.error("Error posting job: ", error);
        });

    return false;
}
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = app.database();

// ✅ ANONYMOUS AUTHENTICATION ADD KAREIN
firebase.auth().signInAnonymously()
    .then(() => {
        console.log("User automatically signed in anonymously");
    })
    .catch(error => {
        console.log("Auth error:", error);
    });
// --- 1. CONFIGURATION ---

// APNI ASLI FIREBASE CONFIG YAHAN DAALEIN. 
// Ye keys aapko Firebase Console se milengi.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE", 
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- 2. INITIALIZATION ---

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Global variables for verification process
let recaptchaVerifier;
let confirmationResult;

// --- 3. UI ELEMENT REFERENCES ---

const mobilePhase = document.getElementById('mobile-phase');
const otpPhase = document.getElementById('otp-phase');
const successScreen = document.getElementById('success-screen');
const mobileInput = document.getElementById('mobile-input');
const otpInput = document.getElementById('otp-input');
const sendButton = document.getElementById('send-otp-button');
const verifyButton = document.getElementById('verify-otp-button');
const messageArea = document.getElementById('message-area');
const otpMessageArea = document.getElementById('otp-message-area');


// --- 4. CORE FUNCTIONS ---

/**
 * RecaptchaVerifier set up karega. Yeh web par Phone Auth ke liye mandatory hai.
 * Use tab call karna hai jab page load ho jaye.
 */
function setupRecaptcha() {
    try {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'normal', // Can be 'invisible' or 'normal'
            'callback': (response) => {
                // reCAPTCHA solved, proceed with phone number submission
                console.log("Recaptcha verified.");
                sendOTP();
            },
            'expired-callback': () => {
                // Recaptcha expired.
                console.log("Recaptcha expired.");
                messageArea.textContent = '❌ Verification expire ho gaya. Phir se koshish karein.';
                sendButton.disabled = false;
            }
        }, auth);
        window.recaptchaVerifier.render(); // Recaptcha ko render karein
    } catch (e) {
        console.error("Recaptcha Setup Error:", e);
        messageArea.textContent = '❌ Recaptcha load nahi ho paya. Internet check karein.';
        sendButton.disabled = true;
    }
}

/**
 * Mobile number check karega aur OTP bhejega.
 */
async function sendOTP() {
    const mobileNumber = mobileInput.value.trim();
    if (mobileNumber.length !== 10) {
        messageArea.textContent = '❌ कृपया सही 10 अंकों का मोबाइल नंबर डालें।';
        return;
    }
    
    // International format mein convert karein
    const phoneNumber = '+91' + mobileNumber;

    sendButton.disabled = true;
    sendButton.textContent = 'OTP भेजा जा रहा है...';
    messageArea.textContent = '';
    
    try {
        const verifier = window.recaptchaVerifier;
        if (!verifier) {
             messageArea.textContent = '❌ Recaptcha ready nahi hai. Phir se koshish karein.';
             return;
        }

        confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, verifier);
        
        // Success: Transition to OTP input phase
        mobilePhase.classList.add('hidden');
        otpPhase.classList.remove('hidden');
        otpMessageArea.textContent = `✅ OTP आपके नंबर ${mobileNumber} पर सफलतापूर्वक भेजा गया है।`;
        
    } catch (error) {
        console.error("OTP Sending Error:", error);
        
        let displayError = 'OTP bhejte samay error aaya. Kripya doobara koshish karein.';
        if (error.code === 'auth/missing-phone-number') {
            displayError = 'Mobile Number galti se khali reh gaya.';
        } else if (error.code === 'auth/invalid-phone-number') {
            displayError = 'Mobile Number ka format galat hai.';
        } else if (error.code === 'auth/too-many-requests') {
            displayError = 'Bahut zyada requests ho gayi hain. Kripya thodi der baad koshish karein.';
        }

        messageArea.textContent = `❌ Error: ${displayError}`;
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = 'OTP भेजें';
    }
}

/**
 * OTP check karega aur login complete karega.
 */
async function verifyOTP() {
    const otp = otpInput.value.trim();
    if (otp.length !== 6) {
        otpMessageArea.textContent = '❌ कृपया 6 अंकों का OTP डालें।';
        return;
    }

    verifyButton.disabled = true;
    verifyButton.textContent = 'Verify हो रहा है...';
    otpMessageArea.textContent = '';
    
    try {
        // Confirmation Result ka use karke OTP verify karein
        await confirmationResult.confirm(otp);
        
        // Success: User is now signed in
        const user = auth.currentUser;
        console.log("User successfully signed in. UID:", user.uid);

        // Success screen dikhayein
        otpPhase.classList.add('hidden');
        successScreen.classList.remove('hidden');

    } catch (error) {
        console.error("OTP Verification Error:", error);
        let displayError = 'OTP verification mein error. Kripya sahi OTP daalein.';

        if (error.code === 'auth/invalid-verification-code') {
             displayError = 'Galat OTP daala gaya hai.';
        } else if (error.code === 'auth/code-expired') {
             displayError = 'OTP expire ho gaya hai. Phir se bhejhein.';
        }

        otpMessageArea.textContent = `❌ Error: ${displayError}`;
    } finally {
        verifyButton.disabled = false;
        verifyButton.textContent = 'OTP Verify करें';
    }
}

/**
 * Login process ko shuru se reset karega.
 */
window.resetLogin = () => {
    mobilePhase.classList.remove('hidden');
    otpPhase.classList.add('hidden');
    messageArea.textContent = '';
    otpMessageArea.textContent = '';
    otpInput.value = '';
    // Recaptcha ko reset karna zaroori hai
    if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        setupRecaptcha(); // Recaptcha ko dobara render karein
    }
}

// --- 5. EVENT LISTENERS (HTML se linked) ---

// Page load hone par Recaptcha set up karein
window.onload = setupRecaptcha;

// Buttons ko functions se jod dein
sendButton.addEventListener('click', sendOTP);
verifyButton.addEventListener('click', verifyOTP);

// Mobile input par Enter key dabane par OTP bhej dein
mobileInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendOTP();
    }
});

// OTP input par Enter key dabane par verify karein
otpInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyOTP();
    }
});
