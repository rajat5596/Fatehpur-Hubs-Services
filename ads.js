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
