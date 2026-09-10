// we're using object destructuring in params of a function
// to be able to get the specific keys.
export default function VehicleList({vehicles}) {
  // vehicles is going to be a list of objects.
  return (
    <div className="overflow-x-auto">
      {/* As a note we use className not class in react
      this is because it's a specific prop.
      */}
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>id</th>
            <th>make</th>
            <th>model</th>
            <th>year</th>
            <th>license_plate</th>
          </tr>
        </thead>
        <tbody>
          {/* first we're going to use static data to loop through */}
          {vehicles.map((vehicle)=> {
            // in the curly braces you're back in js
            // you're returning jsx here.
            return <tr key={vehicle.id}>
              <td>{vehicle.id}</td>
              <td>{vehicle.make}</td>
              <td>{vehicle.model}</td>
              <td>{vehicle.year}</td>
              <td>{vehicle.license_plate}</td>
            </tr>
          })}
        </tbody>
      </table>

    </div>
  )
}