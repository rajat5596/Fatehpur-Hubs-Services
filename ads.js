// ads.js content (COMPLETE with Scheduling and 15 Seconds Timer)

// *************************************************************
// 1. Apne sabhi Ads ki list yahan ek array mein banaein. 
// Note: endDate ko "YYYY-MM-DD" format mein daalen. Agar hamesha chalana hai, toh null rakhen.
// *************************************************************
const promotionAds = [
    { name: "Rajat Enterprises", image: "https://i.ibb.co/MDcL6w49/IMG-20251029-120527.jpg", link: "https://wa.me/919889904191", endDate: "2025-12-06" },
    { name: "Rajat Aluminium", image: "https://i.ibb.co/0y4K0cR/rajat-aluminium.jpg", link: "https://wa.me/919889904191", endDate: null },
    { name: "ABC Hardware Store", image: "https://via.placeholder.com/350x100/333333/FFFFFF?text=ABC+Hardware", link: "https://wa.me/99999999999", endDate: "2025-11-26" },
    { name: "PQR Services", image: "https://via.placeholder.com/350x100/007bff/FFFFFF?text=PQR+Services", link: "tel:+918888888888", endDate: null },
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
