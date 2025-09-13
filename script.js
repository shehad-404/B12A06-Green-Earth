// script.js - Vanilla JS application logic

const API_BASE = "https://openapi.programming-hero.com/api";
const categoriesEl = document.getElementById('categories');
const cardsRow = document.getElementById('cardsRow');
const spinner = document.getElementById('spinner');
const cartListEl = document.getElementById('cartList');
const cartTotalEl = document.getElementById('cartTotal');
const modal = new bootstrap.Modal(document.getElementById('plantModal'), {});
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

let cart = [];
let currentActiveCategoryId = null;

// show/hide spinner
function showSpinner(show = true){
  spinner.style.display = show ? 'flex' : 'none';
}

// format price
function formatPrice(p){
  const n = Number(p) || 0;
  return `৳${n}`;
}

// derive price if missing
function derivePriceFromId(id){
  const n = Number(String(id).replace(/\D/g,'').slice(-3)) || Math.floor(Math.random()*900)+100;
  return (n % 900) + 100;
}

// fetch and render categories
async function loadCategories(){
  showSpinner(true);
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    const cats = data.data || [];

    // Clear previous categories
    categoriesEl.innerHTML = '';

    // "All Trees" button
    const allBtn = document.createElement('button');
    allBtn.className = 'list-group-item list-group-item-action active-cat';
    allBtn.textContent = 'All Trees';
    allBtn.dataset.id = 'all';
    allBtn.addEventListener('click', ()=> onCategoryClick('all', allBtn));
    categoriesEl.appendChild(allBtn);

    // Optional header for other categories
    const catHeader = document.createElement('div');
    catHeader.className = 'mt-2 mb-1 text-muted small';
    catHeader.textContent = 'Other Categories';
    categoriesEl.appendChild(catHeader);

    // render other categories
    cats.forEach(c=>{
      const btn = document.createElement('button');
      btn.className = 'list-group-item list-group-item-action';
      btn.textContent = c.name || c.category_name || `Category ${c.id}`;
      btn.dataset.id = c.id;
      btn.addEventListener('click', ()=> onCategoryClick(c.id, btn));
      categoriesEl.appendChild(btn);
    });

    // initially load all plants
    await loadAllPlants();
  } catch(e){
    console.error(e);
    cardsRow.innerHTML = '<div class="text-danger">Failed to load categories.</div>';
  } finally {
    showSpinner(false);
  }
}

// fetch all plants
async function loadAllPlants(){
  showSpinner(true);
  try {
    const res = await fetch(`${API_BASE}/plants`);
    const data = await res.json();
    const plants = data.plants || [];
    renderCards(plants.slice(0, 30)); // limit 30 for demo
  } catch(e){
    console.error(e);
    cardsRow.innerHTML = '<div class="text-danger">Failed to load plants.</div>';
  } finally {
    showSpinner(false);
  }
}

// fetch plants by category
async function loadPlantsByCategory(id){
  showSpinner(true);
  try {
    const res = await fetch(`${API_BASE}/category/${id}`);
    const data = await res.json();
    const plants = data.data || [];
    renderCards(plants);
  } catch(e){
    console.error(e);
    cardsRow.innerHTML = '<div class="text-danger">Failed to load category plants.</div>';
  } finally {
    showSpinner(false);
  }
}

// render plant cards
function renderCards(plants){
  cardsRow.innerHTML = '';
  if(!plants || plants.length === 0){
    cardsRow.innerHTML = '<div class="col-12">No plants found.</div>';
    return;
  }

  plants.forEach(p=>{
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-lg-4';

    const card = document.createElement('div');
    card.className = 'card-plant';

    const img = document.createElement('img');
    img.src = p.image || 'https://via.placeholder.com/400x250?text=No+Image';
    img.alt = p.name || 'Plant';
    img.onerror = ()=>{ img.src = 'https://via.placeholder.com/400x250?text=No+Image'; };

    const title = document.createElement('h6');
    title.className = 'mt-2';
    title.style.cursor = 'pointer';
    title.textContent = p.name || 'Unknown Plant';
    title.addEventListener('click', ()=> openPlantModal(p.id));

    const desc = document.createElement('p');
    desc.className = 'small text-muted';
    const text = p.description || '';
    desc.textContent = text.length > 120 ? text.slice(0,120)+'...' : text;

    const metaRow = document.createElement('div');
    metaRow.className = 'd-flex justify-content-between align-items-center';

    const badge = document.createElement('span');
    badge.className = 'badge-category';
    badge.textContent = p.category || 'Fruit Tree';

    const priceDiv = document.createElement('div');
    const derivedPrice = p.price || derivePriceFromId(p.id);
    priceDiv.innerHTML = `<strong>${formatPrice(derivedPrice)}</strong>`;

    metaRow.appendChild(badge);
    metaRow.appendChild(priceDiv);

    const btnRow = document.createElement('div');
    btnRow.className = 'mt-3 d-grid';
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-add';
    addBtn.textContent = 'Add to Cart';
    addBtn.addEventListener('click', ()=> addToCart({
      id: p.id,
      name: p.name || 'Unknown Plant',
      price: Number(derivedPrice) || 0
    }));
    btnRow.appendChild(addBtn);

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(metaRow);
    card.appendChild(btnRow);

    col.appendChild(card);
    cardsRow.appendChild(col);
  });
}

// open modal with plant details
async function openPlantModal(id){
  modalTitle.textContent = 'Loading...';
  modalBody.innerHTML = `<div class="text-center w-100 py-4"><div class="spinner-border" role="status"></div></div>`;
  modal.show();

  try {
    const res = await fetch(`${API_BASE}/plant/${id}`);
    const data = await res.json();
    const p = data.data;

    modalTitle.textContent = p.name || 'Plant Details';

    const leftCol = document.createElement('div');
    leftCol.className = 'col-md-6';
    const img = document.createElement('img');
    img.src = p.image || 'https://via.placeholder.com/600x400?text=No+Image';
    img.className = 'img-fluid rounded';
    leftCol.appendChild(img);

    const rightCol = document.createElement('div');
    rightCol.className = 'col-md-6';
    rightCol.innerHTML = `
      <p><strong>Scientific Name:</strong> ${p.scientific_name || 'N/A'}</p>
      <p><strong>Family:</strong> ${p.family_common_name || p.family || 'N/A'}</p>
      <p>${p.description || 'No detailed description available.'}</p>
    `;

    modalBody.innerHTML = '';
    modalBody.appendChild(leftCol);
    modalBody.appendChild(rightCol);
  } catch(e){
    console.error(e);
    modalBody.innerHTML = '<div class="text-danger">Failed to load details.</div>';
  }
}

// cart functions
function addToCart(item){
  cart.push(item);
  renderCart();
}

function removeFromCart(idx){
  cart.splice(idx,1);
  renderCart();
}

function renderCart(){
  cartListEl.innerHTML = '';
  let total = 0;
  if(cart.length === 0){
    cartListEl.innerHTML = '<li class="text-muted">Cart is empty</li>';
  } else {
    cart.forEach((it, i)=>{
      total += Number(it.price) || 0;
      const li = document.createElement('li');
      li.className = 'd-flex justify-content-between align-items-center';
      li.innerHTML = `<span>${it.name}</span>
                      <div>
                        <small class="me-2">${formatPrice(it.price)}</small>
                        <button class="btn btn-sm btn-outline-danger remove-btn" data-idx="${i}">✕</button>
                      </div>`;
      cartListEl.appendChild(li);
    });
  }
  cartTotalEl.textContent = formatPrice(total);

  cartListEl.querySelectorAll('.remove-btn').forEach(btn=>{
    btn.onclick = ()=>{
      removeFromCart(Number(btn.dataset.idx));
    };
  });
}

// handle category click
function onCategoryClick(id, btnEl){
  categoriesEl.querySelectorAll('.list-group-item').forEach(b=> b.classList.remove('active-cat'));
  btnEl.classList.add('active-cat');

  if(id === 'all'){
    loadAllPlants();
  } else {
    loadPlantsByCategory(id);
  }
}

// initial load
(function init(){
  document.getElementById('year').textContent = new Date().getFullYear();
  loadCategories();

  // donation form demo
  document.getElementById('donateForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('Thanks for your donation! (Demo)');
    e.target.reset();
  });
})();
