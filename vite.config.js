import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
const repository = process.env.GITHUB_REPOSITORY || ''
const repoName = repository.split('/')[1] || ''

export default defineConfig({
  plugins: [react()],
  base: isGitHubActions && repoName ? `/${repoName}/` : '/',
})
