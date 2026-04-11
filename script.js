
// =======================================================
// ⭐ 1. GLOBAL VARIABLES & CONFIGURATION (सबसे ऊपर रखें) ⭐
// =======================================================
// ========== FIREBASE CONFIG (UPDATED) ==========
const firebaseConfig = {
    apiKey: "AIzaSyCFccfNZzNSTcfBCYEh3kcXPjI4HRETCa0",
    authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
    databaseURL: "https://fatehpur-hubs-a3a9f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fatehpur-hubs-a3a9f",
    storageBucket: "fatehpur-hubs-a3a9f.firebasestorage.app",
    messagingSenderId: "294360741451",
    appId: "1:294360741451:web:5a4a6ac0838f8542fabfce"
};

// Google Sign-In ke liye
let currentUser = null;
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
        return `<div class="profile-card">
            <h4 style="color:#2a5298;">${p.name} - (${p.category})</h4>
            <p style="font-size:12px;color:#555;">📍 ${p.area} | Experience: ${p.experience}</p>
            <div style="margin-top:10px; display: flex; justify-content: space-between; gap: 5px;">
                <button class="whatsapp-btn flex-1" onclick="openWhatsApp('${p.phone}')">WhatsApp</button>
                <button class="contact-btn flex-1" onclick="window.location.href='tel:${p.phone}'">Call Now</button>
                <button class="share-btn flex-1" onclick="shareProviderDetails('${p.name}', '${p.phone}', '${p.category}')">Share</button>
            </div>
        </div>`;
    }

        
// जॉब कार्ड रेंडर करें
function renderJobCard(job) {
    // Days Left Badge
    let daysBadge = job.daysBadge || '';

    return `<div class="profile-card" style="border-left: 5px solid #ff9800; position:relative;">
        ${daysBadge}
        <h4 style="color:#ff9800; margin-top:0;">${job.title || 'No Title'} (${job.shopName || 'Unknown'})</h4>
        <p style="font-size:12px;color:#555;margin-bottom:5px;">Salary: ₹${job.salary || 'N/A'} | Location: ${job.location || 'Fatehpur'}</p>
        <p style="font-size:14px;margin-bottom:10px;">${(job.description || 'No description').substring(0, 100)}...</p>
        <button class="whatsapp-btn" onclick="openWhatsApp('${job.phone || ''}')">Apply/WhatsApp</button>
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
window.registerJob = function(event) {
    if(event) event.preventDefault();
    
    const user = firebase.auth().currentUser;

    // --- GUEST CHECK: Agar login nahi hai toh Login Screen par bhejo ---
    if (!user) {
        alert('जॉब पोस्ट करने से पहले आपको लॉग-इन करना होगा।'); 
        
        // App chhupao aur login dikhao
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('registrationScreen').style.display = 'block';
        
        // Login UI ko reset karo (Phone input wala section dikhao)
        document.getElementById('profileInputSection').style.display = 'block';
        document.getElementById('otpSection').style.display = 'none';
        
        return false; 
    }

     // --- LOGGED IN USER CODE: Agar login hai toh ye niche wala chalega ---
    const posterId = user.uid; 
    
    const title = document.getElementById('jobTitle').value;
    const shopName = document.getElementById('jobShopName').value;
    const jobDuration = document.getElementById('jobDuration').value;

    if (!jobDuration) {
        alert("Job duration select karo bhai!");
        return false;
    }

    // End time calculate karo
    const endTime = Date.now() + (parseInt(jobDuration) * 24 * 60 * 60 * 1000);
    const location = document.getElementById('jobLocation').value;
    const salary = document.getElementById('jobSalary').value;
    const phone = document.getElementById('jobPhone').value;
    const description = document.getElementById('jobDescription').value;

    // Validation
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
        duration: jobDuration,
        endTime: endTime,
        posterId: posterId,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    // Firebase database update
    if (window.jobsRef) {
        window.jobsRef.push(jobData)
        .then(() => {
            alert('✅ जॉब सफलतापूर्वक पोस्ट हो गई!'); 
            document.getElementById('jobForm').reset();
            // Wapas job list dikhao
            if(typeof goJobs === 'function') goJobs();
        })
        .catch((error) => {
            console.error("Job Error:", error);
            alert('❌ जॉब पोस्ट करने में त्रुटि आई।');
        });
    } else {
        alert("Database connection error. Refresh karein.");
    }

    return false;
};
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
        const currentTime = Date.now();

        snapshot.forEach((childSnapshot) => {
            const job = childSnapshot.val();

            // Expired job delete
            if (job.endTime && currentTime > job.endTime) {
                childSnapshot.ref.remove();
                return; // Skip
            }

            // Days Left Badge
            let daysBadge = '';
            if (job.endTime) {
                const daysLeft = Math.ceil((job.endTime - currentTime) / (24 * 60 * 60 * 1000));
                if (daysLeft <= 0) {
                    daysBadge = '<span style="background:#f44336;color:white;padding:4px 10px;border-radius:4px;font-size:0.8rem;float:right;">EXPIRED</span>';
                } else if (daysLeft === 1) {
                    daysBadge = '<span style="background:#FF9800;color:white;padding:4px 10px;border-radius:4px;font-size:0.8rem;float:right;">1 DAY LEFT</span>';
                } else if (daysLeft <= 7) {
                    daysBadge = '<span style="background:#FF9800;color:white;padding:4px 10px;border-radius:4px;font-size:0.8rem;float:right;">' + daysLeft + ' DAYS LEFT</span>';
                } else {
                    daysBadge = '<span style="background:#4CAF50;color:white;padding:4px 10px;border-radius:4px;font-size:0.8rem;float:right;">' + daysLeft + ' days left</span>';
                }
            }

            job.daysBadge = daysBadge;
            allJobs.push(job);
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

    // 2. परसिस्टेंस चेक: यूज़र ऑथेंटिकेशन स्टेट लिसनर (GUEST MODE UPDATED)
firebase.auth().onAuthStateChanged(user => {
    // Guest ho ya Login, ab hamesha Main App dikhega
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('registrationScreen').style.display = 'none';

    if (user) {
        console.log("Logged In User:", user.phoneNumber);
        // Agar user login hai, toh data load karo
        startFirebaseListener();
    } else {
        console.log("Guest Mode Active");
        // Guest ke liye bhi data load karo
        startFirebaseListener();
    }
    
    // 🔥 YEH LINE ADD KARO - UI update karne ke liye
    setTimeout(updateAuthUI, 100);
    setTimeout(updateRatingButtons, 500);
});
    
 // window.onload का क्लोजिंग ब्रैकेट

// 5.4 Service Worker Registration (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
// ============ DAILY DEALS SIMPLE WORKING CODE ============

// Function to open deals screen
function openDealsNow() {
    console.log("openDealsNow function called");
    
    // First hide all screens
    const screens = ['home-screen', 'add-service-screen', 'jobs-screen', 'share-screen'];
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) screen.style.display = 'none';
    });
    
    // Show deals screen
    const dealsScreen = document.getElementById('deals-screen');
    if (dealsScreen) {
        dealsScreen.style.display = 'block';
        console.log("✅ Deals screen shown");
        
        // Load deals after showing screen
        setTimeout(function() {
            loadDailyDeals();
        }, 300);
    } else {
        console.error("❌ Deals screen not found");
        alert("Daily Deals screen not available. Please refresh page.");
    }
}

// Simple function to load deals
function loadDailyDeals() {
    const dealsList = document.getElementById('deals-list');
    if (!dealsList) return;
    
    dealsList.innerHTML = '<p style="text-align:center;padding:20px;">Loading offers...</p>';
    
    firebase.database().ref('deals').once('value').then((snapshot) => {
        const data = snapshot.val();
        dealsList.innerHTML = ''; // Loading saaf karo

        if (!data) {
            dealsList.innerHTML = '<p style="text-align:center;padding:20px;">Abhi koi offers nahi hain.</p>';
            return;
        }

        const now = Date.now();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiredDeals = [];
        let activeDealsCount = 0;

        Object.keys(data).reverse().forEach(id => {
            const deal = data[id];
            const expiryDate = deal.endDate || deal.validTill || 0;

            // Expired check
            if (expiryDate > 0 && expiryDate < now) {
                expiredDeals.push(id);
                return; 
            }

            // Days left calculation
            const expiry = new Date(expiryDate);
            expiry.setHours(0, 0, 0, 0);
            const daysLeft = Math.ceil((expiry - today) / (24 * 60 * 60 * 1000));
            
            // Skip if negative (just in case)
            if (daysLeft < 0) {
                expiredDeals.push(id);
                return;
            }

            activeDealsCount++;

            // Days left badge (Jaisa jobs mein hai)
            let daysBadge = '';
            if (daysLeft === 0) {
                daysBadge = `<span style="background:#f44336; color:white; padding:4px 10px; border-radius:4px; font-size:0.8rem; font-weight:bold; float:right;">
                                ⏳ LAST DAY
                            </span>`;
            } else if (daysLeft === 1) {
                daysBadge = `<span style="background:#FF9800; color:white; padding:4px 10px; border-radius:4px; font-size:0.8rem; font-weight:bold; float:right;">
                                🟢 ${daysLeft} DAY LEFT
                            </span>`;
            } else if (daysLeft <= 3) {
                daysBadge = `<span style="background:#FF9800; color:white; padding:4px 10px; border-radius:4px; font-size:0.8rem; font-weight:bold; float:right;">
                                🟡 ${daysLeft} DAYS LEFT
                            </span>`;
            } else if (daysLeft <= 7) {
                daysBadge = `<span style="background:#4CAF50; color:white; padding:4px 10px; border-radius:4px; font-size:0.8rem; font-weight:bold; float:right;">
                                🟢 ${daysLeft} days left
                            </span>`;
            } else {
                daysBadge = `<span style="background:#2196F3; color:white; padding:4px 10px; border-radius:4px; font-size:0.8rem; font-weight:bold; float:right;">
                                📅 ${daysLeft} days left
                            </span>`;
            }

            // Format dates
            const startDate = deal.startDate ? 
                new Date(deal.startDate).toLocaleDateString('hi-IN', { 
                    day: 'numeric', 
                    month: 'short' 
                }) : 'Today';
            
            const endDate = new Date(expiryDate).toLocaleDateString('hi-IN', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
            });

            // Deal Card HTML (Updated with days badge)
            const card = `
                <div style="background:white; border:1px solid #ddd; border-radius:10px; padding:15px; margin-bottom:15px; text-align:left; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                        <h4 style="margin:0; color:#2a5298; font-size:1.1rem; flex:1;">
                            ${deal.title || 'Offer'}
                        </h4>
                        ${daysBadge}
                    </div>
                    
                    <p style="margin:5px 0; font-size:0.9rem;">
                        <strong>🏪 Shop:</strong> ${deal.shopName || 'Local Shop'}
                    </p>
                    
                    <p style="font-size:0.85rem; color:#444; background:#f9f9f9; padding:8px; border-radius:5px; margin:8px 0;">
                        ${deal.description || ''}
                    </p>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; flex-wrap:wrap; gap:5px;">
                        <span style="color:#666; background:#f0f0f0; padding:4px 10px; border-radius:3px; font-size:0.8rem;">
                            ${deal.category || 'Other'}
                        </span>
                        
                        <span style="color:#2196F3; font-size:0.8rem; font-weight:bold;">
                            📅 ${startDate} - ${endDate}
                        </span>
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                        <small style="color:#777; font-size:0.75rem;">
                            Posted: ${new Date(deal.timestamp).toLocaleDateString('hi-IN')}
                        </small>
                        
                        <a href="https://wa.me/91${deal.phone}" 
                           target="_blank" 
                           style="background:#25D366; color:white; padding:6px 12px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:0.8rem;">
                            📱 WhatsApp
                        </a>
                    </div>
                </div>`;
            dealsList.innerHTML += card;
        });

        // Summary counter
        if (activeDealsCount > 0) {
            const summary = `<div style="text-align:center; padding:10px; background:#f5f5f5; border-radius:8px; margin:15px 0;">
                                <p style="margin:5px 0; color:#666; font-size:0.9rem;">
                                    ✅ ${activeDealsCount} active offers available
                                    ${expiredDeals.length > 0 ? 
                                      `<br><small style="color:#f44336; font-size:0.8rem;">🗑️ ${expiredDeals.length} expired offers auto-deleted</small>` : 
                                      ''}
                                </p>
                            </div>`;
            dealsList.innerHTML += summary;
        }

        // Auto-Delete logic (Sirf login user ke liye)
        const user = firebase.auth().currentUser;
        if (user && expiredDeals.length > 0) {
            const updates = {};
            expiredDeals.forEach(id => {
                updates[`deals/${id}`] = null;
            });
            firebase.database().ref().update(updates)
                .then(() => {
                    console.log(`✅ Auto-deleted ${expiredDeals.length} expired deals`);
                })
                .catch(err => {
                    console.error("Auto-delete error:", err);
                });
        }

    }).catch((err) => {
        console.error(err);
        dealsList.innerHTML = '<p style="text-align:center;color:red;">Loading failed. Refresh karein.</p>';
    });
}
// Simple save function
window.saveDailyDeal = function() {
    console.log("saveDailyDeal called");
    
    // 1. SABSE PEHLE LOGIN CHECK (GUEST USERS KE LIYE)
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("अपना ऑफर डालने के लिए कृपया पहले लॉगिन करें।");
        // App chhupao aur login dikhao
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('registrationScreen').style.display = 'block';
        
        // Reset login screen view
        document.getElementById('profileInputSection').style.display = 'block';
        document.getElementById('otpSection').style.display = 'none';
        return; // Function ko yahan rok do
    }
    
    // 2. FORM VALUES NIKALNA
    const shopName = document.getElementById('shopName').value.trim();
    const dealTitle = document.getElementById('dealTitle').value.trim();
    const dealDesc = document.getElementById('dealDescription').value.trim();
    const category = document.getElementById('dealCategory').value;
    const phone = document.getElementById('dealPhone').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // 3. VALIDATION
    if (!shopName || !dealTitle || !dealDesc || !category || !phone || !startDate || !endDate) {
        alert("❌ Please fill all required fields!");
        return;
    }
    
    if (phone.length !== 10) {
        alert("❌ Please enter valid 10 digit phone number!");
        return;
    }
    
    // 4. DATE VALIDATION
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
        alert("❌ Start date cannot be in the past!");
        return;
    }
    
    if (end <= start) {
        alert("❌ End date must be after start date!");
        return;
    }
    
    // 5. FIREBASE CHECK
    if (typeof firebase === 'undefined' || !firebase.database) {
        alert("⚠️ Firebase loading... Please wait.");
        return;
    }
    
    const db = firebase.database();
    const timestamp = Date.now();
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();
    const daysDiff = Math.ceil((endTimestamp - startTimestamp) / (1000 * 3600 * 24)) + 1;
    
    // 6. SAVE TO FIREBASE
    db.ref('deals').push({
        shopName: shopName,
        title: dealTitle,
        description: dealDesc,
        category: category,
        phone: phone,
        timestamp: timestamp,
        userId: user.uid,
        userName: localStorage.getItem('user_name') || 'Anonymous',
        startDate: startTimestamp,
        endDate: endTimestamp,
        daysValid: daysDiff,
        status: 'active'
    })
    .then(() => {
        const startStr = start.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        const endStr = end.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        
        alert(`✅ Offer Submitted Successfully!\n\n🏪 Shop: ${shopName}\n📅 Validity: ${startStr} to ${endStr}\nYour offer is now live!`);
        
        // Reset form
        document.getElementById('dealForm').reset();
        
        // Reload deals
        if (typeof loadDailyDeals === 'function') {
            setTimeout(loadDailyDeals, 1000);
        }
    })
    .catch((error) => {
        alert("❌ Error: " + error.message);
    });
};

// ============ SIMPLE FOOTER FUNCTIONS - ADD THIS AT THE END ============

function goHome() {
    console.log("Going to Home");
    // Sab screens hide
    document.getElementById('deals-screen').style.display = 'none';
    document.getElementById('add-service-screen').style.display = 'none';
    document.getElementById('jobs-screen').style.display = 'none';
    document.getElementById('share-screen').style.display = 'none';
    // Home show
    document.getElementById('home-screen').style.display = 'block';
    // Services load karo
    if (typeof loadCategories === 'function') {
        setTimeout(loadCategories, 300);
    }
}

function goService() {
    console.log("Going to Services");
    // Sab screens hide
    document.getElementById('deals-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('jobs-screen').style.display = 'none';
    document.getElementById('share-screen').style.display = 'none';
    // Services show
    document.getElementById('add-service-screen').style.display = 'block';
}

window.goJobs = function() {
    console.log("Navigating to Jobs - Guest Mode enabled");
    
    // Sabse pehle screen dikhao
    const jobsScreen = document.getElementById('jobs-screen');
    if (jobsScreen) {
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        jobsScreen.style.display = 'block';
    }

    // PEHLE JOBS LOAD KARO
    try {
        if (typeof loadJobs === 'function') {
            loadJobs(); // Jobs list load karo
        }
    } catch (e) {
        console.error("Jobs load error:", e);
    }
    
    // PHIR JOB FORM KA ACCESS CHECK KARO (500ms baad)
    setTimeout(() => {
        if (typeof checkJobFormAccess === 'function') {
            checkJobFormAccess();
        }
    }, 500);
};

// Job Form dikhane ya chhupane wala function (Login check ke sath)
window.toggleJobForm = function() {
    console.log("Checking login for Job Form...");
    const user = firebase.auth().currentUser;

    if (!user) {
        // Agar guest hai toh login screen par bhejo
        alert("जॉब पोस्ट करने के लिए कृपया पहले लॉगिन करें।");
        
        // App chhupao aur login dikhao
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('registrationScreen').style.display = 'block';
        
        // Reset login inputs
        if(document.getElementById('profileInputSection')) {
            document.getElementById('profileInputSection').style.display = 'block';
            document.getElementById('otpSection').style.display = 'none';
        }
        return;
    }

    // Agar login hai, toh button chhupao aur form dikhao
    const wrapper = document.getElementById('jobFormWrapper');
    const btn = document.getElementById('showFormBtn');
    
    if (wrapper && btn) {
        wrapper.style.display = 'block';
        btn.style.display = 'none';
        console.log("User logged in, showing form");
    }
};


function goShare() {
    console.log("Going to Share");
    // Sab screens hide
    document.getElementById('deals-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('add-service-screen').style.display = 'none';
    document.getElementById('jobs-screen').style.display = 'none';
    // Share show
    document.getElementById('share-screen').style.display = 'block';
}

window.goDeals = function() {
    console.log("Navigating to Deals Screen...");
    
    // 1. Pehle screens ko handle karein (Safety ke saath)
    const dealsScreen = document.getElementById('deals-screen');
    if (!dealsScreen) {
        console.error("deals-screen element nahi mila!");
        return;
    }

    // Saari screens ko hide karke deals dikhao
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    dealsScreen.style.display = 'block';

    // 2. Ab Deals load karne ka function call karein
    try {
        if (typeof loadDailyDeals === 'function') {
            loadDailyDeals();
        } else {
            console.error("loadDailyDeals function define nahi hai!");
        }
    } catch (error) {
        console.error("Deals load karne mein error:", error);
    }
};
// Functions globally available karo
window.goHome = goHome;
window.goService = goService;
window.goJobs = goJobs;
window.goShare = goShare;
window.goDeals = goDeals;

// Auto show home screen on load
setTimeout(function() {
    goHome();
}, 500);

console.log("✅ Simple footer functions loaded");

// ============ SINGLE AUTH SYSTEM ============

// 1. Login Screen dikhane ka function
window.showLoginScreen = function() {
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('registrationScreen').style.display = 'flex';
    document.getElementById('profileInputSection').style.display = 'block';
    document.getElementById('otpSection').style.display = 'none';
    console.log("Login Screen shown");
};

// 2. Guest mode mein wapas aane ka function
window.backToGuestMode = function() {
    document.getElementById('registrationScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    console.log("Back to Guest Mode");
};

// 3. EK HI AUTH CLICK HANDLER (Login/Logout dono ke liye)
window.handleAuthClick = function() {
    const user = firebase.auth().currentUser;
    
    if (user) {
        // Log Out Logic - Confirm karo
        if(confirm('Kya aap logout karna chahte hain?')) {
            firebase.auth().signOut().then(() => {
                console.log("Logged out successfully");
                // FORCE UI UPDATE - NO DELAY
                updateAuthUI();
                // Guest ko home screen par le jao
                goHome();
                alert("✅ Logout ho gaya. Ab aap guest mode mein hain.");
            }).catch(err => {
                console.error("Logout error:", err);
                alert("❌ Logout mein error aayi. Please try again.");
            });
        }
    } else {
        // Login Screen dikhao
        showLoginScreen();
    }
};

// 4. SINGLE UI UPDATE FUNCTION - Yeh button ko sahi se update karega
function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const authText = document.getElementById('authText');
    const authIcon = document.getElementById('authIcon');
    
    if (!authBtn) {
        console.error("Auth button not found!");
        return;
    }
    
    const user = firebase.auth().currentUser;
    
    console.log("🔄 UI Update - User:", user ? "Logged In" : "Guest");
    
    if (user) {
        // LOGGED IN - RED LOGOUT BUTTON
        authBtn.style.backgroundColor = '#ff4d4f';
        authBtn.style.color = 'white';
        authBtn.style.border = 'none';
        authBtn.style.padding = '8px 15px';
        authBtn.style.fontWeight = 'bold';
        
        if(authText) authText.innerText = "Logout";
        if(authIcon) authIcon.className = "fas fa-sign-out-alt";
        
        console.log("✅ Button set to RED - Logout");
    } else {
        // GUEST - GREEN LOGIN BUTTON  
        authBtn.style.backgroundColor = '#28a745';
        authBtn.style.color = 'white';
        authBtn.style.border = 'none';
        authBtn.style.padding = '8px 15px';
        authBtn.style.fontWeight = 'bold';
        
        if(authText) authText.innerText = "Login";
        if(authIcon) authIcon.className = "fas fa-sign-in-alt";
        
        console.log("✅ Button set to GREEN - Login");
    }
}

// 5. FIXED AUTH STATE LISTENER
firebase.auth().onAuthStateChanged(user => {
    console.log("🔥 Auth State Changed:", user ? "Logged In" : "Guest");
    
    // Always show main app
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('registrationScreen').style.display = 'none';
    
    // Load data for both
    if(typeof startFirebaseListener === 'function') {
        startFirebaseListener();
    }
    
    // IMMEDIATE UI UPDATE - NO DELAY
    updateAuthUI();
});

// 6. FIXED LOGOUT BUTTON OVERRIDE
window.logOut = window.handleAuthClick;

// 7. PAGE LOAD PAR UI CHECK
setTimeout(function() {
    console.log("🔄 Page Load - Checking Auth Status...");
    updateAuthUI();
}, 1000);

console.log("✅ Single Auth System Loaded");
// Copy and Paste this at the bottom of script.js
window.shareApp = function() {
    const shareData = {
        title: 'Fatehpur Hubs',
        text: 'फतेहपुर की सभी सर्विस और जॉब्स अब एक ही जगह पर। अभी डाउनलोड करें:',
        url: 'https://play.google.com/store/apps/details?id=in.co.fatehpurhubs'
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Shared successfully'))
            .catch((err) => console.log('Error: ' + err));
    } else {
        // Agar mobile share kaam na kare toh link copy karne ka option
        window.prompt("App लिंक कॉपी करें और शेयर करें:", "https://play.google.com/store/apps/details?id=in.co.fatehpurhubs");
    }
}
