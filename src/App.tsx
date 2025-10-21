import { useState, useMemo } from 'react'
import moviesData from './movies.json'

interface Movie {
  id: string
  name: string
  img_url: string | null
}

function App() {
  const [searchQuery, setSearchQuery] = useState('')

  const sortedMovies = useMemo(() => {
    const stripThe = (name: string) => {
      return name.replace(/^The\s+/i, '')
    }
    return [...moviesData].sort((a, b) => 
      stripThe(a.name).localeCompare(stripThe(b.name))
    )
  }, [])

  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return sortedMovies
    
    const query = searchQuery.toLowerCase()
    return sortedMovies.filter(movie => 
      movie.name.toLowerCase().includes(query)
    )
  }, [searchQuery, sortedMovies])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="neo-header flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="neo-title text-5xl mb-2">VHS Collection</h1>
          <p className="neo-count text-xl">
            Amount: {moviesData.length}
          </p>
        </div>

        <div className="flex-shrink-0">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="neo-input w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredMovies.map((movie: Movie) => (
          <div key={movie.id} className="neo-card">
            <div className="aspect-[2/3] max-h-64 neo-placeholder flex items-center justify-center mb-3">
              {movie.img_url ? (
                <img 
                  src={movie.img_url} 
                  alt={movie.name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="text-center">
                  <svg 
                    className="w-16 h-16 mx-auto neo-vhs-icon"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18"
                    />
                  </svg>
                  <p className="text-sm font-bold mt-2 neo-vhs-icon">VHS</p>
                </div>
              )}
            </div>
            <h3 className="neo-movie-title text-center">{movie.name}</h3>
          </div>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="text-center py-12">
          <div className="neo-card inline-block bg-red-400">
            <p className="text-xl font-bold">No movies found matching "{searchQuery}"</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
