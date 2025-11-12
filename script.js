let serviceProviders = [];
let currentFilter = '';

function startFirebaseListener() {
    providersRef.on('value', snapshot => {
        serviceProviders = [];
        snapshot.forEach(child => {
            serviceProviders.push({ id: child.key, ...child.val() });
        });
        displayServices();
    });

    jobsRef.on('value', snapshot => {
        const jobs = [];
        snapshot.forEach(child => jobs.push({ id: child.key, ...child.val() }));
        displayJobs(jobs);
    });
}

function loadCategories() {
    const categories = ["Plumber","Electrician","Carpenter","Mason","Painter","AC Mechanic","Tiler","Beautician","Home Cleaning","Security Guard","Laundry Service","Legal Consultant","Private Teacher","Computer Repair","Welder"];
    const container = document.getElementById('mistri-categories');
    container.innerHTML = categories.map(cat => `<button class="cat-btn" onclick="filterByCategory('${cat}')">${cat}</button>`).join('');
}

function filterByCategory(cat) {
    currentFilter = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
    event.target.classList.add('selected');
    displayServices();
}

function searchServices() {
    displayServices();
}

function displayServices() {
    let filtered = serviceProviders;
    const search = document.getElementById('main-search-bar').value.toLowerCase();
    if (currentFilter) filtered = filtered.filter(p => p.category === currentFilter);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search) || p.area.toLowerCase().includes(search));

    const list = document.getElementById('mistri-list');
    if (filtered.length === 0) {
        list.innerHTML = '<h3>Available Services</h3><p style="text-align:center;color:#999;">Koi service nahi mili</p>';
        return;
    }
    list.innerHTML = '<h3>Available Services</h3>' + filtered.map(p => `
        <div class="profile-card">
            <h4 style="margin:0 0 5px;color:#2a5298;">${p.name} <span style="font-size:12px;color:#666;">(${p.category})</span></h4>
            <p style="margin:5px 0;color:#666;">${p.area} | ${p.experience} years experience</p>
            <div style="display:flex;justify-content:space-between;margin-top:10px;">
                <button class="contact-btn" onclick="window.open('tel:${p.phone}')">Call</button>
                str += `<button class="whatsapp-btn" onclick="openWhatsApp('${item.phone}')">WhatsApp</button>`;
                <button class="share-btn-inline" onclick="navigator.share({title:'${p.name}', text:'${p.category} in ${p.area}', url:'https://www.fatehpurhubs.co.in'})">Share</button>
            </div>
        </div>
    `).join('');
}

function loadAds() { if (typeof showAds === 'function') showAds(); }
function loadJobs() { /* already in listener */ }
function displayJobs(jobs) {
    const list = document.getElementById('jobs-list');
    if (jobs.length === 0) { list.innerHTML = '<p>No jobs posted yet</p>'; return; }
    list.innerHTML = jobs.map(j => `<div class="profile-card"><h4>${j.title}</h4><p>${j.shopName} | ${j.location} | ₹${j.salary}</p><p>${j.description}</p><button class="whatsapp-btn" onclick="window.open('https://wa.me/91${j.phone}')">Contact</button></div>`).join('');
}
