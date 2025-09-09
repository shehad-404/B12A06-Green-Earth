const API_BASE = 'https://openapi.programming-hero.com/api';
const categoriesEl = document.getElementById('categories');
const plantsArea = document.getElementById('plantsArea');
const spinner = document.getElementById('spinner');
const cartList = document.getElementById('cartList');
const totalPriceEl = document.getElementById('totalPrice');

let cart = [];

function showSpinner() { spinner.style.display = 'flex'; }
function hideSpinner() { spinner.style.display = 'none'; }

function extractItems(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (json.data) {
        if (Array.isArray(json.data)) return json.data;
        if (json.data.data) return json.data.data;
    }
    return [];
}

async function loadCategories() {
    showSpinner();
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const json = await res.json();
        const cats = extractItems(json);
        cats.forEach(c => {
            const el = document.createElement('div');
            el.className = 'list-group-item';
            el.textContent = c.name || c.category_name || `Category ${c.id}`;
            el.dataset.id = c.id || c.category_id || '';
            el.addEventListener('click', () => onCategoryClick(el));
            categoriesEl.appendChild(el);
        });
    } catch (err) { console.error(err); }
    hideSpinner();
}

async function loadAllPlants() {
    showSpinner();
    try {
        const res = await fetch(`${API_BASE}/plants`);
        const json = await res.json();
        const plants = extractItems(json);
        renderPlants(plants.slice(0, 12));
    } catch (err) { console.error(err); }
    hideSpinner();
}

async function onCategoryClick(el) {
    document.querySelectorAll('#categories .list-group-item').forEach(x => x.classList.remove('active'));
    el.classList.add('active');
    const id = el.dataset.id;
    if (!id || id === 'all') { loadAllPlants(); return; }
    showSpinner();
    try {
        const res = await fetch(`${API_BASE}/category/${id}`);
        const json = await res.json();
        const items = extractItems(json);
        renderPlants(items.slice(0, 12));
    } catch (err) { console.error(err); }
    hideSpinner();
}

function renderPlants(items) {
    plantsArea.innerHTML = '';
    if (!items || items.length === 0) { plantsArea.innerHTML = '<p class="text-muted">No plants found.</p>'; return }
    items.forEach(item => {
        const id = item.id || Math.random().toString(36).substr(2, 9);
        const name = item.name || 'Unknown Plant';
        const img = item.image || 'https://via.placeholder.com/400x250?text=Plant';
        const desc = item.description || 'Lovely plant to grow in your garden.';
        const price = item.price || Math.floor(Math.random() * 500) + 100;

        const col = document.createElement('div'); col.className = 'col-md-4';
        col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${img}" class="card-img-top" style="height:180px;object-fit:cover">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title"><a href="#" class="plant-name" data-id="${id}">${name}</a></h5>
          <p class="card-text small text-muted">${desc}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <span class="badge-cat">${item.category || 'Tree'}</span>
            <div><strong>$${price}</strong></div>
          </div>
          <div class="mt-3">
            <button class="btn btn-success w-100 add-to-cart" data-id="${id}" data-price="${price}" data-name="${name}">Add to Cart</button>
          </div>
        </div>
      </div>`;
        plantsArea.appendChild(col);
    });

    document.querySelectorAll('.plant-name').forEach(el => el.addEventListener('click', openModalWithPlant));
    document.querySelectorAll('.add-to-cart').forEach(btn => btn.addEventListener('click', addToCart));
}

async function openModalWithPlant(e) {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    showSpinner();
    try {
        const res = await fetch(`${API_BASE}/plant/${id}`);
        const json = await res.json();
        let detail = json.data || {};
        document.getElementById('modalTitle').textContent = detail.name || 'Plant Detail';
        document.getElementById('modalImage').src = detail.image || 'https://via.placeholder.com/600x400?text=Plant';
        document.getElementById('modalDesc').textContent = detail.description || 'No extended information available.';
        document.getElementById('modalCat').textContent = detail.category || 'Tree';
        const price = detail.price || Math.floor(Math.random() * 500) + 100;
        document.getElementById('modalPrice').textContent = `$${price}`;
        const myModal = new bootstrap.Modal(document.getElementById('plantModal'));
        myModal.show();
    } catch (err) { console.error(err); }
    hideSpinner();
}

function addToCart(e) {
    const btn = e.currentTarget;
    const id = btn.dataset.id; const name = btn.dataset.name; const price = Number(btn.dataset.price || 0);
    cart.push({ id, name, price });
    renderCart();
}
function removeFromCart(index) { cart.splice(index, 1); renderCart(); }
function renderCart() {
    cartList.innerHTML = '';
    cart.forEach((c, i) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `${c.name} <span>$${c.price.toFixed(2)}</span> <button class="btn btn-sm btn-outline-danger ms-2">&times;</button>`;
        li.querySelector('button').addEventListener('click', () => removeFromCart(i));
        cartList.appendChild(li);
    });
    const total = cart.reduce((s, it) => s + it.price, 0);
    totalPriceEl.textContent = `$${total.toFixed(2)}`;
}

loadCategories();
loadAllPlants();
