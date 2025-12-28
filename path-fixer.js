;(function () {
  const isGitHubPages = window.location.hostname.includes('github.io')
  let basePath = ''

  if (isGitHubPages) {
    const path = window.location.pathname
    const parts = path.split('/').filter(Boolean)
    if (parts.length >= 1) {
      basePath = '/' + parts[0]
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[href^="/"]').forEach(el => {
      const href = el.getAttribute('href')
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        el.href = basePath + href
      }
    })

    document.querySelectorAll('[src^="/"]').forEach(el => {
      const src = el.getAttribute('src')
      if (src && src.startsWith('/') && !src.startsWith('//')) {
        el.src = basePath + src
      }
    })
  })
})()
