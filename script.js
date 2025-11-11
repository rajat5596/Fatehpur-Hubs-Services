// TOP PE YE LINE ADD KARO
firebase.initializeApp(window.firebaseConfig);
const database = firebase.database();
const providersRef = database.ref('service_providers');
const jobsRef = database.ref('local_jobs');
window.providersRef = providersRef;
window.jobsRef = jobsRef;
// script.js - FINAL 100% WORKING VERSION
// REAL OTP LOGIN + CATEGORY BUTTONS + SEARCH + REGISTER + JOBS

let serviceProviders = [];
let jobListings = [];

// Firebase Initialize (index.html se config load hoga)
let database, auth, providersRef, jobsRef;

// Card banane ka function
function createProfessionalCard(p) {
    return `
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
                <h4 style="margin:0 0 5px;color:#2a5298;">${p.name}</h4>
                <p style="margin:2px 0;color:#666;">${p.category}</p>
                <p style="margin:2px 0;color:#666;">${p.area}</p>
                <p style="margin:2px 0;color:#666;">${p.experience} years exp</p>
                <p style="margin:2px 0;color:#25D366;font-weight:bold;">⭐⭐⭐⭐</p>
            </div>
            <div>
                <button class="contact-btn" onclick="callNumber('${p.phone}')">Call</button>
                <button class="whatsapp-btn" onclick="openWhatsApp('${p.phone}')">WhatsApp</button>
                <button class="share-btn-inline" onclick="shareProvider('${p.name}','${p.category}','${p.phone}')">Share</button>
            </div>
        </div>`;
}

// Firebase Listeners
function startFirebaseListener() {
    providersRef.on('value', snap => {
        serviceProviders = [];
        const div = document.getElementById('mistri-list');
        div.innerHTML = '<h3>Available Services</h3>';
        if (!snap.exists()) {
            div.innerHTML += '<p style="text-align:center;color:#666;">No services yet.</p>';
            return;
        }
        snap.forEach(child => {
            const p = child.val();
            serviceProviders.push(p);
            const card = document.createElement('div');
            card.className = 'profile-card';
            card.innerHTML = createProfessionalCard(p);
            div.appendChild(card);
        });
        // Re-apply filter if any
        const selected = document.querySelector('.cat-btn.selected');
        if (selected) filterByCategory(selected.innerText.trim());
    });

    jobsRef.on('value', snap => {
        const div = document.getElementById('jobs-list');
        div.innerHTML = '<h3>Local Jobs</h3>';
        if (!snap.exists()) {
            div.innerHTML += '<p style="text-align:center;color:#666;">No jobs yet.</p>';
            return;
        }
        snap.forEach(child => {
            const j = child.val();
            const card = document.createElement('div');
            card.className = 'profile-card';
            card.innerHTML = `
                <h4 style="color:#2a5298;">${j.title} - ${j.shopName || 'Business'}</h4>
                <p>${j.location} | ${j.salary}</p>
                <p>${j.description}</p>
                <div style="margin-top:10px;display:flex;gap:8px;">
                    <button class="contact-btn" onclick="callNumber('${j.phone}')">Call</button>
                    <button class="whatsapp-btn" onclick="openWhatsApp('${j.phone}')">Apply</button>
                </div>`;
            div.appendChild(card);
        });
    });
}

// Register Service
function registerService() {
    const name = document.getElementById('providerName').value.trim();
    const phone = document.getElementById('providerPhone').value.trim();
    const category = document.getElementById('serviceCategory').value;
    const area = document.getElementById('providerArea').value.trim();
    const exp = document.getElementById('providerExperience').value.trim();

    if (!name || !phone || !category || !area || !exp) {
        alert("All fields required!");
        return;
    }
    if (phone.length !== 10) {
        alert("Enter 10-digit phone number");
        return;
    }

    providersRef.push({
        name, phone, category, area, experience: exp,
        rating: "New", timestamp: Date.now()
    }).then(() => {
        alert("Service Registered Successfully!");
        document.getElementById('serviceForm').reset();
    }).catch(err => alert("Error: " + err.message));
}

// Post Job
function postJob() {
    const title = document.getElementById('jobTitle').value.trim();
    const shop = document.getElementById('shopName').value.trim();
    const phone = document.getElementById('jobPhone').value.trim();
    const loc = document.getElementById('jobLocation').value.trim();
    const salary = document.getElementById('jobSalary').value.trim();
    const desc = document.getElementById('jobDescription').value.trim();

    if (!title || !shop || !phone || !loc || !salary || !desc) {
        alert("Fill all job fields!");
        return;
    }

    jobsRef.push({
        title, shopName: shop, phone, location: loc, salary, description: desc,
        timestamp: Date.now()
    }).then(() => {
        alert("Job Posted!");
        document.getElementById('jobForm').reset();
    }).catch(err => alert("Error: " + err.message));
}

// Category Filter (Direct Buttons)
function filterByCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.innerText.includes(cat)) btn.classList.add('selected');
    });
    document.querySelectorAll('#mistri-list .profile-card').forEach(card => {
        card.style.display = card.textContent.includes(cat) ? 'block' : 'none';
    });
}

// Search Bar
document.getElementById('main-search-bar')?.addEventListener('input', function(e) {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#mistri-list .profile-card').forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(q) ? 'block' : 'none';
    });
});

// Helper Functions
function callNumber(p) { window.location.href = `tel:+91${p}`; }
function openWhatsApp(p) { window.open(`https://wa.me/91${p}?text=Hello%20from%20Fatehpur%20Hubs`, '_blank'); }
function shareProvider(n, c, p) {
    const m = `${n} (${c})\nPhone: ${p}\nDownload Fatehpur Hubs App`;
    if (navigator.share) navigator.share({text: m});
    else window.open(`https://wa.me/?text=${encodeURIComponent(m)}`);
}
function shareApp() {
    const m = "Fatehpur Hubs - Best local services app!";
    if (navigator.share) navigator.share({text: m});
    else window.open(`https://wa.me/?text=${encodeURIComponent(m)}`);
}
function contactForAds() { window.open(`https://wa.me/919889904191?text=Hello,%20I%20want%20ads`); }
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Skip Login (Local Test)
function skipLogin() {
    document.getElementById('loginScreen').style.display = 'none';
    startFirebaseListener();
}

// REAL OTP LOGIN (Blaze Plan Supported)
let confirmationResult, recaptchaVerifier;

window.onload = () => {
    // Firebase init from index.html
    const firebaseConfig = window.firebaseConfig || {
        apiKey: "AIzaSyA37JsLUIG-kypZ55vdpLTp3WKHgRH2IwY",
        authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
        databaseURL: "https://fatehpur-hubs-a3a9f-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "fatehpur-hubs-a3a9f",
        storageBucket: "fatehpur-hubs-a3a9f.appspot.com",
        messagingSenderId: "294360741451",
        appId: "1:294360741451:web:3bc85078805750b9fabfce"
    };
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    auth = firebase.auth();
    providersRef = database.ref('service_providers');
    jobsRef = database.ref('local_jobs');

    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { size: 'invisible' });

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            document.getElementById('loginScreen').style.display = 'none';
            startFirebaseListener();
        }
    });

    document.getElementById('sendOtpBtn').onclick = () => {
        const phone = document.getElementById('phoneInput').value;
        if (!phone || phone.length < 10) {
            document.getElementById('loginMsg').innerHTML = "Valid number daaliye";
            return;
        }
        firebase.auth().signInWithPhoneNumber(phone, recaptchaVerifier)
            .then(c => {
                confirmationResult = c;
                document.getElementById('otpSection').style.display = 'block';
                document.getElementById('sendOtpBtn').style.display = 'none';
                document.getElementById('loginMsg').innerHTML = "<span style='color:green'>OTP bheja gaya!</span>";
            })
            .catch(err => {
                document.getElementById('loginMsg').innerHTML = err.message;
            });
    };

    document.getElementById('verifyOtpBtn').onclick = () => {
        const otp = document.getElementById('otpInput').value;
        if (otp.length !== 6) {
            document.getElementById('loginMsg').innerHTML = "6 digit OTP daaliye";
            return;
        }
        confirmationResult.confirm(otp)
            .then(() => {
                document.getElementById('loginScreen').style.display = 'none';
                startFirebaseListener();
            })
            .catch(() => {
                document.getElementById('loginMsg').innerHTML = "Galat OTP";
            });
    };

    // Form submits
    document.getElementById('serviceForm').onsubmit = e => { e.preventDefault(); registerService(); };
    document.getElementById('jobForm').onsubmit = e => { e.preventDefault(); postJob(); };
};
