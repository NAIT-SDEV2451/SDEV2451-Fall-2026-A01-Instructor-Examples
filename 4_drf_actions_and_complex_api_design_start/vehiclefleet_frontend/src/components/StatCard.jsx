export default function StatCard({label, value, color}) {
  return <div className={`card shadow-md`}>
      <div className="card-body">
        <p className="text-sm font-medium opacity-80"></p>
        <p className="text-4xl font-bold">
           {/* <span className="loading loading-spinner loading-sm" />  */}
        </p>
      </div>
    </div>
}