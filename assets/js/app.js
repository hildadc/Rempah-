// Rempahé Frontend
const currency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// Demo product data (<=5 items)
const products = [
  {id:'kunyit-asam', name:'Kunyit Asam', price:15000, img:'assets/img/svg/jamu-kunyit.svg'},
  {id:'beras-kencur', name:'Beras Kencur', price:16000, img:'assets/img/svg/jamu-kencur.svg'},
  {id:'temulawak', name:'Temulawak', price:17000, img:'assets/img/svg/jamu-temulawak.svg'},
  {id:'madu-jahe', name:'Madu Jahe', price:18000, img:'assets/img/svg/jamu-madu-jahe.svg'},
  {id:'daun-sirih-tea', name:'Daun Sirih Tea', price:14000, img:'assets/img/svg/jamu-daun-sirih.svg'}
].slice(0,5);

// DOM refs
const track = document.getElementById('sliderTrack');
const prev = document.getElementById('prevSlide');
const next = document.getElementById('nextSlide');
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Render slider cards
function renderProducts(){
  track.innerHTML = products.map(p => `
    <article class="card product-card" data-id="${p.id}">
      <div class="thumb">
        <img src="${p.img}" alt="${p.name}">
      </div>
      <h3>${p.name}</h3>
      <div class="price">${currency(p.price)}</div>
      <div class="actions-row">
        <button class="btn add" data-action="add">Tambah ke Keranjang</button>
        <button class="btn buy" data-action="buy">Beli</button>
      </div>
    </article>
  `).join('');
}
renderProducts();

// Simple slider controls
prev.addEventListener('click', () => track.scrollBy({left:-track.clientWidth, behavior:'smooth'}));
next.addEventListener('click', () => track.scrollBy({left: track.clientWidth, behavior:'smooth'}));

// Cart state
let cart = JSON.parse(localStorage.getItem('rempahe_cart')||'{}');

function saveCart(){ localStorage.setItem('rempahe_cart', JSON.stringify(cart)); }

function updateCartBadge(){
  const count = Object.values(cart).reduce((a,c)=>a+c.qty,0);
  cartCountEl.textContent = count;
}

function renderCart(){
  const items = Object.values(cart);
  cartItemsEl.innerHTML = items.length ? items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.img}" alt="${item.name}" />
      <div>
        <div><strong>${item.name}</strong></div>
        <div class="small muted">${currency(item.price)} x <span class="qty-num">${item.qty}</span></div>
        <div class="qty">
          <button data-action="dec">-</button>
          <button data-action="inc">+</button>
          <button data-action="remove">Hapus</button>
        </div>
      </div>
      <div><strong>${currency(item.price*item.qty)}</strong></div>
    </div>
  `).join('') : '<p class="muted">Keranjang kosong.</p>';
  const total = items.reduce((a,it)=>a+it.price*it.qty,0);
  cartTotalEl.textContent = currency(total);
  updateCartBadge();
}
renderCart();

function addToCart(prod, qty=1){
  if(!cart[prod.id]) cart[prod.id] = {...prod, qty:0};
  cart[prod.id].qty += qty;
  saveCart(); renderCart();
}

// Delegation: product card buttons
track.addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if(!btn) return;
  const card = e.target.closest('.product-card'); const id = card.dataset.id;
  const prod = products.find(p=>p.id===id);
  if(btn.dataset.action==='add'){ addToCart(prod,1); }
  if(btn.dataset.action==='buy'){ addToCart(prod,1); openCart(); }
});

// Cart controls
cartItemsEl.addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if(!btn) return;
  const row = e.target.closest('.cart-item'); const id = row.dataset.id;
  if(btn.dataset.action==='inc'){ cart[id].qty++; }
  if(btn.dataset.action==='dec'){ cart[id].qty = Math.max(1, cart[id].qty-1); }
  if(btn.dataset.action==='remove'){ delete cart[id]; }
  saveCart(); renderCart();
});

function openCart(){ cartDrawer.classList.add('open'); overlay.hidden = false; cartDrawer.setAttribute('aria-hidden','false'); }
function closeCart(){ cartDrawer.classList.remove('open'); overlay.hidden = true; cartDrawer.setAttribute('aria-hidden','true'); }
openCartBtn.addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

// Checkout
checkoutBtn.addEventListener('click', ()=>{
  const items = Object.values(cart);
  if(!items.length) return alert('Keranjang masih kosong 🙂');
  const total = items.reduce((a,it)=>a+it.price*it.qty,0);
  alert('Checkout berhasil (simulasi)!\nTotal: '+currency(total)+'\nTerima kasih sudah belanja di Rempahé.');
  cart = {}; saveCart(); renderCart(); closeCart();
});

// Testimonials form (store to localStorage & render)
const testiList = document.getElementById('testimonialList');
const testiForm = document.getElementById('testimonialForm');
const savedTesti = JSON.parse(localStorage.getItem('rempahe_testi')||'[]');
savedTesti.forEach(t=>appendTesti(t.name,t.message));

function appendTesti(name, message){
  const el = document.createElement('article');
  el.className = 'testi-card';
  el.innerHTML = `
    <img src="assets/img/svg/avatar-3.svg" alt="Avatar pelanggan" class="avatar">
    <div><h3>${name}</h3><p>${message}</p></div>`;
  testiList.appendChild(el);
}

testiForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('tName').value.trim();
  const message = document.getElementById('tMessage').value.trim();
  if(!name || !message) return;
  const arr = JSON.parse(localStorage.getItem('rempahe_testi')||'[]');
  arr.push({name,message, at: Date.now()});
  localStorage.setItem('rempahe_testi', JSON.stringify(arr));
  appendTesti(name,message);
  testiForm.reset();
});

// Feedback form (kritik & saran)
const fbForm = document.getElementById('feedbackForm');
const fbNote = document.getElementById('feedbackNote');
fbForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const payload = {
    name: document.getElementById('fName').value.trim(),
    email: document.getElementById('fEmail').value.trim(),
    message: document.getElementById('fMessage').value.trim(),
    at: Date.now()
  };
  // Simpan lokal agar statis-friendly
  const arr = JSON.parse(localStorage.getItem('rempahe_feedback')||'[]');
  arr.push(payload);
  localStorage.setItem('rempahe_feedback', JSON.stringify(arr));
  fbForm.reset(); fbNote.hidden = false; setTimeout(()=>fbNote.hidden=true, 3500);
});
