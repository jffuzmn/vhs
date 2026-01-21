import { useState, useMemo } from 'react'
import { Frame, Input, TitleBar, Button } from '@react95/core'
import { Mplayer10 } from '@react95/icons'
import { Tabs, Tab } from './components/Tabs'
import initialMoviesData from './movies.json'

interface Movie {
  id: string
  name: string
  img_url: string | null
}

const API_URL = 'http://localhost:3001/api';

function App() {
  const [movies, setMovies] = useState<Movie[]>(initialMoviesData)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMovieTitle, setNewMovieTitle] = useState('')
  const [newMovieImage, setNewMovieImage] = useState('')
  const [isAdding, setIsAdding] = useState(false)

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

  const handleAddMovie = async () => {
    if (!newMovieTitle.trim()) return
    
    setIsAdding(true)
    try {
      const response = await fetch(`${API_URL}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newMovieTitle.trim(),
          img_url: newMovieImage.trim() || null
        }),
      })
      
      if (response.ok) {
        const newMovie = await response.json()
        setMovies(prev => [...prev, newMovie])
        setNewMovieTitle('')
        setNewMovieImage('')
        setShowAddModal(false)
      } else {
        alert('Failed to add movie. Make sure the API server is running!')
      }
    } catch (error) {
      alert('Failed to connect to API. Run: npm run server')
    } finally {
      setIsAdding(false)
    }
  }

  const sortedMovies = useMemo(() => {
    const stripThe = (name: string) => {
      return name.replace(/^The\s+/i, '')
      .replace(/^A\s+/i, '')
    }
    return [...movies].sort((a, b) => 
      stripThe(a.name).localeCompare(stripThe(b.name))
    )
  }, [movies])

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
              <p className="win95-count">{movies.length} collected</p>
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
              <button 
                className="add-vhs-btn"
                onClick={() => setShowAddModal(true)}
              >
                <span className="add-vhs-icon">+</span>
                Add VHS
              </button>
            </div>
          </Frame>

          {/* Add Movie Modal */}
          {showAddModal && (
            <div className="modal-overlay">
              <Frame className="add-modal">
                <TitleBar 
                  title="Add New VHS" 
                  active={true}
                  icon={<Mplayer10 variant="16x16_4" />}
                >
                  <TitleBar.OptionsBox>
                    <TitleBar.Close onClick={() => setShowAddModal(false)} />
                  </TitleBar.OptionsBox>
                </TitleBar>
                <div className="add-modal-content">
                  <div className="add-modal-field">
                    <label htmlFor="movieTitle" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                      Movie Title:
                    </label>
                    <Input
                      id="movieTitle"
                      value={newMovieTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMovieTitle(e.target.value)}
                      placeholder="Enter movie title..."
                      style={{ width: '100%' }}
                      autoFocus
                    />
                  </div>
                  <div className="add-modal-field">
                    <label htmlFor="movieImage" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                      Cover Image URL: <span style={{ fontWeight: 'normal', color: '#666' }}>(optional)</span>
                    </label>
                    <Input
                      id="movieImage"
                      value={newMovieImage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMovieImage(e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                      style={{ width: '100%' }}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' && newMovieTitle.trim()) handleAddMovie()
                      }}
                    />
                    {newMovieImage && (
                      <div className="image-preview">
                        <img 
                          src={newMovieImage} 
                          alt="Preview" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                          onLoad={(e) => {
                            (e.target as HTMLImageElement).style.display = 'block'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="add-modal-buttons">
                    <Button onClick={handleAddMovie} disabled={isAdding || !newMovieTitle.trim()}>
                      {isAdding ? 'Adding...' : 'Add to Collection'}
                    </Button>
                    <Button onClick={() => { setShowAddModal(false); setNewMovieTitle(''); setNewMovieImage(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Frame>
            </div>
          )}

          <Tabs>
            <Tab label="Collected">
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
                        <p className="vhs-text">{movie.name}</p>
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
            </Tab>
            
            <Tab label="Wishlist">
              <div className="wishlist-content">
                <Frame boxShadow="out" style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Wishlist Coming Soon!
                  </p>
                  <p style={{ margin: '1rem 0 0 0', color: '#666' }}>
                    This feature will allow you to track movies you want to add to your collection.
                  </p>
                </Frame>
              </div>
            </Tab>
          </Tabs>
        </div>
      </Frame>
    </div>
  )
}

export default App
