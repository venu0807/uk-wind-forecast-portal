import { Link, useLocation } from 'react-router-dom'

export default function NavBar() {
  const { pathname } = useLocation()
  const activeClass = 'border-b-2 border-blue-400 text-white font-semibold pb-1'
  const inactiveClass = 'text-gray-300 hover:text-white transition-colors pb-1'

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center gap-8 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⚡</span>
        <span className="text-blue-400 font-bold text-lg tracking-tight">Wind Forecast Portal</span>
        <span className="text-gray-500 text-xs ml-2 hidden sm:block">UK Day-Ahead Analytics</span>
      </div>
      <div className="flex gap-6 ml-auto">
        <Link to="/" className={pathname === '/' ? activeClass : inactiveClass}>
          Forecast View
        </Link>
        <Link to="/accuracy" className={pathname === '/accuracy' ? activeClass : inactiveClass}>
          Accuracy Dashboard
        </Link>
      </div>
    </nav>
  )
}
