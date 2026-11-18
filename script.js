const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const formatRupiah = (value) => 'Rp ' + new Intl.NumberFormat('id-ID').format(value);

/* ===== PARTICLE BACKGROUND ===== */
(function initParticles() {
  const canvas = $('#particles');
  const ctx = canvas.getContext('2d');
  let width, height, particles = [];
  const colors = ['#05d9e8', '#b026ff', '#ff2a6d'];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const amount = Math.min(70, Math.floor((width * height) / 22000));
    particles = Array.from({ length: amount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(120,90,200,${(1 - dist / 120) * 0.18})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  if (!reduceMotion) draw();
})();

/* ===== CURSOR GLOW ===== */
if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
  const glow = $('#cursorGlow');
  let tx = -500, ty = -500, cx = -500, cy = -500;
  window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
  (function follow() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    glow.style.left = cx + 'px';
    glow.style.top = cy + 'px';
    requestAnimationFrame(follow);
  })();
}

/* ===== HEADER / NAV / SCROLL ===== */
const header = $('#header');
const nav = $('#nav');
const menuBtn = $('#menuBtn');
const toTop = $('#toTop');

function onScroll() {
  const y = window.scrollY;
  document.body.classList.toggle('scrolled', y > 40);
  toTop.classList.toggle('show', y > 500);

  let current = 'home';
  $$('section[id]').forEach((section) => {
    if (y >= section.offsetTop - 140) current = section.id;
  });
  $$('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
$$('.nav-link').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach((el) => revealObserver.observe(el));

$$('.photo-slot').forEach((img) => {
  const activate = () => {
    img.classList.remove('failed');
    img.parentElement.classList.add('has-photo');
  };
  const deactivate = () => {
    img.classList.add('failed');
    img.parentElement.classList.remove('has-photo');
  };
  img.addEventListener('load', activate);
  img.addEventListener('error', deactivate);
  if (img.complete) {
    if (img.naturalWidth > 0) activate(); else deactivate();
  }
});

/* ===== COUNTERS ===== */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased).toLocaleString('id-ID') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
$$('[data-count]').forEach((el) => counterObserver.observe(el));

/* ===== TYPING EFFECT ===== */
(function typeEffect() {
  const el = $('#typed');
  const texts = [
    'Memuat spesifikasi terbaik...',
    'Stok ready di Pekanbaru.',
    'Garansi resmi, harga bersahabat.'
  ];
  let textIndex = 0, charIndex = 0, deleting = false;
  function step() {
    const text = texts[textIndex];
    charIndex += deleting ? -1 : 1;
    el.textContent = text.slice(0, charIndex);
    let delay = deleting ? 45 : 85;
    if (!deleting && charIndex === text.length) { deleting = true; delay = 1700; }
    else if (deleting && charIndex === 0) { deleting = false; textIndex = (textIndex + 1) % texts.length; delay = 400; }
    setTimeout(step, delay);
  }
  if (!reduceMotion) step(); else el.textContent = texts[0];
})();

/* ===== PRODUCT FILTER ===== */
$$('.filter').forEach((btn) => btn.addEventListener('click', () => {
  $$('.filter').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.filter;
  $$('.product-card').forEach((card) => {
    const match = filter === 'all' || card.dataset.category.split(' ').includes(filter);
    card.classList.toggle('hidden', !match);
  });
}));

/* ===== CART ===== */
const cart = [];
const cartItemsEl = $('#cartItems');
const cartCountEl = $('#cartCount');
const cartTotalEl = $('#cartTotal');
const cartDrawer = $('#cartDrawer');
const overlay = $('#overlay');

function renderCart() {
  cartItemsEl.innerHTML = '';
  if (!cart.length) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Keranjang masih kosong.<br><small>Yuk pilih monitormu!</small></p>';
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'cart-item';

      const info = document.createElement('div');
      info.className = 'cart-item-info';
      const name = document.createElement('strong');
      name.textContent = item.name;
      const price = document.createElement('small');
      price.textContent = formatRupiah(item.price) + ' / pcs';
      const qty = document.createElement('div');
      qty.className = 'cart-qty';
      const minus = document.createElement('button');
      minus.textContent = '−';
      minus.setAttribute('aria-label', 'Kurangi jumlah');
      minus.addEventListener('click', () => changeQty(index, -1));
      const count = document.createElement('span');
      count.textContent = item.qty;
      const plus = document.createElement('button');
      plus.textContent = '+';
      plus.setAttribute('aria-label', 'Tambah jumlah');
      plus.addEventListener('click', () => changeQty(index, 1));
      qty.append(minus, count, plus);
      info.append(name, price, qty);

      const remove = document.createElement('button');
      remove.className = 'cart-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Hapus dari keranjang');
      remove.addEventListener('click', () => {
        cart.splice(index, 1);
        renderCart();
      });

      row.append(info, remove);
      cartItemsEl.appendChild(row);
    });
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = count;
  cartTotalEl.textContent = formatRupiah(total);
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty < 1) cart.splice(index, 1);
  renderCart();
}

function openCart() {
  cartDrawer.classList.add('open');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartDrawer.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

$('#cartBtn').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCart();
    nav.classList.remove('open');
  }
});

$$('.btn-add').forEach((btn) => btn.addEventListener('click', () => {
  const card = btn.closest('.product-card');
  const name = card.dataset.name;
  const price = Number(card.dataset.price);
  const existing = cart.find((item) => item.name === name);
  if (existing) existing.qty += 1;
  else cart.push({ name, price, qty: 1 });
  renderCart();
  showToast(name + ' ditambahkan!');
}));

$('#checkoutBtn').addEventListener('click', () => {
  if (!cart.length) { showToast('Keranjang masih kosong!'); return; }
  const lines = cart.map((item) => `• ${item.name} x${item.qty} — ${formatRupiah(item.price * item.qty)}`);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const message = [
    'Halo NEONPIXEL, saya mau pesan:',
    '',
    ...lines,
    '',
    'TOTAL: ' + formatRupiah(total),
    '',
    'Mohon info stok & cara pembayarannya. Thanks!'
  ].join('\n');
  window.open('https://wa.me/6281234567890?text=' + encodeURIComponent(message), '_blank', 'noopener');
});

/* ===== TOAST ===== */
let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = '✔ ' + message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ===== FAQ ACCORDION ===== */
$$('.acc-head').forEach((head) => head.addEventListener('click', () => {
  const item = head.closest('.acc-item');
  const isOpen = item.classList.contains('open');
  $$('.acc-item').forEach((other) => other.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}));


