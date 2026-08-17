/* =========================================
   Dale's Foothaven - Crafted for Comfort
   script.js
   ========================================= */

const ADULT_PRICE = 25000;
const COUPLE_PRICE = 50000;
const BABY_PRICE = 15000;
const CART_STORAGE_KEY = 'dales_foothaven_cart_ngn_v1';
const WHATSAPP_ORDER_NUMBER = '2349028525881';
const AUDIENCE = {
  men: ['men'],
  women: ['women'],
  unisex: ['unisex'],
  baby: ['baby']
};

const NAMED_PRODUCTS = [
  ['p1', "Awwal's Slide", '01-awwals-slide.jpg', ADULT_PRICE, 'Custom', '', 'A custom leather slide built for clean daily comfort and personal style.', AUDIENCE.men],
  ['p2', 'Baby Sandal', '02-baby-sandal.jpg', BABY_PRICE, 'Baby', 'sale', 'A soft baby sandal made for tiny feet, warm days, and easy movement.', AUDIENCE.baby],
  ['p3', "Blessing's Slide", '03-blessings-slide.jpg', ADULT_PRICE, 'Custom', '', 'A handmade slide with a neat finish for relaxed everyday wear.', AUDIENCE.women],
  ['p4', "Couple's Pair", '04-couples-pair.jpg', COUPLE_PRICE, 'Pair', 'hot', 'A matching pair for couples who want coordinated comfort with a personal touch.', AUDIENCE.unisex],
  ['p5', "Dale's Slide", '05-dales-slide.jpg', ADULT_PRICE, 'Signature', 'hot', "A signature Dale's Foothaven slide with a sturdy sole and polished handmade feel.", AUDIENCE.men],
  ['p6', "Ife's Slide", '06-ifes-slide.jpg', ADULT_PRICE, 'Custom', '', 'A clean custom slide designed for simple styling and everyday ease.', AUDIENCE.women],
  ['p7', "Tobi's Slide", '07-tobis-slide.jpg', ADULT_PRICE, 'Custom', '', 'A made-to-order slide with soft comfort and a confident casual look.', AUDIENCE.men]
];

const CUSTOM_FILES = [
  ['08-custom-slide-08.jpg', AUDIENCE.men],
  ['09-custom-slide-09.jpg', AUDIENCE.men],
  ['10-img3907.jpg', AUDIENCE.women],
  ['11-img4253.jpg', AUDIENCE.unisex],
  ['12-img4263.jpg', AUDIENCE.unisex],
  ['13-img4278.jpg', AUDIENCE.men],
  ['14-img4294.jpg', AUDIENCE.men],
  ['15-img4348.jpg', AUDIENCE.unisex],
  ['16-img5099.jpg', AUDIENCE.unisex],
  ['17-img5111.jpg', AUDIENCE.women],
  ['18-img5208.jpg', AUDIENCE.women],
  ['19-img5240.jpg', AUDIENCE.unisex],
  ['20-img5244.jpg', AUDIENCE.men],
  ['21-img5569.jpg', AUDIENCE.women],
  ['22-img5576.jpg', AUDIENCE.women],
  ['23-img6094.jpg', AUDIENCE.men],
  ['24-img6098.jpg', AUDIENCE.women],
  ['25-img6103.jpg', AUDIENCE.women],
  ['26-img6261.jpg', AUDIENCE.men],
  ['27-img6268.jpg', AUDIENCE.men]
];

const PRODUCTS = [
  ...NAMED_PRODUCTS.map(toProduct),
  ...CUSTOM_FILES.map(([file, categories], index) => ({
    id: `p${index + 8}`,
    name: `Foothaven Custom Slide ${String(index + 1).padStart(2, '0')}`,
    image: `assets/dales/products/${file}`,
    price: ADULT_PRICE,
    badge: 'Custom',
    badgeClass: '',
    desc: 'A handcrafted adult slide ready for personalized daily wear.',
    categories
  }))
];

const FEATURED_IDS = ['p4', 'p5', 'p2'];
let activeCatalogFilter = 'all';
let catalogSearchQuery = '';
let cart = readCart();
let quickViewProduct = null;
let currentSlide = 0;
let slideInterval;

function toProduct(row) {
  return {
    id: row[0],
    name: row[1],
    image: `assets/dales/products/${row[2]}`,
    price: row[3],
    badge: row[4],
    badgeClass: row[5],
    desc: row[6],
    categories: row[7]
  };
}

function getProduct(id) {
  return PRODUCTS.find(product => product.id === id);
}

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(item => ({ id: String(item.id || ''), qty: Math.max(1, parseInt(item.qty, 10) || 1) }))
      .filter(item => item.id && getProduct(item.id));
  } catch (_error) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getCartLines() {
  return cart
    .map(item => ({ product: getProduct(item.id), qty: item.qty }))
    .filter(line => line.product);
}

function getCartTotal() {
  return getCartLines().reduce((sum, line) => sum + line.product.price * line.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderProductCard(product) {
  const badgeClass = ['product-badge', product.badgeClass].filter(Boolean).join(' ');
  const categoryLabel = product.categories.map(formatCategoryName).join(', ');

  return `
    <div class="product-card" data-id="${product.id}" data-categories="${product.categories.join(' ')}">
      <div class="product-card-image">
        <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" />
        <span class="${badgeClass}">${escapeHtml(product.badge)}</span>
        <div class="product-card-overlay">
          <button class="quick-view-btn" data-action="quick-view" type="button">Quick View</button>
        </div>
      </div>
      <div class="product-card-info">
        <h3 class="product-card-name">${escapeHtml(product.name.toUpperCase())}</h3>
        <p class="product-card-desc">${escapeHtml(product.desc)}</p>
        <p class="product-card-category">${escapeHtml(categoryLabel)}</p>
        <div class="product-card-footer">
          <div class="product-price"><span class="price-current">${formatPrice(product.price)}</span></div>
          <button class="add-to-cart-btn" data-action="add-to-cart" type="button" title="Add to cart">
            <svg viewBox="0 0 24 24" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>`;
}

function formatCategoryName(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function matchesActiveCategory(product) {
  return activeCatalogFilter === 'all' || product.categories.includes(activeCatalogFilter);
}

function matchesCatalogSearch(product) {
  const query = catalogSearchQuery.trim().toLowerCase();
  if (!query) return true;

  if (['men', 'women', 'unisex', 'baby'].includes(query)) {
    return product.categories.includes(query);
  }

  const haystack = [
    product.name,
    product.desc,
    product.badge,
    product.categories.map(formatCategoryName).join(' '),
    formatPrice(product.price)
  ].join(' ').toLowerCase();

  return haystack.includes(query);
}

function getFilteredProducts() {
  return PRODUCTS.filter(product => matchesActiveCategory(product) && matchesCatalogSearch(product));
}

function updateCatalogControls(resultCount) {
  const count = document.getElementById('catalogResultCount');
  const empty = document.getElementById('catalogEmpty');
  const search = document.getElementById('catalogSearch');

  document.querySelectorAll('.catalog-chip').forEach(chip => {
    const isActive = chip.dataset.filter === activeCatalogFilter;
    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-pressed', String(isActive));
  });

  document.querySelectorAll('[data-category-trigger]').forEach(card => {
    card.classList.toggle('active', card.dataset.categoryTrigger === activeCatalogFilter);
  });

  if (search && search.value !== catalogSearchQuery) {
    search.value = catalogSearchQuery;
  }

  if (count) {
    const filterLabel = activeCatalogFilter === 'all' ? 'All' : formatCategoryName(activeCatalogFilter);
    count.textContent = `${filterLabel}: ${resultCount} of ${PRODUCTS.length} pairs`;
  }

  if (empty) {
    empty.hidden = resultCount !== 0;
  }
}

function renderProducts() {
  const featured = document.getElementById('featuredProducts');
  const catalog = document.getElementById('catalogProducts');
  const filteredProducts = getFilteredProducts();

  if (featured) {
    featured.innerHTML = FEATURED_IDS.map(getProduct).filter(Boolean).map(renderProductCard).join('');
  }

  if (catalog) {
    catalog.innerHTML = filteredProducts.map(renderProductCard).join('');
  }

  updateCatalogControls(filteredProducts.length);
}

function scrollCatalogIntoView() {
  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setCatalogFilter(filter, shouldScroll = false) {
  activeCatalogFilter = filter || 'all';
  renderProducts();
  if (shouldScroll) scrollCatalogIntoView();
}

function clearCatalogFilters() {
  activeCatalogFilter = 'all';
  catalogSearchQuery = '';
  renderProducts();
}

function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function addProductToCart(productId) {
  const product = getProduct(productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  updateCartCount();
  renderCartItems();
  showToast(product.name + ' added to cart');
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartCount();
  renderCartItems();
}

function updateQty(productId, delta) {
  const item = cart.find(entry => entry.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
    updateCartCount();
    renderCartItems();
  }
}

function renderCartItems() {
  const el = document.getElementById('cartItems');
  const subtotal = document.getElementById('cartSubtotal');
  if (!el) return;

  const lines = getCartLines();
  if (lines.length === 0) {
    el.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>Your cart is empty</p>
      </div>`;
  } else {
    el.innerHTML = lines.map(({ product, qty }) => `
      <div class="cart-item">
        <img class="cart-item-img" src="${product.image}" alt="${escapeHtml(product.name)}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(product.name)}</div>
          <div class="cart-item-meta">Qty: ${qty}</div>
          <div class="cart-item-actions">
            <button class="qty-btn cart-qty-btn" data-id="${product.id}" data-delta="-1" type="button">-</button>
            <span class="qty-value">${qty}</span>
            <button class="qty-btn cart-qty-btn" data-id="${product.id}" data-delta="1" type="button">+</button>
          </div>
        </div>
        <span class="cart-item-price">${formatPrice(product.price * qty)}</span>
      </div>`).join('');
  }

  if (subtotal) subtotal.textContent = formatPrice(getCartTotal());
}

function buildWhatsAppMessage() {
  const lines = getCartLines().map(({ product, qty }, index) => {
    return `${index + 1}. ${product.name} x${qty} - ${formatPrice(product.price * qty)}`;
  });

  return [
    "Hello Dale's Foothaven, I'd like to place an order inquiry.",
    '',
    ...lines,
    '',
    `Total: ${formatPrice(getCartTotal())}`,
    '',
    'Please confirm availability, sizes, and delivery details.'
  ].join('\n');
}

function openOrderInquiry() {
  if (cart.length === 0) {
    showToast('Add something to your cart before sending an order inquiry.');
    return;
  }

  const message = buildWhatsAppMessage();
  const url = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
}

function openQuickViewForProduct(productId) {
  quickViewProduct = getProduct(productId);
  if (!quickViewProduct) return;

  const image = document.getElementById('quickViewImage');
  const badge = document.getElementById('quickViewBadge');
  const original = document.getElementById('quickViewOriginal');

  if (image) {
    image.src = quickViewProduct.image;
    image.alt = quickViewProduct.name;
  }

  if (badge) {
    badge.textContent = quickViewProduct.badge;
    badge.className = ['product-badge', quickViewProduct.badgeClass].filter(Boolean).join(' ');
  }

  document.getElementById('quickViewName').textContent = quickViewProduct.name;
  document.getElementById('quickViewDesc').textContent = quickViewProduct.desc;
  document.getElementById('quickViewPrice').textContent = formatPrice(quickViewProduct.price);
  if (original) {
    original.textContent = '';
    original.style.display = 'none';
  }

  document.querySelectorAll('.quick-view-size').forEach((size, index) => {
    size.classList.toggle('active', index === 0);
  });

  document.getElementById('quickViewModal')?.classList.add('open');
  document.getElementById('quickViewOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openQuickView(btn) {
  const card = btn.closest('.product-card');
  openQuickViewForProduct(card?.dataset.id);
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
  if (!quickViewProduct) return;
  addProductToCart(quickViewProduct.id);
  closeQuickView();
  openCart();
}

function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  if (!document.getElementById('quickViewModal')?.classList.contains('open') &&
      !document.getElementById('mobileMenu')?.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

function openMobileMenu() {
  document.getElementById('mobileMenu')?.classList.add('open');
  document.getElementById('mobileMenuOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  document.getElementById('mobileMenu')?.classList.remove('open');
  document.getElementById('mobileMenuOverlay')?.classList.remove('open');
  if (!document.getElementById('cartSidebar')?.classList.contains('open') &&
      !document.getElementById('quickViewModal')?.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

function initHeroCarousel() {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const container = document.getElementById('heroIndicators');
  if (!slides.length || !container) return;

  container.innerHTML = slides.map((slide, index) => `
    <button class="hero-indicator ${index === 0 ? 'active' : ''}" data-index="${index}" type="button">
      <span class="hero-indicator-num">${slide.dataset.num || String(index + 1).padStart(2, '0')}</span>
      <span class="hero-indicator-label">${slide.dataset.label || ''}</span>
    </button>`).join('');

  function goToSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    document.querySelectorAll('.hero-indicator').forEach(button => button.classList.remove('active'));
    currentSlide = ((index % slides.length) + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    document.querySelectorAll('.hero-indicator')[currentSlide]?.classList.add('active');
  }

  function startAutoPlay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5500);
  }

  container.addEventListener('click', event => {
    const btn = event.target.closest('.hero-indicator');
    if (!btn) return;
    goToSlide(parseInt(btn.dataset.index, 10));
    startAutoPlay();
  });

  let touchStartX = 0;
  const wrapper = document.getElementById('heroWrapper');
  wrapper?.addEventListener('touchstart', event => {
    touchStartX = event.touches[0].clientX;
  }, { passive: true });
  wrapper?.addEventListener('touchend', event => {
    const diff = touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(currentSlide + (diff > 0 ? 1 : -1));
      startAutoPlay();
    }
  });

  startAutoPlay();
}

function initScrollBehaviours() {
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 10);
    scrollTopBtn?.classList.toggle('visible', y > 400);
  }, { passive: true });

  scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initNewsletter() {
  document.getElementById('newsletterForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = event.target.querySelector('input');
    if (input?.value) {
      showToast("You're on the list! Welcome to Dale's Foothaven.");
      input.value = '';
    }
  });
}

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
    toast.style.opacity = '1';
  });

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
  }, 3000);
}

function initProductActions() {
  document.body.addEventListener('click', event => {
    const filterLink = event.target.closest('[data-filter-link]');
    if (filterLink) {
      event.preventDefault();
      setCatalogFilter(filterLink.dataset.filterLink, true);
      return;
    }

    const categoryCard = event.target.closest('[data-category-trigger]');
    if (categoryCard) {
      setCatalogFilter(categoryCard.dataset.categoryTrigger, true);
      return;
    }

    const productButton = event.target.closest('[data-action]');
    if (!productButton) return;

    const card = productButton.closest('.product-card');
    if (!card) return;

    if (productButton.dataset.action === 'add-to-cart') {
      addProductToCart(card.dataset.id);
      openCart();
    }

    if (productButton.dataset.action === 'quick-view') {
      openQuickViewForProduct(card.dataset.id);
    }
  });
}

function initCatalogControls() {
  document.getElementById('catalogSearch')?.addEventListener('input', event => {
    catalogSearchQuery = event.target.value;
    renderProducts();
  });

  document.getElementById('catalogFilterChips')?.addEventListener('click', event => {
    const chip = event.target.closest('.catalog-chip');
    if (!chip) return;
    setCatalogFilter(chip.dataset.filter);
  });

  document.getElementById('catalogReset')?.addEventListener('click', () => {
    clearCatalogFilters();
    document.getElementById('catalogSearch')?.focus();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('dales_foothaven_cart');

  renderProducts();
  initHeroCarousel();
  initScrollBehaviours();
  initNewsletter();
  initProductActions();
  initCatalogControls();
  updateCartCount();
  renderCartItems();

  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('checkoutBtn')?.addEventListener('click', openOrderInquiry);
  document.getElementById('cartItems')?.addEventListener('click', event => {
    const btn = event.target.closest('.cart-qty-btn');
    if (!btn) return;
    updateQty(btn.dataset.id, parseInt(btn.dataset.delta, 10));
  });

  document.getElementById('quickViewOverlay')?.addEventListener('click', closeQuickView);
  document.getElementById('quickViewClose')?.addEventListener('click', closeQuickView);
  document.getElementById('quickViewCartBtn')?.addEventListener('click', addQuickViewToCart);
  document.querySelectorAll('.quick-view-size').forEach(size => {
    size.addEventListener('click', () => {
      document.querySelectorAll('.quick-view-size').forEach(item => item.classList.remove('active'));
      size.classList.add('active');
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeQuickView();
      closeCart();
      closeMobileMenu();
    }
  });

  document.getElementById('menuToggle')?.addEventListener('click', openMobileMenu);
  document.getElementById('mobileMenuOverlay')?.addEventListener('click', closeMobileMenu);
  document.getElementById('mobileMenuClose')?.addEventListener('click', closeMobileMenu);
});
