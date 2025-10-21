import { useState, useMemo } from 'react'
import moviesData from './movies.json'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">VHS Collection</h1>
          <p className="text-lg text-muted-foreground">
            Amount: {moviesData.length}
          </p>
        </div>

        <div className="flex-shrink-0">
          <Input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
        {filteredMovies.map((movie: Movie) => (
          <Card key={movie.id} className="hover:shadow-lg transition-shadow overflow-hidden w-full">
            <div className="aspect-[2/3] max-h-64 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto">
              {movie.img_url ? (
                <img 
                  src={movie.img_url} 
                  alt={movie.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <svg 
                    className="w-16 h-16 mx-auto text-muted-foreground/40"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18"
                    />
                  </svg>
                  <p className="text-xs text-muted-foreground/60 mt-2">VHS</p>
                </div>
              )}
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-balance">{movie.name}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No movies found matching "{searchQuery}"
        </div>
      )}
    </div>
  )
}

export default App
