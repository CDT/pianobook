import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const basePath = '/pianobook/'

function canonicalBaseRedirect() {
  const redirect = (req, res, next) => {
    const [pathname, query] = (req.url ?? '').split('?')

    if (pathname === basePath.slice(0, -1)) {
      res.statusCode = 308
      res.setHeader('Location', `${basePath}${query ? `?${query}` : ''}`)
      res.end()
      return
    }

    next()
  }

  return {
    name: 'canonical-base-redirect',
    configureServer(server) {
      server.middlewares.use(redirect)
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirect)
    },
  }
}

export default defineConfig({
  plugins: [canonicalBaseRedirect(), react()],
  base: basePath,
})
