document.addEventListener('DOMContentLoaded', async () => {
  const box = document.querySelector('#catalog');
  const details = {
    'General Service': ['service-inspection.jpg', 'A thorough check and tune-up to keep your motorcycle running smoothly.'],
    'Engine Repair': ['service-engine.jpg', 'Careful diagnosis and repair for dependable engine performance.'],
    'Oil Change': ['service-oil.jpg', 'Fresh oil and routine checks to protect your engine between rides.'],
    'Brake Service': ['service-brakes.jpg', 'Brake inspection and maintenance for confident stopping.']
  };
  try {
    const services = await api('/api/services');
    box.innerHTML = services.map((s, i) => {
      const [image, description] = details[s.service_name] || ['service-inspection.jpg', 'Professional motorcycle maintenance from our workshop.'];
      return `<article class="card service-card"><img src="/${image}" alt="${esc(s.service_name)} motorcycle service" loading="lazy"><div class="service-card-body"><p class="service-kicker">${String(i + 1).padStart(2, '0')} / WORKSHOP SERVICE</p><h3>${esc(s.service_name)}</h3><p class="service-description">${description}</p><div class="service-card-foot"><p><small>Starting at</small><strong>${money(s.price)}</strong></p><a class="service-arrow" href="/booking.html" aria-label="Book ${esc(s.service_name)}">→</a></div></div></article>`;
    }).join('');
  } catch (e) { box.innerHTML = `<p>${esc(e.message)}</p>`; }
});