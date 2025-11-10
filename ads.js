// ads.js content (COMPLETE with Scheduling and 15 Seconds Timer)

// *************************************************************
// 1. Apne sabhi Ads ki list yahan ek array mein banaein. 
// Note: endDate ko "YYYY-MM-DD" format mein daalen. Agar hamesha chalana hai, toh null rakhen.
// *************************************************************
const promotionAds = [
    { name: "Rajat Enterprises", image: "https://i.ibb.co/MDcL6w49/IMG-20251029-120527.jpg", link: "https://wa.me/919889904191", endDate: "2025-11-05" },
    { name: "Rajat Aluminium", image: "https://i.ibb.co/0y4K0cR/rajat-aluminium.jpg", link: "https://wa.me/919889904191", endDate: null },
    { name: "ABC Hardware Store", image: "https://via.placeholder.com/350x100/333333/FFFFFF?text=ABC+Hardware", link: "https://wa.me/919999999999", endDate: "2025-11-06" },
    { name: "PQR Services", image: "https://via.placeholder.com/350x100/007bff/FFFFFF?text=PQR+Services", link: "tel:+918888888888", endDate: null },
    // Naye Ad ki expiry date (e.g., 2025-11-05) yahan set karein
];

function loadPromotionAds() {
    const adsContainer = document.getElementById('promotion-banner-area');
    if (!adsContainer) return; 

    // **SCHEDULING LOGIC**
    const today = new Date();
    // Timezone issues se bachne ke liye, hum sirf date ko check karte hain.
    today.setHours(0, 0, 0, 0); 
    
    // Filter out ads that have expired
    const activeAds = promotionAds.filter(ad => {
        // Agar endDate nahi hai, toh ad hamesha active hai
        if (!ad.endDate) {
            return true;
        }
        
        // Ad ki expiry date, us din ke 23:59:59 tak active rahegi
        const expiryDate = new Date(ad.endDate);
        expiryDate.setHours(23, 59, 59, 999); 
        
        // Agar aaj ki date expiry date se choti ya barabar hai, toh ad active hai
        return today <= expiryDate;
    });
    // **END SCHEDULING LOGIC**

    
    // Agar koi active ad nahi hai, toh ruk jaao.
    if (activeAds.length === 0) {
        adsContainer.innerHTML = '';
        return; 
    }
    
    // 1. RANDOMIZE: Active Ads ka order har baar badlega
    const shuffledAds = activeAds.sort(() => 0.5 - Math.random());

    adsContainer.innerHTML = ''; 

    let adHTML = '';
    
    // Ads ko HTML string mein jod dein
    shuffledAds.forEach((ad, index) => {
        const displayStyle = (index === 0) ? 'display: block;' : 'display: none;';

        adHTML += `
            <div class="ad-slide" data-index="${index}" style="${displayStyle}">
                <a href="${ad.link}" target="_blank" class="promotion-link" style="text-decoration: none; color: inherit; display: block;">
                    <img src="${ad.image}" 
                         alt="${ad.name}" 
                         class="promotion-banner"
                         style="max-width: 100%; height: auto; display: block; border-radius: 5px;">
                    <p class="business-name" style="text-align: center; font-weight: bold; margin-top: 5px; color: #ff6666;">
                        ${ad.name}
                    </p> 
                </a>
            </div>
        `;
    });
    
    adsContainer.innerHTML = adHTML;

    // 2. SLIDER LOGIC
    const slides = adsContainer.querySelectorAll('.ad-slide');
    
    // Slider tabhi chalega jab 1 se zyada active ads honge
    if(slides.length > 1) {
        let currentAdIndex = 0;
        
        function showNextAd() {
            slides[currentAdIndex].style.display = 'none';
            currentAdIndex = (currentAdIndex + 1) % slides.length;
            slides[currentAdIndex].style.display = 'block';
        }

        setInterval(showNextAd, 15000); 
    }
}

document.addEventListener('DOMContentLoaded', loadPromotionAds);
// ==================== PHONE AUTHENTICATION CODE ====================

// Initialize Firebase Auth
const auth = firebase.auth();
let recaptchaVerifier;
let confirmationResult;

// Initialize reCAPTCHA
function initializeRecaptcha() {
    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible'
    });
}

// Send OTP
function sendOTP() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    if (!phoneNumber) {
        alert('Please enter phone number');
        return;
    }

    auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
        .then((result) => {
            confirmationResult = result;
            document.getElementById('otpSection').style.display = 'block';
            alert('OTP sent successfully!');
        })
        .catch((error) => {
            alert('Error: ' + error.message);
            console.error('OTP Error:', error);
        });
}

// Verify OTP
function verifyOTP() {
    const otp = document.getElementById('otpInput').value;
    
    if (!otp) {
        alert('Please enter OTP');
        return;
    }

    confirmationResult.confirm(otp)
        .then((result) => {
            alert('Phone verification successful!');
            document.getElementById('phoneAuthModal').style.display = 'none';
            checkAuthAndLoadData();
        })
        .catch((error) => {
            alert('Invalid OTP. Please try again.');
        });
}

// Close Auth Modal
function closeAuthModal() {
    document.getElementById('phoneAuthModal').style.display = 'none';
}

// Check Authentication Status
function checkAuthAndLoadData() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is logged in - enable all features
            console.log('User logged in:', user.phoneNumber);
            loadAllData(); // Aapka existing data load function
        } else {
            // User not logged in - show auth modal
            console.log('User not logged in - showing auth modal');
            document.getElementById('phoneAuthModal').style.display = 'block';
            initializeRecaptcha();
        }
    });
}

// Protect your existing functions - Example for jobs
function protectJobAccess() {
    const user = auth.currentUser;
    if (user) {
        // User verified - show jobs screen
        ShowScreen('jobs-screen');
        loadJobs(); // Aapka existing jobs load function
    } else {
        // Show auth modal
        document.getElementById('phoneAuthModal').style.display = 'block';
    }
}

// Modify your existing job posting function
function postJob() {
    const user = auth.currentUser;
    if (user) {
        // Allow job posting
        yourExistingPostJobFunction();
    } else {
        alert('Please verify your phone first');
        document.getElementById('phoneAuthModal').style.display = 'block';
    }
}

// Auto-check auth when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
        checkAuthAndLoadData();
    }, 1000);
});
