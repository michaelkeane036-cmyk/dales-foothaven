/* =========================================
   SLYMFIT — Walk Your Culture
   script.js
   ========================================= */

/* ---- CART STATE ---- */

let cart = JSON.parse(localStorage.getItem('slymfit_cart') || '[]');

function saveCart()       { localStorage.setItem('slymfit_cart', JSON.stringify(cart)); }
function formatPrice(p)   { return '$' + p.toFixed(2); }
function getCartTotal()   { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function getCartCount()   { return cart.reduce((s, i) => s + i.qty, 0); }

let quickViewProduct = null;

function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}


/* ---- CART ACTIONS ---- */

function getProductData(card) {
  if (!card) return null;
  const badge = card.querySelector('.product-badge');
  return {
    id: card.dataset.id,
    name: card.querySelector('.product-card-name')?.textContent.trim() || '',
    desc: card.querySelector('.product-card-desc')?.textContent.trim() || '',
    price: parseFloat(card.dataset.price) || 0,
    currentPrice: card.querySelector('.price-current')?.textContent.trim() || '',
    originalPrice: card.querySelector('.price-original')?.textContent.trim() || '',
    img: card.querySelector('.product-card-image img')?.src || '',
    badgeText: badge?.textContent.trim() || '',
    badgeClass: badge?.className || 'product-badge'
  };
}

function addProductToCart(product) {
  if (!product) return;
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      qty: 1
    });
  }

  saveCart();
  updateCartCount();
  renderCartItems();
  showToast(product.name + ' added to cart');
}

/* Called from each product card's add-to-cart button: onclick="addToCart(this)" */
function addToCart(btn) {
  addProductToCart(getProductData(btn.closest('.product-card')));
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartCount();
  renderCartItems();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); updateCartCount(); renderCartItems(); }
}

function renderCartItems() {
  const el       = document.getElementById('cartItems');
  const subtotal = document.getElementById('cartSubtotal');
  if (!el) return;

  if (cart.length === 0) {
    el.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>Your cart is empty</p>
      </div>`;
  } else {
    el.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">Qty: ${item.qty}</div>
          <div class="cart-item-actions">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}', +1)">+</button>
          </div>
        </div>
        <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
      </div>`).join('');
  }

  if (subtotal) subtotal.textContent = formatPrice(getCartTotal());
}


/* ---- QUICK VIEW ---- */

/* Called from each product card's quick-view button: onclick="openQuickView(this)" */
function openQuickView(btn) {
  quickViewProduct = getProductData(btn.closest('.product-card'));
  if (!quickViewProduct) return;

  const modal = document.getElementById('quickViewModal');
  const overlay = document.getElementById('quickViewOverlay');
  const image = document.getElementById('quickViewImage');
  const badge = document.getElementById('quickViewBadge');
  const original = document.getElementById('quickViewOriginal');

  if (image) {
    image.src = quickViewProduct.img;
    image.alt = quickViewProduct.name;
  }
  if (badge) {
    badge.textContent = quickViewProduct.badgeText || 'DROP';
    badge.className = quickViewProduct.badgeClass || 'product-badge';
  }
  document.getElementById('quickViewName').textContent = quickViewProduct.name;
  document.getElementById('quickViewDesc').textContent = quickViewProduct.desc;
  document.getElementById('quickViewPrice').textContent = quickViewProduct.currentPrice || formatPrice(quickViewProduct.price);
  if (original) {
    original.textContent = quickViewProduct.originalPrice;
    original.style.display = quickViewProduct.originalPrice ? 'inline' : 'none';
  }

  document.querySelectorAll('.quick-view-size').forEach((size, i) => {
    size.classList.toggle('active', i === 0);
  });

  modal?.classList.add('open');
  overlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  document.getElementById('quickViewModal')?.classList.remove('open');
  document.getElementById('quickViewOverlay')?.classList.remove('open');
  quickViewProduct = null;
  if (!document.getElementById('cartSidebar')?.classList.contains('open') &&
      !document.getElementById('mobileMenu')?.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

function addQuickViewToCart() {
  addProductToCart(quickViewProduct);
  closeQuickView();
  openCart();
}


/* ---- SECURITY CHECK / CHECKOUT ---- */

function openSecurityCheck() {
  if (cart.length === 0) {
    showToast('Add something to your cart before checkout.');
    return;
  }

  document.getElementById('securityCheckError').textContent = '';
  document.getElementById('securityCheckOverlay')?.classList.add('open');
  document.getElementById('securityCheckModal')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSecurityCheck() {
  document.getElementById('securityCheckOverlay')?.classList.remove('open');
  document.getElementById('securityCheckModal')?.classList.remove('open');
  if (window.turnstile) window.turnstile.reset();
  if (!document.getElementById('cartSidebar')?.classList.contains('open') &&
      !document.getElementById('mobileMenu')?.classList.contains('open') &&
      !document.getElementById('quickViewModal')?.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

async function verifySecurityCheck() {
  const error = document.getElementById('securityCheckError');
  const button = document.getElementById('securityCheckVerify');
  const token = window.turnstile?.getResponse();

  if (!token) {
    if (error) error.textContent = 'Complete the security check first.';
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = 'OPENING CHECKOUT...';
  }
  if (error) error.textContent = '';

  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turnstileToken: token,
        items: cart.map(item => ({ id: item.id, qty: item.qty }))
      })
    });
    const data = await res.json();

    if (!res.ok || !data.url) {
      throw new Error(data.error || 'Checkout could not be started.');
    }

    window.location.href = data.url;
  } catch (err) {
    if (error) error.textContent = err.message;
    if (window.turnstile) window.turnstile.reset();
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'CONTINUE TO PAYMENT';
    }
  }
}


/* ---- CART SIDEBAR ---- */

function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}


/* ---- MOBILE MENU ---- */

function openMobileMenu() {
  document.getElementById('mobileMenu')?.classList.add('open');
  document.getElementById('mobileMenuOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  document.getElementById('mobileMenu')?.classList.remove('open');
  document.getElementById('mobileMenuOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}


/* ---- HERO CAROUSEL ---- */

let currentSlide   = 0;
let slideInterval;

function initHeroCarousel() {
  const slides    = Array.from(document.querySelectorAll('.hero-slide'));
  const container = document.getElementById('heroIndicators');
  if (!slides.length || !container) return;

  // Build indicator buttons from each slide's data attributes
  container.innerHTML = slides.map((slide, i) => `
    <button class="hero-indicator ${i === 0 ? 'active' : ''}" data-index="${i}">
      <span class="hero-indicator-num">${slide.dataset.num  || String(i + 1).padStart(2, '0')}</span>
      <span class="hero-indicator-label">${slide.dataset.label || ''}</span>
    </button>`).join('');

  function goToSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.hero-indicator').forEach(b => b.classList.remove('active'));
    currentSlide = ((index % slides.length) + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    document.querySelectorAll('.hero-indicator')[currentSlide]?.classList.add('active');
  }

  function startAutoPlay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5500);
  }

  container.addEventListener('click', e => {
    const btn = e.target.closest('.hero-indicator');
    if (!btn) return;
    goToSlide(parseInt(btn.dataset.index, 10));
    startAutoPlay();
  });

  // Touch swipe support
  let touchStartX = 0;
  const wrapper = document.getElementById('heroWrapper');
  wrapper?.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  wrapper?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(currentSlide + (diff > 0 ? 1 : -1));
      startAutoPlay();
    }
  });

  startAutoPlay();
}


/* ---- SCROLL BEHAVIOURS ---- */

function initScrollBehaviours() {
  const header      = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 10);
    scrollTopBtn?.classList.toggle('visible', y > 400);
  }, { passive: true });

  scrollTopBtn?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
}


/* ---- NEWSLETTER ---- */

function initNewsletter() {
  document.getElementById('newsletterForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    if (input?.value) {
      showToast("You're on the list! Welcome to SLYMFIT.");
      input.value = '';
    }
  });
}


/* ---- TOAST NOTIFICATION ---- */

function showToast(message) {
  let toast = document.getElementById('sf-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sf-toast';
    toast.style.cssText = [
      'position:fixed', 'bottom:90px', 'right:28px', 'z-index:500',
      'background:#0a0a0a', 'color:#fff', 'padding:14px 22px',
      'border-radius:100px', 'font-family:Inter,sans-serif',
      'font-size:13px', 'font-weight:600', 'letter-spacing:0.03em',
      'box-shadow:0 8px 28px rgba(0,0,0,0.25)',
      'transform:translateY(20px)', 'opacity:0', 'pointer-events:none',
      'transition:all 0.35s cubic-bezier(0.4,0,0.2,1)'
    ].join(';');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity   = '1';
  });

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity   = '0';
  }, 3000);
}


/* ---- INIT ---- */

document.addEventListener('DOMContentLoaded', () => {
  initHeroCarousel();
  initScrollBehaviours();
  initNewsletter();
  updateCartCount();
  renderCartItems();

  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('checkoutBtn')?.addEventListener('click', openSecurityCheck);

  document.getElementById('securityCheckOverlay')?.addEventListener('click', closeSecurityCheck);
  document.getElementById('securityCheckClose')?.addEventListener('click', closeSecurityCheck);
  document.getElementById('securityCheckVerify')?.addEventListener('click', verifySecurityCheck);

  document.getElementById('quickViewOverlay')?.addEventListener('click', closeQuickView);
  document.getElementById('quickViewClose')?.addEventListener('click', closeQuickView);
  document.getElementById('quickViewCartBtn')?.addEventListener('click', addQuickViewToCart);
  document.querySelectorAll('.quick-view-size').forEach(size => {
    size.addEventListener('click', () => {
      document.querySelectorAll('.quick-view-size').forEach(s => s.classList.remove('active'));
      size.classList.add('active');
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeQuickView();
      closeSecurityCheck();
    }
  });

  document.getElementById('menuToggle')?.addEventListener('click', openMobileMenu);
  document.getElementById('mobileMenuOverlay')?.addEventListener('click', closeMobileMenu);
  document.getElementById('mobileMenuClose')?.addEventListener('click', closeMobileMenu);
});
