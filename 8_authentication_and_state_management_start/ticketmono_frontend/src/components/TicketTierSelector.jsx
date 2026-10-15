export default function TicketTierSelector(
  { tier }
) {
  return <div className="flex items-center justify-between p-4 bg-base-100 rounded-box shadow">
    <div>
      <p className="font-semibold">BASIC</p>
      <p className="text-sm text-base-content/60">$50</p>
    </div>
    <div className="flex items-center gap-3">
      <button className="btn btn-sm btn-outline">-</button>
      <span className="w-6 text-center font-medium">0</span>
      <button className="btn btn-sm btn-outline">+</button>
    </div>
  </div>
}