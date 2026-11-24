import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Screens that don't exist yet.
const DISABLED_ITEMS = ['Sales', 'Attendees', 'Settings']

function OrganizerSidebar() {
  const { user } = useAuth()

  return (
    <aside className="bg-base-100 shadow rounded-box p-4 md:w-44 shrink-0 flex flex-col justify-between gap-6">
      <nav aria-label="Organizer" className="flex flex-col gap-1">
        <NavLink
          to="/my-events"
          className={({ isActive }) =>
            `btn btn-sm justify-start ${isActive ? 'btn-primary btn-soft' : 'btn-ghost'}`
          }
        >
          Events
        </NavLink>
        {DISABLED_ITEMS.map((item) => (
          <button key={item} className="btn btn-ghost btn-sm justify-start" disabled>
            {item}
          </button>
        ))}
      </nav>
      <div className="border-t border-base-300 pt-3">
        <p className="font-semibold text-sm">{user.username}</p>
        <p className="text-xs text-base-content/60">Organizer</p>
      </div>
    </aside>
  )
}

export default OrganizerSidebar
