// Admin panel JS
document.addEventListener('DOMContentLoaded', function() {
  // Auto-hide alerts
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(a => {
    setTimeout(() => { a.style.opacity = '0'; setTimeout(() => a.remove(), 300); }, 5000);
  });
});
