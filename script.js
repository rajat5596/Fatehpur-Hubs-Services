// Global array: Yahaan aapko apna saara maujooda data paste karna hai
const serviceProviders = [
    // Kripya yahaan apna saara maujooda (existing) provider data paste karein:
    // Example: { name: "Suresh", category: "Plumber", phone: "9876543210", area: "Fatehpur", experience: "10 Years", rating: "⭐️⭐️⭐️⭐️" },
    // Example: { name: "Raju", category: "Electrician", phone: "9792722000", area: "Fatehpur", experience: "5 Years", rating: "⭐️⭐️⭐️" },
    // ... Aur baaki sabhi providers ...
];


// --- SCREEN MANAGEMENT ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });

    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.classList.remove('hidden');
        activeScreen.classList.add('active');
        
        if (screenId === 'home-screen') {
            loadServiceProviders('mistri-list');
            // Old loadMistrisFromFirebase code hata diya gaya hai
        } else if (screenId === 'search-screen') {
            loadAllCategories();
            loadServiceProviders('mistri-list-full');
            // Old loadMistrisFromFirebase code hata diya gaya hai
        }
    }
}

// --- INITIALIZATION (App Load Hone Par) ---
document.addEventListener('DOMContentLoaded', () => {
    // Show login screen ya home screen (jo aapka default ho)
    // showScreen('login-screen'); // Agar login se shuru karna hai
    showScreen('home-screen'); // Seedhe home screen se shuru karein
});

/*
// --- AUTHENTICATION (OTP) LOGIC ---
// OTP aur Firebase Auth functions yahaan comments mein hain. 
// Agar aapne Firebase setup kiya hai, toh inhein '/*' aur '*/' hata kar use kar sakte hain
// Abhi Registration button chalane ke liye inhein ignore kar rahe hain

function initializeRecaptcha() { /* ... */ }
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const phoneNumberInput = document.getElementById('phone-number');
const otpCodeInput = document.getElementById('otp-code');
const loginError = document.getElementById('login-error');

// sendOtpBtn.addEventListener('click', async () => { /* ... */ }); 
// verifyOtpBtn.addEventListener('click', async () => { /* ... */ });
*/


// --- SERVICE REGISTRATION LOGIC (Final Working Function) ---
function registerService() {
    // 1. Inputs ki values lena
    const name = document.getElementById('providerName').value;
    const phone = document.getElementById('providerPhone').value;
    const category = document.getElementById('serviceCategory').value;
    const area = document.getElementById('providerArea').value;
    const experience = document.getElementById('providerExperience').value;
    
    // 2. Validation check
    if (!name || !phone || !category || !area || !experience) {
        alert('❌ Kripya sabhi fields bharein।');
        return;
    }
    
    // 3. Naya Provider Object banana
    const newProvider = {
        name: name,
        category: category,
        phone: phone,
        area: area,
        experience: experience, 
        rating: "⭐️⭐️⭐️⭐️"
    };
    
    // 4. Global array mein naya data jodna
    serviceProviders.push(newProvider);
    
    // 5. Success message aur Page Reload
    alert('✅ Service registered successfully! Ab aapki service list mein dikhegi।');
    
    // Services list ko refresh karne ke liye, hum page ko reload kar denge
    window.location.reload(); 
}


// --- LOADER AND FILTER LOGIC ---
function loadServiceProviders(listId = 'mistri-list', filter = 'All') {
    const listElement = document.getElementById(listId);
    if (!listElement) return;

    listElement.innerHTML = ''; // List ko khali karein

    const filteredProviders = serviceProviders.filter(provider => {
        return filter === 'All' || provider.category === filter;
    });

    if (filteredProviders.length === 0) {
        listElement.innerHTML = `<div style="text-align:center; padding: 20px;">इस श्रेणी में अभी कोई सेवा प्रदाता नहीं है।</div>`;
        return;
    }

    filteredProviders.forEach(provider => {
        const card = document.createElement('div');
        card.className = 'mistri-card';
        card.innerHTML = `
            <h4>${provider.name} | ${provider.rating}</h4>
            <p>${provider.category} | ${provider.area}</p>
            <p>Experience: ${provider.experience}</p>
            <div class="actions">
                <a href="tel:${provider.phone}" class="call-btn">📞 Call Now</a>
                <a href="https://wa.me/91${provider.phone}?text=Namaste, mujhe aapki ${provider.category} service chahiye।" target="_blank" class="whatsapp-btn">💬 WhatsApp</a>
            </div>
        `;
        listElement.appendChild(card);
    });
}

function filterByCategory(category) {
    loadServiceProviders('mistri-list', category); 
    const searchScreen = document.getElementById('search-screen');
    if (searchScreen && searchScreen.classList.contains('active')) {
        loadServiceProviders('mistri-list-full', category);
    }
}

function loadAllCategories() {
    const allCatList = document.getElementById('all-categories-list');
    if (!allCatList) return;

    allCatList.innerHTML = '';
    const uniqueCategories = [...new Set(serviceProviders.map(p => p.category))];
    
    uniqueCategories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'cat-btn';
        button.textContent = category;
        button.onclick = () => filterByCategory(category);
        allCatList.appendChild(button);
    });
}

// --- FOOTER BUTTONS ---
function shareApp() {
    const appLink = "https://www.fatehpurhubs.co.in"; 
    const message = `Fatehpur Hubs App Download Karein! Fatehpur ke sabhi services jaise Plumber, Electrician, Carpenter ab ek jagah! Link: ${appLink}`;
    
    // Seedhe WhatsApp share
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

function openMoreApps() {
    alert("More Apps section jald hi aayega!");
}
