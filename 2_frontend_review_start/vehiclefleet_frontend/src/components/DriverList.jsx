
export default function DriverList({drivers}) {

  return (
    <div className="overflow-x-auto">
      {/* As a note we use className not class in react
      this is because it's a specific prop.
      */}
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>license number</th>
            <th>phone</th>
            <th>email</th>
          </tr>
        </thead>
        <tbody>
          {/* first we're going to use static data to loop through */}
          {drivers.map((driver)=> {


            return <tr key={driver.id}>
              <td>{driver.id}</td>
              <td>{driver.name}</td>
              <td>{driver.license_number}</td>
              <td>{driver.phone}</td>
              <td>{driver.email}</td>
            </tr>
          })}
        </tbody>
      </table>

    </div>
  )
}