(function () {
  'use strict';

  // <config>
  // WhatsApp number that receives orders: country code plus number, digits only (for example 919876543210).
  var WHATSAPP_NUMBER = '917742062730';
  // Shows the "sample products" strip at the top. Set to false when the real catalogue is in.
  var SHOW_PREVIEW_NOTICE = true;
  var CART_KEY = 'khetfit-cart-v1';
  var MAX_QTY = 20;
  // </config>

  var CATEGORIES = [
    { id: 'peanut-butter', label: 'Peanut butter', ico: 'ico-pb' },
    { id: 'protein', label: 'Protein', ico: 'ico-pr' },
    { id: 'supplements', label: 'Supplements', ico: 'ico-su' },
    { id: 'healthy-foods', label: 'Healthy foods', ico: 'ico-hf' }
  ];

  // Sample catalogue. Replace names, sizes and prices (in rupees) with the real ones.
  var PRODUCTS = [
    { id: 'pb-creamy', cat: 'peanut-butter', name: 'Creamy Peanut Butter', size: '1 kg', type: 'Smooth texture', price: 399 },
    { id: 'pb-crunchy', cat: 'peanut-butter', name: 'Crunchy Peanut Butter', size: '1 kg', type: 'Crunchy texture', price: 399 },
    { id: 'pb-choc', cat: 'peanut-butter', name: 'Chocolate Peanut Butter', size: '500 g', type: 'Chocolate flavour', price: 279 },
    { id: 'pb-combo', cat: 'peanut-butter', name: 'Peanut Butter Combo', size: '2 x 1 kg', type: 'Creamy and crunchy', price: 749 },
    { id: 'pr-whey-choc', cat: 'protein', name: 'Whey Protein Chocolate', size: '1 kg', type: 'Chocolate flavour', price: 2299 },
    { id: 'pr-whey-van', cat: 'protein', name: 'Whey Protein Vanilla', size: '1 kg', type: 'Vanilla flavour', price: 2299 },
    { id: 'pr-plant', cat: 'protein', name: 'Plant Protein', size: '1 kg', type: 'Chocolate flavour', price: 1799 },
    { id: 'pr-shaker', cat: 'protein', name: 'Protein Shaker', size: '700 ml', type: 'Shaker bottle', price: 349 },
    { id: 'su-creatine', cat: 'supplements', name: 'Creatine Monohydrate', size: '250 g', type: 'Unflavoured powder', price: 899 },
    { id: 'su-multi', cat: 'supplements', name: 'Multivitamin', size: '60 tablets', type: 'Daily tablet', price: 599 },
    { id: 'su-omega', cat: 'supplements', name: 'Omega-3 Fish Oil', size: '60 softgels', type: 'Softgel capsules', price: 649 },
    { id: 'su-ashwa', cat: 'supplements', name: 'Ashwagandha', size: '60 capsules', type: 'Capsules', price: 449 },
    { id: 'hf-oats', cat: 'healthy-foods', name: 'Rolled Oats', size: '1 kg', type: 'Whole grain oats', price: 189 },
    { id: 'hf-seeds', cat: 'healthy-foods', name: 'Mixed Seeds', size: '400 g', type: 'Seed mix', price: 349 },
    { id: 'hf-makhana', cat: 'healthy-foods', name: 'Roasted Makhana', size: '250 g', type: 'Roasted snack', price: 299 },
    { id: 'hf-almonds', cat: 'healthy-foods', name: 'Almonds', size: '500 g', type: 'Whole almonds', price: 549 },
    { id: 'hf-bars', cat: 'healthy-foods', name: 'Snack Bars', size: 'Box of 6', type: 'Ready to eat', price: 599 }
  ];

  var STATES = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
    'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // <pure>
  function cartLines(cart, products) {
    return products
      .filter(function (p) { return cart[p.id] > 0; })
      .map(function (p) { return { p: p, qty: cart[p.id], total: p.price * cart[p.id] }; });
  }
  function subtotal(lines) {
    return lines.reduce(function (s, l) { return s + l.total; }, 0);
  }
  function normPhone(raw) {
    var d = String(raw).replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
    else if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
    return d;
  }
  function validate(v) {
    var e = {};
    if (v.name.trim().length < 2) e.name = 'Enter your full name.';
    if (!/^[6-9]\d{9}$/.test(normPhone(v.phone))) e.phone = 'Enter a 10-digit mobile number.';
    if (v.house.trim().length < 1) e.house = 'Enter your house or flat number.';
    if (v.area.trim().length < 3) e.area = 'Enter your street and area.';
    if (v.city.trim().length < 2) e.city = 'Enter your city or town.';
    if (!v.state) e.state = 'Select your state.';
    if (!/^[1-9]\d{5}$/.test(v.pin.trim())) e.pin = 'Enter a 6-digit PIN code.';
    if (!v.confirm) e.confirm = 'Tick the box to confirm your details.';
    return e;
  }
  function addressParts(v) {
    return [v.house.trim(), v.area.trim(), v.landmark.trim() ? (/^near\b/i.test(v.landmark.trim()) ? v.landmark.trim() : 'Near ' + v.landmark.trim()) : '', v.city.trim(), v.state].filter(Boolean);
  }
  function paymentLabel(p) {
    return p === 'upi' ? 'UPI (please send payment details)' : 'Cash on delivery';
  }
  function buildMessage(lines, v, money) {
    var rows = lines.map(function (l, i) {
      return (i + 1) + '. ' + l.p.name + ', ' + l.p.size + ' x ' + l.qty + ' = ' + money(l.total);
    });
    var out = [
      'New order from the KhetFit website',
      '',
      'Name: ' + v.name.trim(),
      'Phone: ' + normPhone(v.phone),
      'Address: ' + addressParts(v).join(', ') + ' - ' + v.pin.trim(),
      '',
      'Items:'
    ].concat(rows, ['', 'Subtotal: ' + money(subtotal(lines)), 'Payment: ' + paymentLabel(v.payment)]);
    if (v.notes.trim()) out.push('Notes: ' + v.notes.trim());
    return out.join('\n');
  }
  // </pure>

  var fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  var money = function (n) { return fmt.format(n); };
  var $ = function (s) { return document.querySelector(s); };
  var catById = {};
  CATEGORIES.forEach(function (c) { catById[c.id] = c; });
  var prodById = {};
  PRODUCTS.forEach(function (p) { prodById[p.id] = p; });

  var el = {
    notice: $('#notice'), tabs: $('#tabs'), search: $('#search'), sort: $('#sort'),
    count: $('#result-count'), grid: $('#grid'), empty: $('#empty'), emptyTitle: $('#empty-title'),
    reset: $('#reset-filters'), cartBtn: $('#cart-btn'), cartCount: $('#cart-count'),
    scrim: $('#scrim'), drawer: $('#drawer'), title: $('#drawer-title'), back: $('#drawer-back'),
    close: $('#drawer-close'), vCart: $('#view-cart'), vDetails: $('#view-details'), vReady: $('#view-ready'),
    cartBody: $('#cart-body'), cartFoot: $('#cart-foot'), subtotal: $('#cart-subtotal'),
    toDetails: $('#to-details'), detailsSummary: $('#details-summary'), detailsTotal: $('#details-total'),
    orderText: $('#order-text'), waLink: $('#wa-link'), readyCopy: $('#ready-copy'),
    copyOrder: $('#copy-order'), clearCart: $('#clear-cart'), toast: $('#toast'), footerContact: $('#footer-contact')
  };
  var fields = {
    name: $('#f-name'), phone: $('#f-phone'), house: $('#f-house'), area: $('#f-area'), landmark: $('#f-landmark'),
    city: $('#f-city'), state: $('#f-state'), pin: $('#f-pin'), notes: $('#f-notes')
  };
  var confirmBox = $('#f-confirm');

  var cart = {};
  var details = { name: '', phone: '', house: '', area: '', landmark: '', city: '', state: '', pin: '', notes: '', payment: 'cod' };
  var category = 'all';
  var query = '';
  var sort = 'featured';
  var view = 'cart';
  var lastFocus = null;
  var toastTimer = null;
  var currentMessage = '';

  function loadState() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      PRODUCTS.forEach(function (p) {
        var q = parseInt(o && o.cart && o.cart[p.id], 10);
        if (q > 0) cart[p.id] = Math.min(q, MAX_QTY);
      });
      if (o && o.details) {
        Object.keys(details).forEach(function (k) {
          if (typeof o.details[k] === 'string') details[k] = o.details[k];
        });
      }
    } catch (e) { /* storage unavailable: start with an empty cart */ }
  }
  function saveState() {
    try { localStorage.setItem(CART_KEY, JSON.stringify({ cart: cart, details: details })); } catch (e) { /* ignore */ }
  }

  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('show'); }, 2200);
  }

  /* ---------- Catalogue ---------- */
  function renderTabs() {
    var html = '<button type="button" class="tab" data-cat="all" aria-pressed="true">All products</button>';
    CATEGORIES.forEach(function (c) {
      html += '<button type="button" class="tab" data-cat="' + c.id + '" aria-pressed="false"><i class="ico ' + c.ico + '" aria-hidden="true"></i>' + c.label + '</button>';
    });
    el.tabs.innerHTML = html;
  }
  function syncTabs() {
    Array.prototype.forEach.call(el.tabs.querySelectorAll('.tab'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.cat === category));
    });
  }
  function visibleProducts() {
    var q = query.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      if (category !== 'all' && p.cat !== category) return false;
      if (!q) return true;
      return (p.name + ' ' + p.type + ' ' + p.size + ' ' + catById[p.cat].label).toLowerCase().indexOf(q) !== -1;
    });
    if (sort === 'low') list.sort(function (a, b) { return a.price - b.price; });
    else if (sort === 'high') list.sort(function (a, b) { return b.price - a.price; });
    else if (sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return list;
  }
  function buyHtml(p) {
    var q = cart[p.id] || 0;
    if (!q) {
      return '<button type="button" class="add" data-act="add" data-id="' + p.id + '" aria-label="Add ' + p.name + ', ' + p.size + ', to cart">Add to cart</button>';
    }
    return '<div class="stepper" role="group" aria-label="' + p.name + ' quantity">' +
      '<button type="button" data-act="dec" data-id="' + p.id + '" aria-label="Decrease quantity">&minus;</button>' +
      '<span>' + q + '</span>' +
      '<button type="button" data-act="inc" data-id="' + p.id + '" aria-label="Increase quantity"' + (q >= MAX_QTY ? ' disabled' : '') + '>+</button></div>';
  }
  function cardHtml(p) {
    var c = catById[p.cat];
    return '<article class="card" data-id="' + p.id + '">' +
      '<div class="tile cat-' + p.cat + '"><i class="ico ' + c.ico + '" aria-hidden="true"></i><span class="size">' + p.size + '</span></div>' +
      '<div class="card-body"><h3>' + p.name + '</h3><p class="type">' + p.type + '</p>' +
      '<div class="buy"><span class="price">' + money(p.price) + '</span><div class="buy-ctl" data-ctl="' + p.id + '">' + buyHtml(p) + '</div></div></div></article>';
  }
  function renderGrid() {
    var list = visibleProducts();
    el.grid.innerHTML = list.map(cardHtml).join('');
    el.grid.hidden = list.length === 0;
    el.empty.hidden = list.length !== 0;
    if (!list.length) el.emptyTitle.textContent = query.trim() ? 'No products match your search' : 'No products in this category';
    el.count.textContent = list.length + (list.length === 1 ? ' product' : ' products');
  }
  function refreshCard(id) {
    var ctl = el.grid.querySelector('[data-ctl="' + id + '"]');
    if (ctl) ctl.innerHTML = buyHtml(prodById[id]);
  }
  function focusIn(container, selector) {
    var t = container.querySelector(selector);
    if (t) t.focus();
    return !!t;
  }

  /* ---------- Cart ---------- */
  function totalItems() {
    return Object.keys(cart).reduce(function (s, k) { return s + cart[k]; }, 0);
  }
  function updateCount() {
    var n = totalItems();
    el.cartCount.textContent = n;
    el.cartCount.hidden = n === 0;
    el.cartBtn.setAttribute('aria-label', n ? 'Open cart, ' + n + (n === 1 ? ' item' : ' items') : 'Open cart, empty');
  }
  function setQty(id, q) {
    q = Math.max(0, Math.min(MAX_QTY, q));
    if (q) cart[id] = q; else delete cart[id];
    saveState();
    refreshCard(id);
    updateCount();
    renderCart();
  }
  function renderCart() {
    var lines = cartLines(cart, PRODUCTS);
    var sum = subtotal(lines);
    var n = totalItems();
    el.subtotal.textContent = money(sum);
    el.detailsTotal.textContent = money(sum);
    el.detailsSummary.textContent = n + (n === 1 ? ' item' : ' items');
    if (!lines.length) {
      el.cartBody.innerHTML = '<div class="cart-empty"><strong>Your cart is empty</strong><span>Add a product to start your order.</span><button type="button" class="btn btn-ghost" data-act="shop">Browse products</button></div>';
      el.cartFoot.hidden = true;
      if (view !== 'cart' && el.drawer.classList.contains('open')) showView('cart');
      return;
    }
    el.cartFoot.hidden = false;
    el.cartBody.innerHTML = lines.map(function (l) {
      var p = l.p;
      return '<div class="line" data-id="' + p.id + '">' +
        '<div class="thumb cat-' + p.cat + '"><i class="ico ' + catById[p.cat].ico + '" aria-hidden="true"></i></div>' +
        '<div class="line-info"><span class="line-name">' + p.name + '</span>' +
        '<span class="line-meta">' + p.size + ' &middot; ' + money(p.price) + ' each</span>' +
        '<div class="stepper" role="group" aria-label="' + p.name + ' quantity">' +
        '<button type="button" data-act="dec" data-id="' + p.id + '" aria-label="Decrease quantity">&minus;</button>' +
        '<span>' + l.qty + '</span>' +
        '<button type="button" data-act="inc" data-id="' + p.id + '" aria-label="Increase quantity"' + (l.qty >= MAX_QTY ? ' disabled' : '') + '>+</button></div></div>' +
        '<div class="line-end"><span class="line-total">' + money(l.total) + '</span>' +
        '<button type="button" class="link-btn" data-act="remove" data-id="' + p.id + '" aria-label="Remove ' + p.name + '">Remove</button></div></div>';
    }).join('');
  }

  /* ---------- Drawer ---------- */
  var TITLES = { cart: 'Your cart', details: 'Delivery details', ready: 'Order ready' };
  function showView(v) {
    view = v;
    el.vCart.hidden = v !== 'cart';
    el.vDetails.hidden = v !== 'details';
    el.vReady.hidden = v !== 'ready';
    el.title.textContent = TITLES[v];
    el.back.hidden = v === 'cart';
  }
  function openCart() {
    lastFocus = document.activeElement;
    showView('cart');
    renderCart();
    el.drawer.classList.add('open');
    el.scrim.classList.add('open');
    el.drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { el.close.focus(); }, 30);
  }
  function closeCart() {
    el.drawer.classList.remove('open');
    el.scrim.classList.remove('open');
    el.drawer.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function trapTab(e) {
    if (e.key !== 'Tab' || !el.drawer.classList.contains('open')) return;
    var f = Array.prototype.filter.call(
      el.drawer.querySelectorAll('button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'),
      function (n) { return !n.disabled && !n.hidden && n.offsetParent !== null; }
    );
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Checkout ---------- */
  var CHECKED = ['name', 'phone', 'house', 'area', 'city', 'state', 'pin', 'confirm'];
  function fieldFor(k) { return k === 'confirm' ? confirmBox : fields[k]; }
  function readForm() {
    var v = { confirm: confirmBox.checked, payment: 'cod' };
    Object.keys(fields).forEach(function (k) { v[k] = fields[k].value; });
    var pay = el.vDetails.querySelector('input[name="payment"]:checked');
    if (pay) v.payment = pay.value;
    return v;
  }
  function writeForm() {
    Object.keys(fields).forEach(function (k) { fields[k].value = details[k]; });
    Array.prototype.forEach.call(el.vDetails.querySelectorAll('input[name="payment"]'), function (r) {
      r.checked = r.value === details.payment;
    });
    confirmBox.checked = false;
  }
  function showErrors(errors) {
    CHECKED.forEach(function (k) {
      var msg = errors[k] || '';
      $('#e-' + k).textContent = msg;
      if (msg) fieldFor(k).setAttribute('aria-invalid', 'true'); else fieldFor(k).removeAttribute('aria-invalid');
    });
  }
  function prepareOrder(e) {
    e.preventDefault();
    var v = readForm();
    var errors = validate(v);
    showErrors(errors);
    var firstBad = CHECKED.filter(function (k) { return errors[k]; })[0];
    if (firstBad) { fieldFor(firstBad).focus(); return; }
    Object.keys(details).forEach(function (k) { details[k] = v[k]; });
    saveState();
    var lines = cartLines(cart, PRODUCTS);
    currentMessage = buildMessage(lines, v, money);
    el.orderText.textContent = currentMessage;
    if (WHATSAPP_NUMBER) {
      el.waLink.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(currentMessage);
      el.waLink.hidden = false;
      el.readyCopy.textContent = 'Check that the address is correct, then open WhatsApp to send this message to KhetFit.';
    } else {
      el.waLink.hidden = true;
      el.readyCopy.textContent = 'The WhatsApp number is not set up yet. Copy this order and send it to KhetFit directly.';
    }
    showView('ready');
  }
  function copyOrder() {
    var done = function () { showToast('Order copied'); };
    var fallback = function () {
      var r = document.createRange();
      r.selectNodeContents(el.orderText);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      showToast('Order selected. Copy it from your keyboard.');
    };
    try {
      navigator.clipboard.writeText(currentMessage).then(done, fallback);
    } catch (err) { fallback(); }
  }

  /* ---------- Events ---------- */
  el.tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.tab');
    if (!b) return;
    category = b.dataset.cat;
    syncTabs();
    renderGrid();
  });
  el.search.addEventListener('input', function () { query = el.search.value; renderGrid(); });
  el.sort.addEventListener('change', function () { sort = el.sort.value; renderGrid(); });
  el.reset.addEventListener('click', function () {
    category = 'all'; query = ''; el.search.value = '';
    syncTabs(); renderGrid();
  });
  document.querySelector('.footer-cats').addEventListener('click', function (e) {
    var a = e.target.closest('a[data-cat]');
    if (!a) return;
    category = a.dataset.cat;
    syncTabs();
    renderGrid();
  });

  el.grid.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var id = b.dataset.id, act = b.dataset.act, q = cart[id] || 0;
    var ctl = el.grid.querySelector('[data-ctl="' + id + '"]');
    if (act === 'add') {
      setQty(id, 1);
      showToast('Added ' + prodById[id].name);
      focusIn(ctl, '[data-act="inc"]');
    } else if (act === 'inc') {
      setQty(id, q + 1);
      focusIn(ctl, '[data-act="inc"]:not([disabled])') || focusIn(ctl, '[data-act="dec"]');
    } else if (act === 'dec') {
      setQty(id, q - 1);
      focusIn(ctl, q - 1 > 0 ? '[data-act="dec"]' : '[data-act="add"]');
    }
  });

  el.cartBody.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var act = b.dataset.act, id = b.dataset.id, q = cart[id] || 0;
    if (act === 'shop') { closeCart(); var s = document.getElementById('shop'); if (s) s.scrollIntoView(); return; }
    if (act === 'inc') {
      setQty(id, q + 1);
      focusIn(el.cartBody, '[data-id="' + id + '"][data-act="inc"]:not([disabled])') || focusIn(el.cartBody, '[data-id="' + id + '"][data-act="dec"]');
    } else if (act === 'dec' || act === 'remove') {
      setQty(id, act === 'remove' ? 0 : q - 1);
      if (!(cart[id] > 0 && focusIn(el.cartBody, '[data-id="' + id + '"][data-act="' + act + '"]'))) {
        if (!focusIn(el.cartBody, '[data-act="dec"]')) el.close.focus();
      }
    }
  });

  el.cartBtn.addEventListener('click', openCart);
  el.close.addEventListener('click', closeCart);
  el.scrim.addEventListener('click', closeCart);
  el.back.addEventListener('click', function () { showView(view === 'ready' ? 'details' : 'cart'); });
  el.toDetails.addEventListener('click', function () { writeForm(); showView('details'); fields.name.focus(); });
  el.vDetails.addEventListener('submit', prepareOrder);
  el.vDetails.addEventListener('input', function (e) {
    var k = e.target.name;
    if (k && $('#e-' + k)) { $('#e-' + k).textContent = ''; e.target.removeAttribute('aria-invalid'); }
  });
  el.copyOrder.addEventListener('click', copyOrder);
  $('#edit-details').addEventListener('click', function () { showView('details'); fields.name.focus(); });
  el.clearCart.addEventListener('click', function () {
    var ids = Object.keys(cart);
    cart = {};
    saveState();
    ids.forEach(refreshCard);
    updateCount();
    renderCart();
    closeCart();
    showToast('Cart cleared');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && el.drawer.classList.contains('open')) closeCart();
    trapTab(e);
  });

  /* ---------- Start ---------- */
  fields.state.innerHTML = '<option value="">Select state</option>' + STATES.map(function (s) { return '<option>' + s + '</option>'; }).join('');
  loadState();
  renderTabs();
  renderGrid();
  updateCount();
  renderCart();
  el.notice.hidden = !SHOW_PREVIEW_NOTICE;
  if (WHATSAPP_NUMBER) {
    var shown = WHATSAPP_NUMBER;
    el.footerContact.textContent = 'WhatsApp orders: ' + (/^91\d{10}$/.test(shown) ? '+91 ' + shown.slice(2, 7) + ' ' + shown.slice(7) : '+' + shown);
    el.footerContact.hidden = false;
  }
})();
