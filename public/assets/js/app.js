document.addEventListener('DOMContentLoaded', () => {
  // Scroll reveal
  const toReveal = Array.from(document.querySelectorAll('.reveal'))
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        io.unobserve(e.target)
      }
    })
  }, { threshold: .12 })
  toReveal.forEach(el => io.observe(el))

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (ev) => {
      const id = a.getAttribute('href')
      if (id && id.length > 1) {
        ev.preventDefault()
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })

	const navToggle = document.querySelector('.nav-toggle');
	const nav = document.querySelector('.nav');
	if (navToggle && nav) {
		navToggle.addEventListener('click', () => nav.classList.toggle('show'));
	}

	const parallaxEls = document.querySelectorAll('.parallax');
	window.addEventListener('scroll', () => {
		const y = window.scrollY;
		parallaxEls.forEach((el) => {
			el.style.transform = `translateY(${y * 0.05}px)`;
		});
	}, { passive: true });

	const io = new IntersectionObserver((entries) => {
		entries.forEach((e) => {
			if (e.isIntersecting) {
				e.target.classList.add('in');
				io.unobserve(e.target);
			}
		});
	}, { threshold: 0.15 });
	document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
});
