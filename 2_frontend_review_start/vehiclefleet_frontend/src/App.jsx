// we're going to import everything we need
// from react router. docs: https://reactrouter.com/home
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink
} from 'react-router-dom'

function App() {
  // wrap the entire thing in a browser router.
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200">
        {/* This a navbar. */}
        <nav className="navbar bg-base-100 shadow px-6">
          <div className="navbar-start">
            <span className="text-lg font-bold">Fleet Manager</span>
          </div>
          <div className="navbar-end gap-2">

          </div>
        </nav>

        {/* The main content, render the routes. */}
        <main className="p-6 max-w-6xl mx-auto">
          <Routes>
            {/* each route is going to have a path
            and an element which is a component */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
