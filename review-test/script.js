const firebaseConfig = {
    apiKey: "AIzaSyA37JsLUIG-kypZ55vdpLTp3WKHgRH2IwY",
    authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
    databaseURL: "https://fatehpur-hubs-a3a9f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fatehpur-hubs-a3a9f",
    storageBucket: "fatehpur-hubs-a3a9f.appspot.com",
    messagingSenderId: "294360741451",
    appId: "1:294360741451:web:3bc85078805750b9fabfce"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const providersRef = db.ref('serviceProviders');

let serviceProviders = [];

providersRef.on('value', snap => {
    serviceProviders = [];
    snap.forEach(child => {
        serviceProviders.push({key: child.key, ...child.val()});
    });
    displayAll();
});

function displayAll() {
    const container = document.getElementById('mistri-list');
    container.innerHTML = serviceProviders.map(p => `
        <div class="bg-white rounded-lg shadow p-5 mb-4 border">
            <h3 class="font-bold text-xl text-blue-700">\( {p.name} <span class="text-sm text-gray-600">( \){p.category})</span></h3>
            <p class="text-gray-600">📍 \( {p.area} | ☎️ \){p.phone}</p>
            
            <div id="avg-${p.key}" class="text-lg font-bold text-orange-500 my-2"></div>
            
            <button onclick="toggle('${p.key}')" class="bg-blue-600 text-white px-5 py-2 rounded-lg mt-2 hover:bg-blue-700">
                रिव्यू और रेटिंग देखें
            </button>
            
            <div id="sec-${p.key}" style="display:none; margin-top:15px; padding:15px; background:#f8f9fa; border-radius:10px;">
                <div class="text-4xl mb-3 cursor-pointer" onclick="rate(event, '${p.key}')">
                    <span data-v="1">★</span><span data-v="2">★</span><span data-v="3">★</span><span data-v="4">★</span><span data-v="5">★</span>
                </div>
                <textarea id="txt-${p.key}" class="w-full border rounded p-3" rows="3" placeholder="अपना अनुभव लिखें..."></textarea>
                <button onclick="submitReview('${p.key}')" class="bg-green-600 text-white px-6 py-2 rounded mt-3 hover:bg-green-700">
                    सबमिट करें
                </button>
                <div id="all-${p.key}" class="mt-5"></div>
            </div>
        </div>
    `).join('');

    serviceProviders.forEach(p => loadAvg(p.key));
}

function toggle(k) {
    const sec = document.getElementById('sec-'+k);
    sec.style.display = sec.style.display === 'block' ? 'none' : 'block';
    if (sec.style.display === 'block') loadReviews(k);
}

function rate(e, key) {
    const rating = e.target.dataset.v;
    const stars = e.target.parentElement.children;
    for (let s of stars) {
        s.style.color = (s.dataset.v <= rating) ? '#f59e0b' : '#ccc';
    }
    document.getElementById('txt-'+key).dataset.rating = rating;
}

function submitReview(key) {
    const textEl = document.getElementById('txt-'+key);
    const text = textEl.value.trim();
    const rating = textEl.dataset.rating || 0;
    if (!rating || !text) return alert("पहले स्टार दें और रिव्यू लिखें");

    db.ref('reviews/'+key).push({
        rating: parseInt(rating),
        text: text,
        time: Date.now()
    }).then(() => {
        alert("धन्यवाद! आपका रिव्यू सबमिट हो गया");
        textEl.value = '';
        delete textEl.dataset.rating;
        document.querySelectorAll(`#sec-${key} span`).forEach(s => s.style.color = '#ccc');
        loadAvg(key);
        loadReviews(key);
    });
}

function loadAvg(key) {
    db.ref('reviews/'+key).on('value', s => {
        const el = document.getElementById('avg-'+key);
        if (!s.exists()) return el.innerHTML = '<span class="text-gray-500">अभी कोई रेटिंग नहीं</span>';
        let total = 0, count = 0;
        s.forEach(r => { total += r.val().rating; count++; });
        el.innerHTML = `⭐ \( {(total/count).toFixed(1)}/5 ( \){count} रिव्यू)`;
    });
}

function loadReviews(key) {
    db.ref('reviews/'+key).once('value', s => {
        const div = document.getElementById('all-'+key);
        div.innerHTML = '<h4 class="font-bold text-lg mt-4 mb-2">सभी रिव्यू</h4>';
        if (!s.exists()) return div.innerHTML += '<p class="text-gray-500">कोई रिव्यू नहीं</p>';
        const revs = [];
        s.forEach(r => revs.push(r.val()));
        revs.reverse().forEach(r => {
            const date = new Date(r.time).toLocaleDateString('hi-IN');
            div.innerHTML += `
                <div class="border-b pb-3 mb-3">
                    <div class="flex justify-between">
                        <span class="font-bold">${'★'.repeat(r.rating)}</span>
                        <small class="text-gray-500">${date}</small>
                    </div>
                    <p class="mt-1">${r.text}</p>
                </div>`;
        });
    });
                              }
