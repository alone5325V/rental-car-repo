document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Supabase (REPLACE WITH YOUR ACTUAL URL AND ANON KEY)
    const SUPABASE_URL = 'https://kshpzepziymekpfyvpyr.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaHB6ZXB6aXltZWtwZnl2cHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Njg4NjksImV4cCI6MjA4NjU0NDg2OX0.cf-HVfuRL18v9cdroBPamF6YQxAEaKYQ4aLDxrkvk7o';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let allCars = [];
    let currentPage = 1;
    const isMobile = window.innerWidth < 768;
    const itemsPerPage = isMobile ? 8 : 12;

    const container = document.getElementById('showroom-container');
    const paginationContainer = document.getElementById('pagination-controls');
    const totalCountEl = document.getElementById('total-cars');

    // Helper: Get public image URL from Supabase Storage
    function getImageUrl(imagePath) {
        if (!imagePath) return 'placeholder.jpg';
        const { data } = supabase.storage.from('car-photos').getPublicUrl(imagePath);
        return data.publicUrl;
    }

    // 2. Fetch Data from Supabase
    async function fetchCars() {
        try {
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .order('created_at', { ascending: false }); // Optional: order by newest

            if (error) throw error;

            allCars = data;
            totalCountEl.textContent = allCars.length;

            renderPage(1);
            renderPagination();
        } catch (err) {
            console.error("Error loading cars from Supabase:", err);
            container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Error loading vehicle data.</p>';
        }
    }

    // 3. Render Cars for specific page
    function renderPage(page) {
        currentPage = page;
        container.innerHTML = ''; 

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const carsToShow = allCars.slice(start, end);

        if (carsToShow.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%;">No vehicles found.</p>';
            return;
        }

        carsToShow.forEach(car => {
            // Handle Image Array from Supabase
            const imagePath = Array.isArray(car.images) && car.images.length > 0 ? car.images[0] : null;
            const imgUrl = getImageUrl(imagePath);

            // Using Supabase column names (car.car_model, car.vehicle_type)
            const carCard = `
                <a href="car-details.html?id=${car.id}" class="car-card">
                    <div class="image-wrapper">
                        <img src="${imgUrl}" alt="${car.car_model || 'Car'}">
                    </div>
                    <div class="car-label">
                        <div>
                            <span style="display:block; font-size:1.1rem;">${car.car_model || 'Unknown Model'}</span>
                            <small style="color:gray; font-weight:normal;">${car.vehicle_type || 'Premium'}</small>
                        </div>
                        <i class="arrow-icon fas fa-chevron-right"></i>
                    </div>
                </a>
            `;
            container.innerHTML += carCard;
        });

        if (page > 1) {
            document.querySelector('.showroom-hero').scrollIntoView({ behavior: 'smooth' });
        }

        updatePaginationButtons();
    }

    // 4. Render Pagination Buttons (Unchanged logic)
    function renderPagination() {
        const totalPages = Math.ceil(allCars.length / itemsPerPage);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        const prevBtn = createPageBtn('<i class="fas fa-chevron-left"></i>', () => {
            if (currentPage > 1) renderPage(currentPage - 1);
        });
        paginationContainer.appendChild(prevBtn);

        for (let i = 1; i <= totalPages; i++) {
            const btn = createPageBtn(i, () => renderPage(i));
            if (i === currentPage) btn.classList.add('active');
            btn.dataset.page = i; 
            paginationContainer.appendChild(btn);
        }

        const nextBtn = createPageBtn('<i class="fas fa-chevron-right"></i>', () => {
            if (currentPage < totalPages) renderPage(currentPage + 1);
        });
        paginationContainer.appendChild(nextBtn);
    }

    function createPageBtn(content, onClick) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        btn.innerHTML = content;
        btn.addEventListener('click', onClick);
        return btn;
    }

    function updatePaginationButtons() {
        const btns = paginationContainer.querySelectorAll('.page-btn');
        btns.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.page) === currentPage) {
                btn.classList.add('active');
            }
        });
    }

    // Trigger the fetch
    fetchCars();
});