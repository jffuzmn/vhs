import { useState, useMemo } from 'react'
import './App.css'
import moviesData from './movies.json'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Movie {
  id: string
  name: string
  img_url: string | null
}

function App() {
  const [searchQuery, setSearchQuery] = useState('')

  const sortedMovies = useMemo(() => {
    return [...moviesData].sort((a, b) => a.name.localeCompare(b.name))
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">VHS Collection</h1>
        <p className="text-lg text-muted-foreground">
          Amount: {moviesData.length}
        </p>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMovies.map((movie: Movie) => (
          <Card key={movie.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{movie.name}</CardTitle>
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
