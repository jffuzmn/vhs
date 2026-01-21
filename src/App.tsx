import { useState, useMemo, useRef } from 'react'
import { Frame, Input, TitleBar } from '@react95/core'
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const clearForm = () => {
    setNewMovieTitle('')
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAddMovie = async () => {
    if (!newMovieTitle.trim()) return
    
    setIsAdding(true)
    try {
      const formData = new FormData()
      formData.append('name', newMovieTitle.trim())
      if (selectedFile) {
        formData.append('cover', selectedFile)
      }

      const response = await fetch(`${API_URL}/movies`, {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const newMovie = await response.json()
        setMovies(prev => [...prev, newMovie])
        clearForm()
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
              <div className="add-modal">
                <div className="add-modal-header">
                  <Mplayer10 variant="16x16_4" />
                  <span>Add New VHS</span>
                  <button 
                    className="modal-close-btn"
                    onClick={() => { setShowAddModal(false); clearForm(); }}
                  >
                    ✕
                  </button>
                </div>
                <div className="add-modal-content">
                  <div className="add-modal-field">
                    <label htmlFor="movieTitle">Movie Title:</label>
                    <input
                      type="text"
                      id="movieTitle"
                      className="modal-input"
                      value={newMovieTitle}
                      onChange={(e) => setNewMovieTitle(e.target.value)}
                      placeholder="Enter movie title..."
                      autoFocus
                    />
                  </div>
                  <div className="add-modal-field">
                    <label htmlFor="movieCover">
                      Cover Image: <span className="optional-text">(optional)</span>
                    </label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="movieCover"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <button 
                        type="button"
                        className="win95-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse...
                      </button>
                      <span className="file-name">
                        {selectedFile ? selectedFile.name : 'No file selected'}
                      </span>
                    </div>
                    {previewUrl && (
                      <div className="image-preview">
                        <img src={previewUrl} alt="Preview" />
                      </div>
                    )}
                  </div>
                  <div className="add-modal-buttons">
                    <button 
                      className="win95-btn"
                      onClick={handleAddMovie} 
                      disabled={isAdding || !newMovieTitle.trim()}
                    >
                      {isAdding ? 'Adding...' : 'Add to Collection'}
                    </button>
                    <button 
                      className="win95-btn"
                      onClick={() => { setShowAddModal(false); clearForm(); }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
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
