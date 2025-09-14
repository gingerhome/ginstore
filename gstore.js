// File: gstore.js

document.addEventListener('DOMContentLoaded', () => {
    let storeData = null;
    const storeUrl = new URL('.', window.location.href); // Base URL of the store

    // --- Modal Instances ---
    const installModal = new bootstrap.Modal(document.getElementById('installModal'));
    const galleryModal = new bootstrap.Modal(document.getElementById('galleryModal'));

    // --- DOM Elements ---
    const mainView = document.getElementById('mainView');
    const detailView = document.getElementById('detailView');
    const appListGrid = document.getElementById('appListGrid');
    const storeNameEl = document.getElementById('storeName');
    const storeLogoEl = document.getElementById('storeLogo');
    const featuredAppEl = document.getElementById('featuredApp');

    // --- Main Fetch and Render Function ---
    async function init() {
        try {
            const response = await fetch('gstore.json');
            if (!response.ok) throw new Error('Could not load gstore.json');
            storeData = await response.json();

            storeNameEl.textContent = storeData.storeName;
            storeLogoEl.src = storeData.storeLogo;
            document.title = storeData.storeName;

            window.addEventListener('hashchange', handleRouteChange);
            handleRouteChange(); // Initial route handling
        } catch (error) {
            console.error(error);
            appListGrid.innerHTML = `<p class="text-danger">${error.message}</p>`;
        }
    }

    // --- Routing ---
    function handleRouteChange() {
        const hash = window.location.hash;
        const appNameMatch = hash.match(/^#\/app\/(.+)/);

        if (appNameMatch && appNameMatch[1]) {
            const app = storeData.apps.find(a => a.name === appNameMatch[1]);
            if (app) {
                renderDetailView(app);
            } else {
                renderMainView(); // Fallback if app not found
            }
        } else {
            renderMainView();
        }
    }

    // --- View Rendering ---
    function renderMainView() {
        detailView.classList.add('d-none');
        mainView.classList.remove('d-none');

        // Render Featured App
        const featuredApp = storeData.apps.find(a => a.featured);
        if (featuredApp) {
            featuredAppEl.innerHTML = `
                <div class="card bg-white text-center mb-5">
                    <div class="card-body row">
                        <div class="col-sm-12 col-md-3">
                            <img src="${featuredApp.icon_url}" class="w-100" alt="${featuredApp.name} logo">
                        </div>
                        <div class="col-sm-12 col-md-9 p-3">
                            <div class="text-start vertical-center">
                                <h1 class="display-5">${featuredApp.name}</h1>
                                <p class="lead">${featuredApp.description}</p>
                                <div class="text-end">
                                    <a href="#/app/${featuredApp.name}" class="btn btn-primary btn-small mx-auto">View Details</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Render App Grid
        appListGrid.innerHTML = storeData.apps.map(app => `
            <div class="col mb-3">
                <a href="#/app/${app.name}" class="text-decoration-none">
                    <div class="card h-100 app-card">
                        <div class="card-body d-flex flex-column">
                            <img src="${app.icon_url}" width="250" class="rounded mb-3" alt="${app.name} icon">
                            <div>
                                <h5 class="card-title mb-1">${app.name} <span class="text-muted small">v${app.version}</span></h5>
                                <p class="card-text small text-muted">${app.description}</p>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
    }

    function renderDetailView(app) {
        mainView.classList.add('d-none');
        detailView.classList.remove('d-none');

        detailView.innerHTML = `
            <div>
                <a href="#" class="btn btn-light btn-sm mb-4">&larr; Back to All Apps</a>
                <div class="row bg-white p-4 border border-1 border-light rounded">
                    <div class="col-sm-12 col-md-10">
                        <div class="row">
                            <div class="col-sm-12 col-md-4 me-4 mb-3">
                                <img src="${app.icon_url}" class="w-100 rounded me-4" alt="${app.name} icon">
                            </div>
                            <div class="col-sm-12 col-md-8">
                                <h1 class="display-6 mb-1">${app.name}</h1>
                                <p class="text-muted">By ${app.publisher.name} | Category: ${app.category}</p>
                            </div>
                        </div>
                        <p>${app.long_description}</p>
                        <p><strong>Version:</strong> ${app.version}</p>
                        ${app.license ? `<p><strong>License:</strong> ${app.license}</p>` : ''}
                        ${app.website ? `<a href="${app.website}" target="_blank" class="btn btn-light border border-1 mt-2 me-2 mb-3">Homepage</a>` : ''}
                        ${app.download_url ? `<a href="${location.protocol + location.host + '/' + app.download_url}" target="_blank" class="btn btn-light border border-1 mt-2 me-2 mb-3">Download</a>` : ''}

                    </div>
                    <div class="col-sm-12 col-md-2">
                        <div class="d-grid gap-2">
                           <button class="btn btn-primary btn-lg mt-2" data-app-name="${app.name}">Install App</button>
                        </div>
                    </div>
                </div>

                <h3 class="mt-5 mb-4">Gallery</h3>
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 bg-white mt-2 mb-4">
                    ${app.gallery.map(item => `
                        <div class="card border-0">
                            <div class="card-body d-flex flex-column">
                                <img src="${item.image_url}" class="border border-1 border-secondary img-thumbnail gallery-image" alt="${item.title}" data-bs-toggle="modal" data-bs-target="#galleryModal" data-img-src="${item.image_url}" data-img-title="${item.title}">
                                <div class="mt-2">
                                    <p class="card-text small">${item.title}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // --- Event Listeners ---
    document.body.addEventListener('click', e => {
        // Handle Install button clicks
        if (e.target && e.target.matches('[data-app-name]')) {
            const appName = e.target.dataset.appName;
            const command = `gingee-cli install-store-app ${appName} -g ${storeUrl.href}`;
            document.getElementById('installCommand').textContent = command;
            installModal.show();
        }

        // Handle gallery image clicks
        if (e.target && e.target.matches('.gallery-image')) {
            document.getElementById('galleryModalImage').src = e.target.dataset.imgSrc;
            document.getElementById('galleryModalTitle').textContent = e.target.dataset.imgTitle;
        }
    });

    document.getElementById('copyCommandBtn').addEventListener('click', () => {
        const command = document.getElementById('installCommand').textContent;
        navigator.clipboard.writeText(command).then(() => {
            const btn = document.getElementById('copyCommandBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = originalText; }, 2000);
        });
    });

    // --- Initialize ---
    init();
});
