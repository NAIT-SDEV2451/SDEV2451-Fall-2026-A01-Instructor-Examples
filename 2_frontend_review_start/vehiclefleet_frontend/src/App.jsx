// we're going to import everything we need
// from react router. docs: https://reactrouter.com/home
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink
} from 'react-router-dom'

import VehiclesAndDriversPage from './pages/VehiclesAndDriversPage'
import CreateTripPage from './pages/CreateTripPage'

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
            {/* add the nav. */}
            <NavLink
              to="/"
              className="btn btn-sm btn-ghost"
            >
              Vehicles and Drivers
            </NavLink>
            <NavLink
              to="/trips/new"
              className="btn btn-sm btn-ghost"
            >
              Create new Trip
            </NavLink>
          </div>
        </nav>

        {/* The main content, render the routes. */}
        <main className="p-6 max-w-6xl mx-auto">
          <Routes>
            {/* each route is going to have a path
            and an element which is a component */}
            <Route
              path="/"
              element={<VehiclesAndDriversPage />}
            />
            <Route
              path="/trips/new"
              element={<CreateTripPage />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
