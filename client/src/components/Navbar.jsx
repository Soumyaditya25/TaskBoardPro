import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false)
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  return (
    <nav
      ref={profileRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white bg-opacity-90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span
                className="font-bold text-xl text-primary-600 transition-colors duration-300"
              >
                TaskBoard Pro
              </span>
            </Link>
          </div>

          {currentUser && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                  location.pathname === '/' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen((o) => !o)}
                  className="flex items-center space-x-2 focus:outline-none group"
                >
                  <span className="text-gray-700">
                    {currentUser.name || currentUser.email}
                  </span>
                  <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-primary-500 group-hover:ring-primary-600 transition-all">
                    <img
                      src={
                        currentUser.photoURL ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          currentUser.name || currentUser.email
                        )}&background=random`
                      }
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 animate-fadeIn">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          {currentUser && (
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen((o) => !o)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              >
                <svg
                  className="h-6 w-6 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      isMenuOpen
                        ? 'M6 18L18 6M6 6l12 12'
                        : 'M4 6h16M4 12h16M4 18h16'
                    }
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {isMenuOpen && currentUser && (
        <div className="md:hidden absolute w-full bg-white shadow-lg border-t border-gray-200 animate-slideDown">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md ${
                location.pathname === '/' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
