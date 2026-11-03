// Scale the fixed personal-center artwork while preserving its click regions.
(() => {
  const phone = document.querySelector('.phone');
  const artwork = document.querySelector('.personal-design-canvas');
  const resize = () => { artwork.style.zoom = String(phone.clientWidth / 375); };
  new ResizeObserver(resize).observe(phone);
  resize();
})();
