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
})
