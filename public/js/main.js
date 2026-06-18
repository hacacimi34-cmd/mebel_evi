// ===== SEARCH TOGGLE =====
function toggleSearch() {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) bar.querySelector('input').focus();
}

// ===== MOBILE MENU =====
function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

// ===== ADD TO CART (AJAX) =====
async function addToCart(productId, qty) {
  qty = qty || 1;
  try {
    const res = await fetch('/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty })
    });
    const data = await res.json();
    if (data.success) {
      // Badge yenilə
      let badge = document.querySelector('.cart-badge');
      if (badge) {
        badge.textContent = data.cartCount;
      } else {
        const cartBtn = document.querySelector('.cart-btn');
        if (cartBtn) {
          badge = document.createElement('span');
          badge.className = 'cart-badge';
          badge.textContent = data.cartCount;
          cartBtn.appendChild(badge);
        }
      }
      showToast('Məhsul səbətə əlavə edildi! 🛒', 'success');
    }
  } catch (err) {
    showToast('Xəta baş verdi', 'error');
  }
}

// ===== CLICK HANDLER - bütün səhifələr üçün =====
document.addEventListener('DOMContentLoaded', function () {

  // Məhsul kartlarındakı "səbətə əlavə et" düymələri
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const productId = btn.dataset.id;
    if (!productId) return;

    // Məhsul detail səhifəsindəki miqdar inputu
    const qtyInput = document.getElementById('qtyInput');
    const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

    // Animasiya
    btn.style.transform = 'scale(0.9)';
    btn.style.opacity = '0.7';
    setTimeout(() => {
      btn.style.transform = '';
      btn.style.opacity = '';
    }, 200);

    addToCart(productId, qty);
  });

  // Flash mesajlarını avtomatik gizlət
  document.querySelectorAll('.flash').forEach(f => {
    setTimeout(() => {
      f.style.transition = 'opacity 0.4s, transform 0.4s';
      f.style.opacity = '0';
      f.style.transform = 'translateY(-8px)';
      setTimeout(() => f.remove(), 400);
    }, 4000);
  });

  // Scroll animasiyaları
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .category-card, .why-card, .testimonial-card, .feature-item').forEach(el => {
    el.classList.add('fade-up');
    observer.observe(el);
  });

});

// ===== TOAST =====
function showToast(message, type) {
  type = type || 'success';
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '"></i> ' + message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
  }, 3000);
}
