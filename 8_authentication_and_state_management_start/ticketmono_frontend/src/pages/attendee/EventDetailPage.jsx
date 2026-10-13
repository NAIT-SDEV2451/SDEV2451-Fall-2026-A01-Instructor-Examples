import { useParams } from 'react-router-dom'

function EventDetailPage() {
  const { id } = useParams()
  return (
    <div>
      <h1>EventDetailPage: {id}</h1>
    </div>
  )
}

export default EventDetailPage
