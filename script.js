// Global variables are now defined in index.html (db, auth, loggedInUser, verificationId)

// --- SCREEN MANAGEMENT ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });

    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.classList.remove('hidden');
        activeScreen.classList.add('active');
        
        if (screenId === 'home-screen') {
            loadMistrisFromFirebase('All', 'mistri-list');
        } else if (screenId === 'search-screen') {
            loadAllCategories();
            loadMistrisFromFirebase('All', 'mistri-list-full');
        }
    }
}
});
};  // ye serviceProviders array khatam hone ka hai

// YAHAN ADD KARO - Service Registration Function
function registerService() {
    console.log("Register service function called");
    
    const name = document.getElementById('providerName').value;
    const phone = document.getElementById('providerPhone').value;
    const category = document.getElementById('serviceCategory').value;
    const area = document.getElementById('providerArea').value;
    const experience = document.getElementById('providerExperience').value;
    
    if (!name || !phone || !category || !area || !experience) {
        alert('❌ Please fill all fields');
        return false;
    }
    
    const newProvider = {
        name: name,
        category: category,
        phone: phone,
        area: area,
        experience: experience,
        rating: "⭐️⭐️⭐️⭐️"
    };
    
    serviceProviders.push(newProvider);
    loadServiceProviders();
    
    document.getElementById('providerName').value = '';
    document.getElementById('providerPhone').value = '';
    document.getElementById('serviceCategory').value = '';
    document.getElementById('providerArea').value = '';
    document.getElementById('providerExperience').value = '';
    
    alert('✅ Service registered successfully!');
    return false;
}
