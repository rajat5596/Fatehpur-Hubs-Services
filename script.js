// Global variables are now defined in index.html (db, auth, loggedInUser, verificationId)

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
            loadMistrisFromFirebase('All', 'mistri-list');
        } else if (screenId === 'search-screen') {
            loadAllCategories();
            loadMistrisFromFirebase('All', 'mistri-list-full');
        }
    }
}

// --- AUTHENTICATION (OTP) LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    showScreen('login-screen');
    initializeRecaptcha();
});

function initializeRecaptcha() {
    try {
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
            recaptchaContainer.innerHTML = '';
        }
        
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'normal',
            'callback': function(response) {
                console.log('reCAPTCHA solved successfully');
                document.getElementById('login-error').textContent = 'reCAPTCHA verified! Now click Send OTP.';
            }
        });
        
        window.recaptchaVerifier.render();
        
    } catch (error) {
        console.error("reCAPTCHA initialization failed:", error);
    }
}

const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const phoneNumberInput = document.getElementById('phone-number');
const otpCodeInput = document.getElementById('otp-code');
const loginError = document.getElementById('login-error');

sendOtpBtn.addEventListener('click', async () => {
    const phoneNumber = phoneNumberInput.value.trim();
    
    if (!phoneNumber || phoneNumber.length !== 10 || !/^[6-9]\d{9}$/.test(phoneNumber)) {
        loginError.textContent = 'Kripya sahi 10-digit Indian mobile number daalein.';
        loginError.style.color = 'red';
        return;
    }
    
    const fullPhoneNumber = `+91${phoneNumber}`;
    
    if (!window.recaptchaVerifier) {
        initializeRecaptcha();
        return;
    }

    sendOtpBtn.disabled = true;
    loginError.textContent = 'OTP bhej raha hoon...';
    loginError.style.color = 'blue';

    try {
        const confirmationResult = await auth.signInWithPhoneNumber(fullPhoneNumber, window.recaptchaVerifier);
        
        window.confirmationResult = confirmationResult;
        sendOtpBtn.style.display = 'none';
        phoneNumberInput.disabled = true;
        otpCodeInput.style.display = 'block';
        verifyOtpBtn.style.display = 'block';
        loginError.style.color = 'green';
        loginError.textContent = '✅ OTP successfully bhej diya gaya!';
        
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        loginError.style.color = 'red';
        loginError.textContent = `Error: ${error.message}`;
        sendOtpBtn.disabled = false;
    }
});

// ... rest of the code (same as before)
// Service Registration Form
document.getElementById('service-registration-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const category = document.getElementById('reg-category').value;
    const area = document.getElementById('reg-area').value.trim();
    const experience = document.getElementById('reg-experience').value.trim();
    
    if (!name || !phone || !category || !area) {
        alert("Kripya sabhi fields bharein");
        return;
    }
    
    // WhatsApp message format
    const message = `*New Service Registration:*%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Category:* ${category}%0A*Area:* ${area}%0A*Experience:* ${experience}%0A%0A_Fatehpur Hubs App se register kiya gaya hai_`;
    
    // Open WhatsApp
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
    
    // Form reset
    this.reset();
    
    alert("Registration successful! Aapka data admin ko bhej diya gaya hai.");
});
function registerService() {
    const name = document.getElementById('providerName').value;
    const phone = document.getElementById('providerPhone').value;
    const category = document.getElementById('serviceCategory').value;
    const experience = document.getElementById('providerExperience').value;
    
    if (!name || !phone || !category || !experience) {
        alert('❌ Please fill all fields');
        return;
    }
    
    // New service provider
    const newProvider = {
        name: name,
        category: category,
        phone: phone,
        area: "Fatehpur",
        experience: experience,
        rating: "⭐️⭐️⭐️⭐️"
    };
    
    // Add to array
    serviceProviders.push(newProvider);
    
    // Refresh display
    loadServiceProviders();
    
    // Clear form
    document.getElementById('providerName').value = '';
    document.getElementById('providerPhone').value = '';
    document.getElementById('serviceCategory').value = '';
    document.getElementById('providerExperience').value = '';
    
    alert('✅ Service registered successfully!');
}
