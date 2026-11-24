import { useState } from 'react'
import MyEventsTable from '../../components/MyEventsTable'
import OrganizerSidebar from '../../components/OrganizerSidebar'
import { useMyEvents } from '../../hooks/useMyEvents'
import { formatMoney } from '../../utils/formatMoney'

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
]

function MyEventsPage() {
  const [tab, setTab] = useState('all')
  const { data, isLoading, isError } = useMyEvents()

  if (isLoading) {
    return (
      <div className="flex justify-center mt-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>Failed to load your events. Please try again later.</span>
        </div>
      </div>
    )
  }

  const { totals, events } = data
  const visibleEvents = tab === 'all' ? events : events.filter((event) => event.status === tab)

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <OrganizerSidebar />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Events</h1>
          <button className="btn btn-primary" disabled>+ Create event</button>
        </div>

        <div className="stats stats-vertical sm:stats-horizontal bg-base-100 shadow w-full mb-6">
          <div className="stat">
            <div className="stat-title">Events</div>
            <div className="stat-value text-2xl">{totals.events.toLocaleString('en-US')}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Tickets sold</div>
            <div className="stat-value text-2xl">{totals.tickets_sold.toLocaleString('en-US')}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Gross revenue</div>
            <div className="stat-value text-2xl">{formatMoney(totals.revenue)}</div>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="text-center py-8">You don't have any events yet.</p>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              {TABS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`btn btn-sm ${tab === value ? 'btn-primary btn-soft' : 'btn-outline'}`}
                  aria-pressed={tab === value}
                  onClick={() => setTab(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            {visibleEvents.length === 0 ? (
              <p className="text-center py-8">No {tab} events.</p>
            ) : (
              <MyEventsTable events={visibleEvents} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MyEventsPage
