document.addEventListener('DOMContentLoaded', () => {
    const vehiclesData = [];
    let cart = [];
    const productsContainer = document.getElementById('productsContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const searchInput = document.getElementById('searchInput');
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const quantityInput = document.getElementById('quantityInput');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const processPaymentBtn = document.getElementById('processPaymentBtn');
    let selectedVehicle = null;

    async function loadVehicles() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/JUANCITOPENA/Pagina_Vehiculos_Ventas/refs/heads/main/vehiculos.json');
            if (!response.ok) throw new Error('Error al cargar los datos');
            const data = await response.json();
            vehiclesData.push(...data);
            displayVehicles(vehiclesData);
        } catch (error) {
            productsContainer.innerHTML = '<p class="text-danger">Error al cargar los vehículos. Por favor, intente más tarde.</p>';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    function displayVehicles(vehicles) {
        productsContainer.innerHTML = '';
        vehicles.forEach(vehicle => {
            const cleanTipo = vehicle.tipo.replace(/[\u{1F600}-\u{1F6FF}]/gu, ''); // Quitar emojis
            const card = `
                <div class="col-md-4 col-sm-6 mb-4">
                    <div class="card h-100">
                        <img src="${vehicle.imagen}" class="card-img-top" alt="${vehicle.marca} ${vehicle.modelo}" loading="lazy">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${vehicle.marca} ${vehicle.modelo}</h5>
                            <p class="card-text">Categoría: ${vehicle.categoria}</p>
                            <p class="card-text">Tipo: ${cleanTipo}</p>
                            <p class="card-text">Precio: $${vehicle.precio_venta.toLocaleString()}</p>
                            <button class="btn btn-primary mt-auto addToCartBtn" data-codigo="${vehicle.codigo}">Añadir al Carrito</button>
                            <button class="btn btn-secondary mt-2 viewDetailsBtn" data-codigo="${vehicle.codigo}">Ver Detalle</button>
                        </div>
                    </div>
                </div>
            `;
            productsContainer.insertAdjacentHTML('beforeend', card);
        });
        addAddToCartListeners();
        addViewDetailsListeners();
    }

    function filterVehicles() {
        const searchText = searchInput.value.toLowerCase();
        const filtered = vehiclesData.filter(vehicle => 
            vehicle.marca.toLowerCase().includes(searchText) ||
            vehicle.modelo.toLowerCase().includes(searchText) ||
            vehicle.categoria.toLowerCase().includes(searchText)
        );
        displayVehicles(filtered);
    }

    function addAddToCartListeners() {
        document.querySelectorAll('.addToCartBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const codigo = parseInt(e.target.dataset.codigo);
                selectedVehicle = vehiclesData.find(v => v.codigo === codigo);
                showQuantityModal();
            });
        });
    }

    function addViewDetailsListeners() {
        productsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('viewDetailsBtn')) {
                const codigo = parseInt(e.target.dataset.codigo);
                const vehicle = vehiclesData.find(v => v.codigo === codigo);
                showDetailModal(vehicle);
            }
        });
    }

    function showQuantityModal() {
        quantityInput.value = 1;
        const quantityModal = new bootstrap.Modal(document.getElementById('quantityModal'));
        quantityModal.show();

        addToCartBtn.onclick = () => {
            const quantity = parseInt(quantityInput.value);
            if (quantity > 0) {
                addItemToCart(selectedVehicle, quantity);
                quantityModal.hide();
            } else {
                alert('La cantidad debe ser mayor que 0');
            }
        };
    }

    function showDetailModal(vehicle) {
        document.getElementById('detailImage').src = vehicle.imagen;
        document.getElementById('detailImage').alt = `${vehicle.marca} ${vehicle.modelo}`;
        const detailList = document.getElementById('detailList');
        detailList.innerHTML = `
            <li class="list-group-item">Marca: ${vehicle.marca}</li>
            <li class="list-group-item">Modelo: ${vehicle.modelo}</li>
            <li class="list-group-item">Categoría: ${vehicle.categoria}</li>
            <li class="list-group-item">Tipo: ${vehicle.tipo.replace(/[\u{1F600}-\u{1F6FF}]/gu, '')}</li>
            <li class="list-group-item">Precio: $${vehicle.precio_venta.toLocaleString()}</li>
        `;
        const addToCartFromDetailBtn = document.getElementById('addToCartFromDetailBtn');
        addToCartFromDetailBtn.dataset.codigo = vehicle.codigo;
        const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
        detailModal.show();

        addToCartFromDetailBtn.onclick = () => {
            selectedVehicle = vehicle;
            detailModal.hide();
            showQuantityModal();
        };
    }

    function addItemToCart(vehicle, quantity) {
        const existingItem = cart.find(item => item.codigo === vehicle.codigo);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                imagen: vehicle.imagen,
                logo: vehicle.logo, // Asumiendo que existe en JSON, si no, ajustar
                codigo: vehicle.codigo,
                marca: vehicle.marca,
                modelo: vehicle.modelo,
                precio: vehicle.precio_venta,
                quantity: quantity
            });
        }
        updateCartUI();
    }

    function updateCartUI() {
        cartItems.innerHTML = '';
        let total = 0;
        let count = 0;
        cart.forEach(item => {
            const subtotal = item.precio * item.quantity;
            total += subtotal;
            count += item.quantity;
            const itemElement = `
                <div class="d-flex align-items-center mb-3">
                    <img src="${item.imagen}" alt="${item.marca} ${item.modelo}" style="width: 50px; height: 50px; object-fit: cover;" class="me-2">
                    <img src="${item.logo}" alt="Logo ${item.marca}" style="width: 30px; height: 30px;" class="me-3">
                    <p class="mb-0 flex-grow-1">${item.marca} ${item.modelo} - Cantidad: ${item.quantity} - Subtotal: $${subtotal.toLocaleString()}</p>
                </div>
            `;
            cartItems.insertAdjacentHTML('beforeend', itemElement);
        });
        cartTotal.textContent = `$${total.toLocaleString()}`;
        cartCount.textContent = count;
    }

    checkoutBtn.addEventListener('click', () => {
        const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        cartModal.hide();
        const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
        paymentModal.show();
    });

    processPaymentBtn.addEventListener('click', () => {
        alert('Pago exitoso!');
        generateInvoice();
        cart = [];
        updateCartUI();
        bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
    });

    function generateInvoice() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('Factura GarageOnline', 10, 10);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 20);
        let y = 30;
        cart.forEach(item => {
            const subtotal = item.precio * item.quantity;
            doc.text(`${item.marca} ${item.modelo} - Cant: ${item.quantity} - Sub: $${subtotal.toLocaleString()}`, 10, y);
            y += 10;
        });
        doc.text(`Total: $${cart.reduce((sum, item) => sum + item.precio * item.quantity, 0).toLocaleString()}`, 10, y);
        doc.save('factura_garageonline.pdf');
    }

    searchInput.addEventListener('input', filterVehicles);
    loadVehicles();
});