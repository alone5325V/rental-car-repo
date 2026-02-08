document.addEventListener('DOMContentLoaded', () => {

    
    /* =========================================
   POPULAR CARS INJECTOR (Japanese Style)
   ========================================= */
const popularContainer = document.getElementById('popular-cars-container');

if (popularContainer) {
    // 1. Detect limit based on screen width
    const isMobile = window.innerWidth < 768;
    const limit = isMobile ? 6 : 10;

    fetch('cars.json')
        .then(res => res.json())
        .then(data => {
            const cars = Object.entries(data);
            const selectedCars = cars.slice(0, limit); // Cut list to 6 or 10

            popularContainer.innerHTML = ''; // Clear loading text

            selectedCars.forEach(([id, car]) => {
                // Formatting data for display
                const name = car.info["Car Model"];
                const type = car.info["Vehicle Type"] || "Car";
                const capacity = car.info["Capacity(Persons)"] || "5";
                const transmission = car.info["Mission"] || "AT";
                
                // Get lowest price (High context: showing "From ¥2500")
                const price = car.pricing["OFF season"]["same-day rates"];
                const img = Array.isArray(car.image) ? car.image[0] : car.image;

                const cardHTML = `
                <div class="jp-card">
                    <div class="jp-card-header">
                        <h3 class="jp-card-title">${name}</h3>
                        <span class="jp-card-badge">${type}</span>
                    </div>

                    <div class="jp-card-img">
                        <img src="${img}" alt="${name}">
                        <div class="jp-tag-overlay">免責補償込 (Insured)</div>
                    </div>

                    <div class="jp-card-specs">
                        <span class="jp-spec-item"><i class="fas fa-user"></i> ${capacity}名</span>
                        <span class="jp-spec-item"><i class="fas fa-cog"></i> ${transmission}</span>
                        <span class="jp-spec-item"><i class="fas fa-smoking-ban"></i> 禁煙</span>
                    </div>

                    <div class="jp-card-footer">
                        <div class="jp-price-block">
                            <div class="jp-price-label">24時間 (24h)</div>
                            <span class="jp-price-unit">¥</span>
                            <span class="jp-price-val">${price.toLocaleString()}</span>
                            <span class="jp-price-unit">~</span>
                        </div>
                        <a href="car-details.html?id=${id}" class="jp-btn-detail">
                            詳細 (Details) <i class="fas fa-chevron-right"></i>
                        </a>
                    </div>
                </div>
                `;
                popularContainer.innerHTML += cardHTML;
            });
        })
        .catch(err => console.error("Error loading popular cars:", err));
}
    
    // --- 1. Header Scroll Effect ---
    const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 2. Mobile Drawer Logic ---
    const menuToggle = document.getElementById('menuToggle');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('mobileOverlay');
    const closeBtn = document.getElementById('closeMenuBtn');

    if (menuToggle && drawer && overlay) {
        function openMenu() {
            drawer.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        }

        function closeMenu() {
            drawer.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        menuToggle.addEventListener('click', openMenu);
        if(closeBtn) closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
    }

    // --- 3. Smart Date Logic ---
    const pickupInput = document.getElementById('pickup-date');
    const returnInput = document.getElementById('return-date');

    if (pickupInput && returnInput) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        // Adjust for timezone offset if needed, simplified here
        const toLocalISO = (date) => {
             const offset = date.getTimezoneOffset() * 60000;
             return new Date(date - offset).toISOString().slice(0, 16);
        };

        const pickupStr = toLocalISO(now);
        
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const returnStr = toLocalISO(tomorrow);

        pickupInput.value = pickupStr;
        // pickupInput.min = toLocalISO(new Date()); // Optional restriction
        returnInput.value = returnStr;
        
        pickupInput.addEventListener('change', (e) => {
            returnInput.min = e.target.value;
        });
    }

    // --- 4. Search Animation ---
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.search-btn');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Checking...';
            btn.style.opacity = '0.9';
            
            setTimeout(() => {
                alert('Searching for available cars...');
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                // window.location.href = 'showroom.html'; // Uncomment to link
            }, 1000);
        });
    }
});

// Scroll to Top
const returnTop = document.getElementById('return_top');
if (returnTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            returnTop.style.opacity = "1";
            returnTop.style.pointerEvents = "auto";
        } else {
            returnTop.style.opacity = "0";
            returnTop.style.pointerEvents = "none";
        }
    });

    returnTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}