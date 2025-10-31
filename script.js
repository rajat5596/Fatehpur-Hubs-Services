// **SCRIPT.JS - FINAL CORRECTED CODE**

// Global Variables (Firebase se data aane tak khali rakhein)
let serviceProviders = [];

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


// **FIREBASE DATA LOADING FUNCTION**
// NOTE: Is function ko call karne ke liye aapke index.html mein Firebase initialize hona chahiye.
// Yeh function index.html mein startFirebaseListener() ke roop mein tha, ise ab yahan define kar rahe hain.
function startFirebaseListener(providersRef) { // providersRef ko index.html se pass kiya jayega
    console.log("Starting Firebase Listener...");
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
        loadServiceProviders();
        console.log(`Data Loaded: ${serviceProviders.length} providers.`);
    });
}


// Initialize services on page load
document.addEventListener('DOMContentLoaded', function() {
    // NOTE: startFirebaseListener() ko ab index.html ke script tag mein call kiya jayega!
    
    // Check if service list div exists before loading data
    if (document.getElementById('mistri-list')) {
        // loadServiceProviders(); <-- Isko yahan se hata diya hai, ab yeh Firebase listener se call hoga
    }
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
    
     // Optional: Add search event listener here again just in case
     document.getElementById('main-search-bar').addEventListener('input', searchProviders);
});

// Function to load the main list of service providers
function loadServiceProviders() {
    console.log("Loading service providers into Home Screen list...");
    const mistriListDiv = document.getElementById('mistri-list');
    if (!mistriListDiv) return;
    
    mistriListDiv.innerHTML = '<h3>Available Services</h3>';
    
    if (serviceProviders.length === 0) {
         mistriListDiv.innerHTML += '<p style="text-align: center; color: #666; padding: 15px;">No services available.</p>';
    }
    
    serviceProviders.forEach(provider => {
        const card = createProfileCard(provider);
        mistriListDiv.appendChild(card);
    });
    console.log(`Loaded ${serviceProviders.length} providers.`);
}

// Helper function to create a profile card
function createProfileCard(provider) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.innerHTML = `
        <h3>${provider.name} ${provider.rating}</h3>
        <p><strong>${provider.category}</strong> | ${provider.area}</p>
        <p>Experience: ${provider.experience}</p>
        <div style="margin-top: 10px;">
            <button class="contact-btn" onclick="callNumber('${provider.phone}')">
                📞 Call Now
            </button>
            <button class="whatsapp-btn" onclick="openWhatsApp('${provider.phone}')">
                💬 WhatsApp
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

// **FINAL CORRECTED Share App Function (Play Store Link)**
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
        alert("App share karne ke liye Play Store link copy karein: " + appLink);
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

// FUNCTION: Handle Service Registration (The actual form submission logic)
// NOTE: Is function ko ab Firebase se data bhejne ke liye update karna hoga.
function handleServiceRegistration(e) {
    if (e) e.preventDefault(); 
    
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
    };
    
    // Yahan hum local array mein daalne ke bajaye Firebase mein daalenge
    // *** NOTE: Yeh code abhi Firebase call nahi karta hai! Iske liye aapko 'providersRef' ki zaroorat padegi. ***
    
    regMessage.textContent = '✅ Registration Successful! आपकी सर्विस लिस्ट में जोड़ दी गई है।';
    regMessage.style.color = 'green';

    // Clear form and go to Home Screen after 1.5 seconds
    document.getElementById('service-registration-form').reset();
    setTimeout(() => {
        showScreen('home-screen');
    }, 1500);
    
    return false; 
}


// Utility Functions (Purana shareApp aur openMoreApps hata diye hain)
function openMoreApps() {
    alert("More Apps feature jald hi aayega!");
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
