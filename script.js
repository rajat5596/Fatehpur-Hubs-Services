// =======================================================
// ⭐ 1. GLOBAL VARIABLES & CONFIGURATION (सबसे ऊपर रखें) ⭐
// =======================================================
const firebaseConfig = {
    apiKey: "AIzaSyA37JsLUIG-kypZ55vdpLTp3WKHgRH2IwY",
    authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
    databaseURL: "https://fatehpur-hubs-a3a9f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fatehpur-hubs-a3a9f",
    storageBucket: "fatehpur-hubs-a3a9f.appspot.com",
    messagingSenderId: "294360741451",
    appId: "1:294360741451:web:3bc85078805750b9fabfce"
};

let recaptchaVerifier, confirmationResult;
let tempUserData = {}; 
    
// ⭐ GLOBAL STATE AND LIMITS ⭐
const providersLimit = 10; // Firebase लोड लिमिट 
let providersLastTimestamp = null; 
let providersLastKey = null; 
let currentCategory = null; 
    
// फ़िल्टरिंग के लिए लोकल ऐरे और पेज इंडेक्स (Category Pagination Fix)
let filteredProviders = [];
let filteredPageIndex = 0;
    
let jobsLastKey = null;
const jobsLimit = 10;
// Note: window.providersRef और window.jobsRef को window.onload में initialize किया जाएगा

// =======================================================
// ⭐ 2. CORE UTILITY FUNCTIONS (Rendering, Sharing, WhatsApp) ⭐
// =======================================================

// --- AD CARD RENDERER ---
function renderAdCard(id, title = "अपने बिज़नेस का Ad यहाँ लगवाएँ!") {
    return `<div id="${id}" class="ad-card" onclick="window.contactForAds()">
        <p style="font-size: 1.1rem; font-weight: bold; color: #2a5298;">🤝 ${title}</p>
        <p style="font-size: 0.9rem; color: #555;">अपने कस्टमर्स तक पहुँचें।</p>
        <button>Contact for Ads</button>
    </div>`;
}
// WHATSAPP बटन फ़िक्स
function openWhatsApp(phone) {
    let num = phone.toString().replace(/[^0-9]/g, '');
    if (num.length === 10) num = '91' + num;
    if (num.length === 12 && num.startsWith('91')) {
    } else if (num.length === 13 && num.startsWith('919')) {
        num = num.substring(1);
    }
    window.open('https://wa.me/' + num, '_blank');
}

// शेयर डीटेल्स फंक्शन
window.shareProviderDetails = (name, phone, category) => {
    const shareText = `नाम: ${name} (${category})\nफ़ोन: ${phone}\n\nFatehpur Hubs App के ज़रिए सर्विस प्रोवाइडर की जानकारी मिली।`;
    if (navigator.share) {
        navigator.share({
            title: 'Service Provider Contact',
            text: shareText
        }).catch(error => console.error('Sharing failed', error));
    } else {
        alert(`Contact Details:\n${shareText}`);
    }
}
      
// प्रोवाइडर कार्ड रेंडर करें
function renderProviderCard(p) {
    // Note: 'mistri-card' class added to enable reviews.js to find the card
    return `<div class="profile-card mistri-card bg-white shadow-md rounded-lg p-4 mb-4">
            
            <h3 style="color: #2a5298; font-size: 1.1rem; font-weight: bold; margin-bottom: 5px;">${p.name}</h3>
            
            <p class="text-xs service-title">Category: ${p.category}</p> 

    <p style="font-size:12px;color:#555; margin-top: 5px;">📍 ${p.area} | Experience: ${p.experience} Years</p>

    <div style="margin-top:10px; display: flex; justify-content: space-between; gap: 5px;">
        <button class="whatsapp-btn flex-1" onclick="openWhatsApp('${p.phone}')">WhatsApp</button>
        <button class="contact-btn flex-1" onclick="window.location.href='tel:${p.phone}'">Call Now</button>
        <button class="share-btn flex-1" onclick="shareProviderDetails('${p.name}', '${p.phone}', '${p.category}')">Share</button>
    </div>
</div>`;
}


        
// जॉब कार्ड रेंडर करें
function renderJobCard(job) {
    return `<div class="profile-card" style="border-left: 5px solid #ff9800;">
        <h4 style="color:#ff9800;">${job.title} (${job.shopName})</h4>
        <p style="font-size:12px;color:#555;margin-bottom:5px;">💰 Salary: ₹${job.salary} | 📍 ${job.location}</p>
        <p style="font-size:14px;margin-bottom:10px;">${job.description.substring(0, 100)}...</p>
        <button class="whatsapp-btn" onclick="openWhatsApp('${job.phone}')">Apply/WhatsApp</button>
    </div>`;
}

// =======================================================
// ⭐ 3. DATA LOADING / FILTERING FUNCTIONS (लिस्टिंग) ⭐
// =======================================================

// ⭐ 3.1 loadCategories - सामान्य लिस्ट पैजिनेशन (Ads injected)
window.loadCategories = (loadMore = false) => {
    const listElement = document.getElementById('mistri-list');
    const loadMoreBtn = document.getElementById('load-more-providers');
    
    let queryRef;
    loadMoreBtn.style.display = 'none';
    
    // अगर किसी कैटेगरी फ़िल्टर में हैं, तो पहले उसे रीसेट करें
    if (currentCategory !== null) {
        currentCategory = null; 
        filteredProviders = [];
        filteredPageIndex = 0;
        document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('selected'));
    }

    const baseRef = window.providersRef.orderByChild('timestamp');

    if (!loadMore) {
        providersLastTimestamp = null;
        providersLastKey = null;
        
        listElement.innerHTML = `<h3>Available Services (Top ${providersLimit})</h3><p style="text-align:center;color:#2a5298;">नवीनतम ${providersLimit} प्रोवाइडर्स लोड हो रहे हैं...</p>`;
        
        queryRef = baseRef.limitToLast(providersLimit + 1); 
    } else {
        listElement.insertAdjacentHTML('beforeend', '<p id="loading-more" style="text-align:center;color:#2a5298;">और लोड हो रहा है...</p>');
        
        queryRef = baseRef.endBefore(providersLastTimestamp, providersLastKey).limitToLast(providersLimit + 1);
    }

    queryRef.once('value', (snapshot) => {
        document.getElementById('loading-more')?.remove();

        if (!loadMore && !snapshot.exists()) {
            listElement.innerHTML = '<h3>Available Services</h3><p style="text-align:center;color:#ff6666;">अभी कोई सर्विस उपलब्ध नहीं है!</p>';
            return;
        }

        let allItems = [];
        let snapshotSize = 0; 
        
        snapshot.forEach(childSnapshot => {
            allItems.push({ 
                key: childSnapshot.key, 
                data: childSnapshot.val() 
            });
            snapshotSize++; 
        });

        allItems.reverse();
        
        if (loadMore && allItems.length > 0) {
            allItems.shift(); // पिछली लिस्ट का अंतिम आइटम छोड़ दें
        }
        
        let itemsToRender = allItems.slice(0, providersLimit);
        
        if (itemsToRender.length > 0) {
            providersLastTimestamp = itemsToRender[itemsToRender.length - 1].data.timestamp;
            providersLastKey = itemsToRender[itemsToRender.length - 1].key;
        } 
        
        // --- AD INJECTION LOGIC (General List - Every 4 Cards) ---
        let contentArray = [];
        const adInjectionInterval = 4; // हर 4 कार्ड के बाद एड दिखाएँ

        for (let i = 0; i < itemsToRender.length; i++) {
            contentArray.push(window.renderProviderCard(itemsToRender[i].data));

            if ((i + 1) % adInjectionInterval === 0 && (i + 1) < itemsToRender.length) {
                contentArray.push(`
                    <div class="promotion-ad-block" 
                         style="text-align: center; margin: 30px 0; padding: 10px; border: 1px dashed #ffc107; border-radius: 8px; background-color: #fff8e1;">
                        <p style="font-size: 0.9em; color: #ff9800; font-weight: bold; margin-bottom: 10px;">-- विशेष प्रचार (Special Promotion) --</p>
                        <div class="ad-placeholder-dynamic">
                            <div style="min-height: 100px; color: #aaa;">विज्ञापन लोड हो रहा है...</div>
                        </div>
                    </div>
                `);
            }
        } 

        // --- END AD INJECTION LOGIC ---

        const htmlContent = contentArray.join('');
        
        if (!loadMore) {
            listElement.innerHTML = `<h3>Available Services (${itemsToRender.length} loaded)</h3>` + htmlContent;
        } else {
            listElement.insertAdjacentHTML('beforeend', htmlContent);
        }
        
        // --- AD LOADER CALL ---
        if (typeof window.loadInjectedPromotionAds === 'function') {
            window.loadInjectedPromotionAds(); 
        }

        if (snapshotSize > providersLimit) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.onclick = () => loadCategories(true);
        } else {
            loadMoreBtn.style.display = 'none';
            listElement.insertAdjacentHTML('beforeend', '<p style="text-align:center;color:green;font-weight:bold;">✅ लिस्ट समाप्त। अब और कोई नया डेटा नहीं है!</p>');

        }


    }, (error) => {
        console.error("Error loading services:", error);
        document.getElementById('loading-more')?.remove();
        listElement.innerHTML = '<h3>Available Services</h3><p style="text-align:center;color:red;">डेटा लोड करने में एरर आई।</p>';
    });
}

// 3.2 फ़िल्टर्ड लोकल ऐरे से पेज रेंडर करें (Ads injected)
function renderFilteredPage(listElement, loadMoreBtn, isLoadMore = false) {
    const providersLimit = 10;
    const start = filteredPageIndex * providersLimit;
    const end = start + providersLimit;
    const itemsToRender = filteredProviders.slice(start, end);
    const totalItems = filteredProviders.length;
    
    if (itemsToRender.length > 0) {
        let contentArray = [];
        const adInjectionInterval = 4; 

        for(let i=0; i < itemsToRender.length; i++){
            contentArray.push(window.renderProviderCard(itemsToRender[i]));
            
            if ((i + 1) % adInjectionInterval === 0 && (i + 1) < itemsToRender.length) {
                contentArray.push(`
                    <div class="promotion-ad-block" 
                         style="text-align: center; margin: 30px 0; padding: 10px; border: 1px dashed #ffc107; border-radius: 8px; background-color: #fff8e1;">
                        <p style="font-size: 0.9em; color: #ff9800; font-weight: bold; margin-bottom: 10px;">-- विशेष प्रचार (Special Promotion) --</p>
                        <div class="ad-placeholder-dynamic">
                            <div style="min-height: 100px; color: #aaa;">विज्ञापन लोड हो रहा है...</div>
                        </div>
                    </div>
                `);
            }
        }

        const htmlContent = contentArray.join('');
    
        if (!isLoadMore) {
            listElement.innerHTML = `<h3>Available Services (${currentCategory} - ${Math.min(end, totalItems)}/${totalItems} loaded)</h3>` + htmlContent;
        } else {
            listElement.insertAdjacentHTML('beforeend', htmlContent);
        }
        
        if (typeof window.loadInjectedPromotionAds === 'function') {
            window.loadInjectedPromotionAds(); 
        }

        filteredPageIndex++; 
        
        // ⭐ [रिव्यू सिस्टम फिक्स] - 2. फ़िल्टर्ड लोकल ऐरे रेंडर होने के बाद कॉल करें
        if (typeof window.loadRatingsForAllMistris === 'function') {
            window.loadRatingsForAllMistris(); 
        }

    } else if (!isLoadMore) {
         listElement.innerHTML = `<h3>Available Services (${currentCategory})</h3><p style="text-align:center;color:#ff6666;">अभी कोई सर्विस उपलब्ध नहीं है!</p>`;
    }
    
    if (totalItems > filteredPageIndex * providersLimit) {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.onclick = () => filterByCategory(currentCategory, true);
    } else {
        loadMoreBtn.style.display = 'none';
        listElement.insertAdjacentHTML('beforeend', '<p style="text-align:center;color:green;font-weight:bold;">✅ लिस्ट समाप्त।</p>');
    }
}

// ⭐ 3.3 कैटेगरी के अनुसार फ़िल्टर करें 
window.filterByCategory = (category, loadMore = false) => {
    const listElement = document.getElementById('mistri-list');
    const loadMoreBtn = document.getElementById('load-more-providers');
    loadMoreBtn.style.display = 'none';
    
    providersLastTimestamp = null;
    providersLastKey = null;
    
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('selected');
        if(btn.innerText === category) {
            btn.classList.add('selected');
        }
    });

    if (!loadMore) {
        currentCategory = category;
        filteredPageIndex = 0;
        listElement.innerHTML = `<h3>Available Services (${category})</h3><p style="text-align:center;color:#2a5298;">${category} सर्विस लोड हो रही है... (पूरी लिस्ट फेच की जा रही है)</p>`;

        window.providersRef.orderByChild('category').equalTo(category).once('value', (snapshot) => {
            if (!snapshot.exists()) {
                listElement.innerHTML = `<h3>Available Services (${category})</h3><p style="text-align:center;color:#ff6666;">इस कैटेगरी में कोई सर्विस नहीं है।</p>`;
                return;
            }

            filteredProviders = [];
            snapshot.forEach(childSnapshot => {
                filteredProviders.push(childSnapshot.val());
            });

            filteredProviders.sort((a, b) => b.timestamp - a.timestamp);

            renderFilteredPage(listElement, loadMoreBtn);
        }, (error) => {
            console.error("Error loading filtered services:", error);
            listElement.innerHTML = '<p style="text-align:center;color:red;">डेटा लोड करने में एरर आई।</p>';
        });

    } else {
        listElement.insertAdjacentHTML('beforeend', '<p id="loading-more" style="text-align:center;color:#2a5298;">और लोड हो रहा है...</p>');
        
        setTimeout(() => { 
            document.getElementById('loading-more')?.remove();
            renderFilteredPage(listElement, loadMoreBtn, true);
        }, 100);
    }
    
    // ⭐ [रिव्यू सिस्टम फिक्स] - 3. कैटेगरी फ़िल्टरिंग के बाद कॉल करें (क्योंकि यह renderFilteredPage को कॉल करता है)
    // यहाँ इसे सीधे कॉल करने की आवश्यकता नहीं है, क्योंकि यह फ़ंक्शन अंत में renderFilteredPage को कॉल करता है, और renderFilteredPage में हमने पहले ही कॉल जोड़ दिया है।
    // अगर आप यहां कुछ और जोड़ना चाहते हैं, तो:
    // if (typeof window.loadRatingsForAllMistris === 'function' && !loadMore) {
    //     window.loadRatingsForAllMistris(); 
    // }
};


// 3.4 सामान्य सर्च (Ads injected)
window.searchServices = () => {
    const searchTerm = document.getElementById('main-search-bar').value.toLowerCase().trim();
    const listElement = document.getElementById('mistri-list');
    
    if (searchTerm.length < 3) {
        loadCategories(); 
        return;
    }

    listElement.innerHTML = `<h3>Search Results for "${searchTerm}"</h3><p style="text-align:center;color:#2a5298;">खोज हो रही है...</p>`;
    document.getElementById('load-more-providers').style.display = 'none'; 
    
    window.providersRef.once('value', (snapshot) => { 
        const providers = snapshot.val();
        let results = [];
        if (providers) {
            results = Object.values(providers).filter(p => 
                (p.name && p.name.toLowerCase().includes(searchTerm)) || 
                (p.category && p.category.toLowerCase().includes(searchTerm)) ||
                (p.area && p.area.toLowerCase().includes(searchTerm))
            );
            
            results.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        // --- AD INJECTION LOGIC (Search Results) ---
        let contentArray = [];
        for (let i = 0; i < results.length; i++) {
            contentArray.push(renderProviderCard(results[i]));
            if (i === 4 && results.length > 5) { // Inject middle ad after 5th item
                contentArray.push(renderAdCard('search-ad-middle', '🌟 आपके एरिया का सबसे बढ़िया ऑफ़र! (Search Middle Ad)'));
            }
        }
        
        let html = `<h3>Search Results for "${searchTerm}" (${results.length} found)</h3>`;
        if (results.length > 0) {
            html += contentArray.join('');
            html += renderAdCard('search-ad-bottom', '⬇️ फतेहपुर के टॉप डील्स यहाँ देखें ⬇️ (Search Bottom Ad)');
        } else {
            html += '<p style="text-align:center;color:#ff6666;">आपकी खोज से मेल खाने वाली कोई सर्विस नहीं मिली।</p>';
        }
        listElement.innerHTML = html;
        
        // ⭐ [रिव्यू सिस्टम फिक्स] - 4. सर्च रिजल्ट रेंडर होने के बाद कॉल करें
        if (typeof window.loadRatingsForAllMistris === 'function') {
            window.loadRatingsForAllMistris(); 
        }

    });
};



// =======================================================
// ⭐ 4. REGISTRATION FUNCTIONS (सर्विस & जॉब पोस्ट) ⭐
// =======================================================

// =======================================================
// 1. सर्विस रजिस्ट्रेशन (registerService()) - CORRECTED
// =======================================================
function registerService() {
    try {
        const user = firebase.auth().currentUser;

        if (!user) {
            alert('कृपया पहले OTP से लॉग-इन करें। यह ज़रूरी है।'); 
            return false;
        }

        const userId = user.uid; 
        
        // ✅ CORRECTED IDs - Index.html के according
        const name = document.getElementById('providerName').value;
        const phone = document.getElementById('providerPhone').value;
        const category = document.getElementById('serviceCategory').value; // ✅ FIXED
        const area = document.getElementById('providerArea').value;
        const experience = document.getElementById('providerExperience').value;
        
        // वैलिडेशन चेक
        if (!name || !phone || !category || !area || !experience || phone.length !== 10 || isNaN(phone)) {
            alert("कृपया सभी ज़रूरी फ़ील्ड भरें, और फ़ोन नंबर 10 अंकों का हो।");
            return false;
        }

        // डुप्लीकेट फ़ोन नंबर चेक
        window.providersRef.orderByChild('phone').equalTo(phone).once('value', snapshot => {
            if (snapshot.exists()) {
                alert('❌ यह फ़ोन नंबर पहले से ही रजिस्टर है! डुप्लीकेट एंट्री की अनुमति नहीं है।');
                return; 
            }

            // डेटा ऑब्जेक्ट डिफाइन करें
            const providerData = { 
                name: name,
                phone: phone,
                category: category,
                area: area,
                experience: experience,
                userId: userId, // Edit/Delete के लिए ज़रूरी
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            window.providersRef.push(providerData)
            .then(() => {
                alert('✅ सर्विस सफलतापूर्वक रजिस्टर हो गई है! धन्यवाद।'); 
                
                // फ़ॉर्म को रीसेट करें
                const form = document.getElementById('serviceForm');
                if (form) form.reset();
            })
            .catch((error) => {
                console.error("सर्विस रजिस्टर करने में त्रुटि (Firebase): ", error);
                alert('त्रुटि: रजिस्ट्रेशन फ़ेल हो गया। ' + error.message); 
            });

        })
        .catch(error => {
            console.error("Firebase Read Error during duplicate check:", error);
            alert("माफ़ करें, डेटा चेक करने में कोई त्रुटि आई। कृपया फिर से कोशिश करें।");
        });

    } catch (e) {
        console.error("सर्विस रजिस्ट्रेशन क्रिटिकल फ़ेलियर: ", e);
        alert("माफ़ करें, रजिस्ट्रेशन प्रक्रिया में कोई गंभीर आंतरिक त्रुटि आई।");
    }

    return false;
    }

// 4.2 जॉब रजिस्ट्रेशन (registerJob())
function registerJob() {
    event.preventDefault();
    
    const user = firebase.auth().currentUser;

    if (!user) {
        alert('जॉब पोस्ट करने से पहले आपको लॉग-इन करना होगा।'); 
        return false; 
    }

    const posterId = user.uid; 
    
    const title = document.getElementById('jobTitle').value;
    const shopName = document.getElementById('jobShopName').value;
    const location = document.getElementById('jobLocation').value;
    const salary = document.getElementById('jobSalary').value;
    const phone = document.getElementById('jobPhone').value;
    const description = document.getElementById('jobDescription').value;

    if (!title || !shopName || !location || !salary || !phone || !description || phone.length !== 10 || isNaN(phone)) {
        alert("कृपया सभी ज़रूरी फ़ील्ड भरें और फ़ोन नंबर 10 अंकों का हो।");
        return false;
    }
    
    const jobData = {
        title: title, 
        shopName: shopName, 
        location: location,
        salary: salary,
        phone: phone,
        description: description,
        posterId: posterId,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    window.jobsRef.push(jobData)
    .then(() => {
        alert('✅ जॉब सफलतापूर्वक पोस्ट हो गई!'); 
        
        document.getElementById('jobForm').reset();
    })
    .catch((error) => {
        console.error("Job Error:", error);
        alert('❌ जॉब पोस्ट करने में त्रुटि आई।');
    });

    return false;
}

// --- 4.3 MOCK JOB LOAD FUNCTION ---
function loadJobs() {
    const listElement = document.getElementById('job-list');
    listElement.innerHTML = `<p style="text-align:center;color:#2a5298;">नौकरियाँ लोड हो रही हैं...</p>`;

    window.jobsRef.limitToLast(jobsLimit).once('value', (snapshot) => {
        if (!snapshot.exists()) {
            listElement.innerHTML = '<p style="text-align:center;color:#ff6666;">अभी कोई नौकरी उपलब्ध नहीं है।</p>';
            return;
        }
        
        let allJobs = [];
        snapshot.forEach(childSnapshot => {
            allJobs.push(childSnapshot.val());
        });

        allJobs.reverse(); 
        
        const htmlContent = allJobs.map(job => renderJobCard(job)).join('');
        listElement.innerHTML = htmlContent;

    }, (error) => {
        console.error("Error loading jobs:", error);
        listElement.innerHTML = '<p style="text-align:center;color:red;">जॉब्स लोड करने में एरर आई।</p>';
    });
}


// =======================================================
// ⭐ 5. APPLICATION START / AUTH LOGIC (window.onload) ⭐
// =======================================================

// 5.1 मुख्य लिसनर स्टार्ट फंक्शन
window.startFirebaseListener = () => {
    loadCategories(); 
}

// 5.2 Navigation Logic
window.contactForAds = () => window.open('https://wa.me/919889904191?text=Hello! Main apne business ka ad lagwana chahta hoon Fatehpur Hubs pe', '_blank');
window.shareApp = () => navigator.share ? navigator.share({title: 'Fatehpur Hubs', text: 'Best local services app', url: 'https://www.fatehpurhubs.co.in'}) : alert('Share link: https://www.fatehpurhubs.co.in');

window.showScreen = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'jobs-screen') loadJobs();
    if(id === 'home-screen') loadCategories(); 
};

window.logOut = () => {
    firebase.auth().signOut().then(() => {
        console.log("User signed out successfully.");
        location.reload(); 
    }).catch((error) => {
        console.error("Sign Out Error:", error);
        alert("Sign Out में एरर आई। कृपया दोबारा कोशिश करें।");
    });
}

// 5.3 यह फ़ंक्शन पूरे ऐप को initialize करता है
window.onload = () => {
    firebase.initializeApp(firebaseConfig);
    window.database = firebase.database();
    window.providersRef = database.ref('service_providers'); 
    window.jobsRef = database.ref('local_jobs'); 


    // 1. अदृश्य reCAPTCHA सेटअप
    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible'
    });
    recaptchaVerifier.render();

    // 2. परसिस्टेंस चेक: यूज़र ऑथेंटिकेशन स्टेट लिसनर
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            document.getElementById('registrationScreen').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            console.log("Auto-Login Successful:", user.phoneNumber);

            startFirebaseListener();
            
        } else {
            document.getElementById('registrationScreen').style.display = 'flex';
            document.getElementById('mainApp').style.display = 'none';
        }
    });


    // 3. सुरक्षित: OTP भेजें (लॉगिन स्टेप 1)
    document.getElementById('sendOtpBtn').onclick = () => {
        const name = document.getElementById('userName').value.trim();
        const area = document.getElementById('userArea').value.trim();
        const phone = document.getElementById('phoneInput').value.trim();
        
        if (!name || !area || phone.length !== 10 || isNaN(phone)) {
            document.getElementById('loginMsg').innerHTML = "<span style='color:red'>कृपया सभी फ़ील्ड (नाम, एरिया) भरें और 10 अंक का नंबर डालें।</span>";
            return;
        }

        tempUserData = {
            name: name,
            area: area,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        document.getElementById('sendOtpBtn').innerHTML = "Sending...";
        const fullPhone = '+91' + phone;
        document.getElementById('loginMsg').innerHTML = "<span style='color:orange'>OTP भेजने की प्रक्रिया शुरू हो रही है...</span>";

        firebase.auth().signOut()
            .then(() => initiateOtpFlow(fullPhone))
            .catch(() => initiateOtpFlow(fullPhone)); 

        function initiateOtpFlow(fullPhone) {
            console.log("Attempting reCAPTCHA verification for:", fullPhone);
            recaptchaVerifier.verify().then(() => {
                console.log("reCAPTCHA Verified. Sending SMS now...");
                document.getElementById('loginMsg').innerHTML = `<span style='color:#2a5298'>सुरक्षा जाँच पूरी हुई। ${fullPhone} पर OTP भेजा जा रहा है...</span>`;

                firebase.auth().signInWithPhoneNumber(fullPhone, recaptchaVerifier)
                    .then((result) => {
                        confirmationResult = result;
                        document.getElementById('profileInputSection').style.display = 'none'; 
                        document.getElementById('otpSection').style.display = 'block'; 
                        document.getElementById('loginMsg').innerHTML = `<span style='color:green'>✅ OTP ${fullPhone} पर भेजा गया!</span>`;
                    })
                    .catch((err) => {
                        console.error("Firebase SMS Send Error:", err.code, err.message);
                        document.getElementById('loginMsg').innerHTML = `<span style='color:red'>❌ OTP भेजने में एरर आई: ${err.message} (कोड: ${err.code}). कृपया दोबारा कोशिश करें या कुछ देर इंतज़ार करें।</span>`;
                        document.getElementById('sendOtpBtn').innerHTML = "Send OTP & Sign Up";
                        document.getElementById('profileInputSection').style.display = 'block';
                        document.getElementById('otpSection').style.display = 'none';
                        recaptchaVerifier.clear();
                    });
            }).catch((err) => {
                console.error("reCAPTCHA Verification Error:", err.message);
                document.getElementById('loginMsg').innerHTML = `<span style='color:red'>❌ reCAPTCHA जाँच में एरर: ${err.message}. कृपया पेज रीलोड करके फिर से कोशिश करें।</span>`;
                document.getElementById('sendOtpBtn').innerHTML = "Send OTP & Sign Up";
            });
        }
    };


    // 4. OTP सत्यापित करें (लॉगिन स्टेप 2)
    document.getElementById('verifyOtpBtn').onclick = () => {
        const otp = document.getElementById('otpInput').value;
        if (otp.length !== 6) {
            document.getElementById('loginMsg').innerHTML = "<span style='color:red'>कृपया 6 अंक का OTP डालें।</span>";
            return;
        }
        
        document.getElementById('loginMsg').innerHTML = "<span style='color:orange'>सत्यापन किया जा रहा है...</span>";


        confirmationResult.confirm(otp)
            .then((result) => {
                const user = result.user;
                if (user && user.uid) {
                    window.database.ref('users/' + user.uid).set(tempUserData)
                        .then(() => {
                            document.getElementById('loginMsg').innerHTML = "<span style='color:green'>✅ Login Successful! Redirecting...</span>";
                            location.reload(); 
                        })
                        .catch(error => {
                            console.error("Profile save error:", error);
                            document.getElementById('loginMsg').innerHTML = "<span style='color:red'>Login Successful, but profile save failed. Please contact support.</span>";
                        });
                } else {
                    document.getElementById('loginMsg').innerHTML = "<span style='color:red'>Verification Failed: User not returned.</span>";
                }
            })
            .catch(() => {
                document.getElementById('loginMsg').innerHTML = "<span style='color:red'>❌ ग़लत OTP! कृपया सही 6 अंक का OTP डालें।</span>";
            });
    };
}; // window.onload का क्लोजिंग ब्रैकेट


// Firebase Messaging setup
const messaging = firebase.messaging();

// 1. Permission maangna aur Token lena
messaging.requestPermission()
  .then(function() {
    console.log('Notification permission mil gayi!');
    // Yahan aapki wahi VAPID key hai jo aapke Firebase settings mein thi
    return messaging.getToken({ vapidKey: 'BEYn-5jHBhRiQBVY1ODA3f-xkWY1uJGGIf9tkehiu9kR3l8O86SmA-BqSTDcsaN5RjKUtbpu5u4-UYUHYTbjDQ' });
  })
  .then(function(token) {
    if (token) {
      console.log('User Token:', token);
      // 2. Token ko database mein "users_tokens" folder mein save karna
      firebase.database().ref('users_tokens/' + token.replace(/\./g, '_')).set({
        token: token,
        last_updated: new Date().toString()
      });
    }
  })
  .catch(function(err) {
    console.log('Permission nahi mili ya error aaya:', err);
  });

