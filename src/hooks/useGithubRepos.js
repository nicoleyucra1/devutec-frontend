import { useAsync } from './useAsync'

// Repositorios públicos de un usuario de GitHub, los más destacados primero (más estrellas, después los
// actualizados hace menos). Se piden directo a la API pública de GitHub, que no necesita token;
// si falla (usuario que no existe, límite de GitHub) la sección simplemente no se muestra.
export function useGithubRepos(username, limit = 3) {
  return useAsync(
    async ({ signal }) => {
      if (!username) return []
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`, {
        signal,
        headers: { Accept: 'application/vnd.github+json' },
      })
      if (!response.ok) throw new Error('No pudimos cargar los repositorios de GitHub')
      const repos = await response.json()
      return repos
        .filter((repo) => !repo.fork && !repo.archived)
        .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, limit)
        .map((repo) => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          url: repo.html_url,
        }))
    },
    [username, limit],
  )
}
