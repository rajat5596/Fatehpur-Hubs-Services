// Fatehpur Hubs: Firebase Phone Authentication Logic

// -------------------------------------------------------------
// PART 1: CONFIGURATION AND INITIALIZATION
// -------------------------------------------------------------

// Firebase SDK Compatibility Imports: (Yeh aapki login.html mein already hai)
// import { initializeApp } from 'firebase/app';
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// 🛑 अपनी ASLI FIREBASE CONFIGURATION यहाँ डालें
const firebaseConfig = {
    apiKey: "AIzaSyA37JsLUIG-kypZ55vdpLTp3WKHgRH2IwY", // YAHAN ASLI KEY DAALEIN
    authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
    projectId: "fatehpur-hubs-a3a9f",
    storageBucket: "fatehpur-hubs-a3a9f.firebasestorage.app",
    messagingSenderId: "294360741451",
    appId: "1:294360741451:web:3bc85078805750b9fabfce" 
};

// VAPID Key: Firebase Console -> Settings -> Cloud Messaging mein milegi.
const VAPID_KEY = "BEyN-5jhBHRlQBVYIODA3i7xIkWY1uJGGifqtkahlu9kR3I8O865mA-BqSTDcsaN5RjKUt6pu5u4-UYUHYTbjDQ"; // 🛑 Yahan asli VAPID key zaroor daalein

// Firebase Services Initialize karein
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
window.auth = auth;

// DOM Elements aur Variables
let confirmationResult = null;
const phoneInput = document.getElementById('phone-number');
const otpInput = document.getElementById('otp-code');
const authForm = document.getElementById('auth-form');
const step1 = document.getElementById('step-phone');
const step2 = document.getElementById('step-otp');
const statusMessage = document.getElementById('status-message');

// RecaptchaVerifier setup. Yeh phone verification ke liye mandatory hai.
// Yeh widget login.html mein maujood div#recaptcha-container mein dikhega.
function setupRecaptcha() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible', // User ko dikhega nahi, background mein chalega
        'callback': (response) => {
            // Recaptcha solve hone ke baad, phone sign-in process shuru karein
            console.log("Recaptcha solved automatically. Proceeding to send OTP.");
            onSignInSubmit(true); // Call to send OTP
        },
        'expired-callback': () => {
            updateStatus('Recaptcha expired. Please try again.', true);
        }
    }, auth);
}

// Window load hone par Recaptcha set karein
window.onload = function() {
    setupRecaptcha();
};

// Form submit hone par kya karna hai (Common Handler)
authForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (step1.style.display !== 'none') {
        // Agar phone number step par hain (Step 1)
        onSignInSubmit(false); // Recaptcha ko solve karne ke liye trigger karein
    } else {
        // Agar OTP verification step par hain (Step 2)
        verifyOtp();
    }
});

function updateStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? '#cc0000' : '#006600';
}


// -------------------------------------------------------------
// PART 2: SEND OTP FUNCTION
// -------------------------------------------------------------

function onSignInSubmit(isRecaptchaSolved) {
    // Agar Recaptcha solve ho chuka hai, tab hi aage badhe
    if (!isRecaptchaSolved) {
        // Recaptcha ko force execute karne ke liye
        updateStatus("सुरक्षा जाँच चल रही है...", false);
        window.recaptchaVerifier.verify();
        return; 
    }
    
    const phoneNumber = phoneInput.value.trim();

    if (!phoneNumber || phoneNumber.length < 10) {
        updateStatus("कृपया 10 अंकों का वैध मोबाइल नंबर डालें।", true);
        return;
    }
    
    updateStatus("OTP भेजा जा रहा है...", false);
    
    // International format zaroori hai (Assumption: +91 India)
    const appVerifier = window.recaptchaVerifier;
    const fullPhoneNumber = "+91" + phoneNumber; 

    auth.signInWithPhoneNumber(fullPhoneNumber, appVerifier)
        .then((confirmation) => {
            // OTP successfully bhej diya gaya hai.
            confirmationResult = confirmation;
            updateStatus(`OTP ${phoneNumber} पर भेजा गया है।`);
            
            // UI ko OTP step par change karein
            step1.style.display = 'none';
            step2.style.display = 'block';
        })
        .catch((error) => {
            console.error("OTP Error:", error);
            updateStatus("OTP भेजने में समस्या हुई। कृपया पुनः प्रयास करें। (Error: " + error.code + ")", true);
            
            // Recaptcha ko reset karein
            window.recaptchaVerifier.render().then(function(widgetId) {
                firebase.auth.RecaptchaVerifier.reset(widgetId);
            });
        });
}

// -------------------------------------------------------------
// PART 3: VERIFY OTP FUNCTION
// -------------------------------------------------------------

function verifyOtp() {
    const otpCode = otpInput.value.trim();

    if (!otpCode || otpCode.length !== 6) {
        updateStatus("कृपया 6 अंकों का OTP डालें।", true);
        return;
    }

    if (!confirmationResult) {
        updateStatus("पहले OTP भेजें।", true);
        return;
    }
    
    updateStatus("OTP सत्यापित हो रहा है...", false);

    confirmationResult.confirm(otpCode)
        .then((result) => {
            // User successfully verified aur logged in ho gaya hai!
            const user = result.user;
            console.log("User successfully logged in:", user.uid);
            updateStatus("सत्यापन सफल! आप ऐप में प्रवेश कर रहे हैं...", false);
            
            // Login hone ke baad user ko main app par bhej dein
            window.location.href = 'index.html'; 
        })
        .catch((error) => {
            console.error("OTP Verification Error:", error);
            updateStatus("गलत OTP! कृपया सही कोड डालें या पुनः भेजें।", true);
        });
}

// -------------------------------------------------------------
// CODE ENDS
// -------------------------------------------------------------