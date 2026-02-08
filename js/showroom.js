
document.addEventListener('DOMContentLoaded', () => {
    let allCars = [];
    let currentPage = 1;
    // Determine items per page based on window width (Mobile < 768px)
    const isMobile = window.innerWidth < 768;
    const itemsPerPage = isMobile ? 8 : 12;

    const container = document.getElementById('showroom-container');
    const paginationContainer = document.getElementById('pagination-controls');
    const totalCountEl = document.getElementById('total-cars');

    // 1. Fetch Data
    fetch('cars.json')
        .then(response => response.json())
        .then(data => {
            // Convert Object {id: data} to Array [{id, ...data}]
            allCars = Object.entries(data).map(([key, value]) => {
                return { id: key, ...value };
            });

            // Update Total Count
            totalCountEl.textContent = allCars.length;

            // Initial Render
            renderPage(1);
            renderPagination();
        })
        .catch(err => {
            console.error("Error loading cars:", err);
            container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Error loading vehicle data.</p>';
        });

    // 2. Render Cars for specific page
    function renderPage(page) {
        currentPage = page;
        container.innerHTML = ''; // Clear current

        // Calculate slicing
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const carsToShow = allCars.slice(start, end);

        if (carsToShow.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%;">No vehicles found.</p>';
            return;
        }

        carsToShow.forEach(car => {
            // Handle Image Array or String
            const imgUrl = Array.isArray(car.image) ? car.image[0] : car.image;

            const carCard = `
                        <a href="car-details.html?id=${car.id}" class="car-card">
                            <div class="image-wrapper">
                                <img src="${imgUrl}" alt="${car.info['Car Model']}">
                            </div>
                            <div class="car-label">
                                <div>
                                    <span style="display:block; font-size:1.1rem;">${car.info['Car Model']}</span>
                                    <small style="color:gray; font-weight:normal;">${car.info['Vehicle Type'] || 'Premium'}</small>
                                </div>
                                <i class="arrow-icon fas fa-chevron-right"></i>
                            </div>
                        </a>
                    `;
            container.innerHTML += carCard;
        });

        // Scroll to top of grid on page change
        if (page > 1) {
            document.querySelector('.showroom-hero').scrollIntoView({ behavior: 'smooth' });
        }

        // Update pagination active state
        updatePaginationButtons();
    }

    // 3. Render Pagination Buttons
    function renderPagination() {
        const totalPages = Math.ceil(allCars.length / itemsPerPage);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return; // No pagination needed

        // Prev Button
        const prevBtn = createPageBtn('<i class="fas fa-chevron-left"></i>', () => {
            if (currentPage > 1) renderPage(currentPage - 1);
        });
        paginationContainer.appendChild(prevBtn);

        // Number Buttons
        for (let i = 1; i <= totalPages; i++) {
            const btn = createPageBtn(i, () => renderPage(i));
            if (i === currentPage) btn.classList.add('active');
            btn.dataset.page = i; // Tag for updating active state
            paginationContainer.appendChild(btn);
        }

        // Next Button
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
});