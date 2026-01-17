// ads.js content (COMPLETE with Scheduling and 15 Seconds Timer)

// *************************************************************
// 1. Apne sabhi Ads ki list yahan ek array mein banaein. 
// Note: endDate ko "YYYY-MM-DD" format mein daalen. Agar hamesha chalana hai, toh null rakhen.
// *************************************************************
const promotionAds = [
    { name: "Johnson Square", image: "https://i.ibb.co/MDcL6w49/IMG-20251029-120527.jpg", link: "https://wa.me/919889904191", endDate: "2026-01-30" },
    { name: "Lal Babu Jwellers", image: "https://firebasestorage.googleapis.com/v0/b/fatehpur-hubs-a3a9f.firebasestorage.app/o/WhatsApp-Image-2024-11-18-at-4.51.41-PM-1-scaled.jpeg?alt=media&token=fe30eaba-523b-4a0e-a175-980bbd927361", link: "https://wa.me/919999999999", endDate: "2026-01-30" },
    { name: "Sivam Medical Store", image: "https://firebasestorage.googleapis.com/v0/b/fatehpur-hubs-a3a9f.firebasestorage.app/o/shivam-medical-store-fatehpur-ho-fatehpur-uttar-pradesh-chemists-nx9g5ya4cs-250.jpg?alt=media&token=f67700dd-d795-4a38-89c2-7cffe5ae99eb", link: "https://wa.me/919999999999", endDate: "2026-01-30" },
    { name: "Domino's Pizza", image: "https://firebasestorage.googleapis.com/v0/b/fatehpur-hubs-a3a9f.firebasestorage.app/o/unnamed.webp?alt=media&token=7bf61c95-77cf-4648-8e4e-6135cc5fb8e8", link: "https://wa.me/919999999999", endDate: "2026-01-30" },
    { name: "VC Motors", image: "https://firebasestorage.googleapis.com/v0/b/fatehpur-hubs-a3a9f.firebasestorage.app/o/images%20(2).jpeg?alt=media&token=3e6655be-1fa3-4954-839d-d2447149a30a", link: "https://wa.me/919888888888", endDate: "2026-01-30" },
    { name: "Fatehpur Hubs", image: "https://firebasestorage.googleapis.com/v0/b/fatehpur-hubs-a3a9f.firebasestorage.app/o/imgandroid-chrome-512x512.png?alt=media&token=7c5af6e6-f88c-4bbb-ac82-68dd4801e35d", link: "https://wa.me/919889904191", endDate: null },
    { name: "Raj Ratan", image: "https://firebasestorage.googleapis.com/v0/b/fatehpur-hubs-a3a9f.firebasestorage.app/o/images.jpeg?alt=media&token=dc80f256-00b6-43e6-9912-c3794b87a4ac", link: "https://wa.me/919888888888", endDate: "2026-01-30" },
    // Naye Ad ki expiry date yahan set karein
];

/**
 * यह फ़ंक्शन Services Renderer से कॉल होता है और डायनेमिकली 
 * इंजेक्ट किए गए एड कंटेनरों में प्रमोशन एड्स को लोड करता है।
 */
window.loadInjectedPromotionAds = function() {
    // उन सभी div's को ढूँढें जिनकी class 'promotion-ad-block' है
    const adContainers = document.querySelectorAll('.promotion-ad-block');
    
    if (adContainers.length === 0) return; 

    // **SCHEDULING LOGIC**
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    // Filter out ads that have expired
    const activeAds = promotionAds.filter(ad => {
        if (!ad.endDate) {
            return true;
        }
        const expiryDate = new Date(ad.endDate);
        expiryDate.setHours(23, 59, 59, 999); 
        return today <= expiryDate;
    });
    // **END SCHEDULING LOGIC**

    if (activeAds.length === 0) {
        adContainers.forEach(container => container.style.display = 'none');
        return; 
    }
    
    // 1. RANDOMIZE: Active Ads का order हर बार बदलेगा
    const shuffledAds = activeAds.sort(() => 0.5 - Math.random());
    
    adContainers.forEach((container, containerIndex) => {
        // हर कंटेनर में एक ही रोटेटिंग एड सेट को लोड करें
        
        let adHTML = '';
        
        // Ads को HTML string में jod dein
        shuffledAds.forEach((ad, index) => {
            // हर कंटेनर में, पहला एड दिखाएँ
            const displayStyle = (index === 0) ? 'display: block;' : 'display: none;';

            adHTML += `
                <div class="ad-slide" data-index="${index}" style="${displayStyle}">
                    <a href="${ad.link}" target="_blank" class="promotion-link" style="text-decoration: none; color: inherit; display: block;">
                        <img src="${ad.image}" 
                             alt="${ad.name}" 
                             class="promotion-banner"
                             style="width: 100%; height: auto; display: block; border-radius: 5px;">
                        <p class="business-name" style="text-align: center; font-weight: bold; margin-top: 5px; color: #ff6666;">
                            ${ad.name}
                        </p> 
                    </a>
                </div>
            `;
        });
        
        container.querySelector('.ad-placeholder-dynamic').innerHTML = adHTML;

        // 2. SLIDER LOGIC
        const slides = container.querySelectorAll('.ad-slide');
        
        // Slider tabhi chalega jab 1 se zyada active ads honge
        if(slides.length > 1) {
            let currentAdIndex = 0;
            
            function showNextAd() {
                slides[currentAdIndex].style.display = 'none';
                currentAdIndex = (currentAdIndex + 1) % slides.length;
                slides[currentAdIndex].style.display = 'block';
            }

            // Slider को हर 15 सेकंड में चलाएँ
            setInterval(showNextAd, 15000); 
        }
    });
}
// document.addEventListener('DOMContentLoaded', loadPromotionAds);  <--- यह लाइन हटा दी गई है
