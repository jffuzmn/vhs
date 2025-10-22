import { useState, useMemo } from 'react'
import { Frame, Input, TitleBar } from '@react95/core'
import { Mplayer10 } from '@react95/icons'
import moviesData from './movies.json'

interface Movie {
  id: string
  name: string
  img_url: string | null
}

function App() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 1
    const centerY = rect.height / 1
    
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
    
    // Update glow position
    const glowX = (x / rect.width) * 100
    const glowY = (y / rect.height) * 100
    card.style.setProperty('--mouse-x', `${glowX}%`)
    card.style.setProperty('--mouse-y', `${glowY}%`)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
  }

  const sortedMovies = useMemo(() => {
    const stripThe = (name: string) => {
      return name.replace(/^The\s+/i, '')
      .replace(/^A\s+/i, '')
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
    <div className="win95-desktop">
      <Frame className="win95-window-frame">
        <TitleBar className="win95-title-bar" 
        icon={<Mplayer10 variant="32x32_4" />}
        title="VHS Collection" 
        active={true}
        />
        
        <div className="modal-content">
          <Frame className="win95-header">
            <div className="win95-header-content">
              <p className="win95-count">{moviesData.length} collected</p>
            </div>
            
            <div className="win95-search">
              <label htmlFor="search" style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>
                Search:
              </label>
              <Input className="win95-search-input"
                id="search"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Find a movie..."
                style={{ width: '250px' }}
              />
            </div>
          </Frame>

          <Frame boxShadow="in" className="win95-content-frame">
            <div className="movie-grid">
              {filteredMovies.map((movie: Movie) => (
                <div 
                  key={movie.id} 
                  className="movie-card"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {movie.img_url ? (
                    <img 
                      src={movie.img_url} 
                      alt={movie.name}
                      className="movie-image"
                    />
                  ) : (
                    <div className="movie-placeholder">
                      <svg 
                        className="vhs-icon"
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
                      <p className="vhs-text">VHS</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredMovies.length === 0 && (
              <div className="no-results">
                <Frame boxShadow="out">
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    No movies found matching "{searchQuery}"
                  </p>
                </Frame>
              </div>
            )}
          </Frame>
        </div>
      </Frame>
    </div>
  )
}

export default App
