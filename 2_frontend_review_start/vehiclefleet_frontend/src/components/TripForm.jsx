import { useState } from 'react'

const EMPTY_FORM = {
  vehicle: '',
  driver: '',
  start_location: '',
  end_location: '',
  start_time: '',
}

// let's talk about the technique we're using here
// vehicles and drivers normal props will be an array
// onSubmit this is goign to be a function.
export default function TripForm({
  vehicles,
  drivers,
  onSubmit
}) {
  // useState is kind of like a getter/setter on class
  const [form, setForm] = useState(EMPTY_FORM)
  // form here is that value you're going to read in this func.
  // setForm is going to update the "form" value whenever you call it.
  // EMPTY_FORM the original value of form.

  function handleChange(event) {
    console.log("handleChange")
    console.log(form)
    console.log({
      [event.target.name]: event.target.value
    })
    setForm({
      ...form, // spreading all existing values of form into the new obj
      [event.target.name]: event.target.value // i'm using the name of target and setting to the value.
    })
  }

  function submitHandler(event) {
    // stop the default event
    event.preventDefault()
    // call my prop onSubmit
    onSubmit(form)
    // pass the data that we set up last class.
  }

  return <div className="card bg-base-100 shadow-md w-full max-w-xl">
    <div className="card-body gap-5">
      <form className="flex flex-col gap-5">
        <div className="form-control w-full">
          <div className="label pb-1">
            <span className="label-text font-medium">Vehicle</span>
          </div>
          <select
            name="vehicle"
            value={form.vehicle}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="" disabled>Select a vehicle</option>
            {vehicles.map((vehicle) => {
              return <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
              </option>
            })}
          </select>
        </div>
        {/* build it for drivers! copy and change based on the above. */}
        <div className="form-control w-full">
          <div className="label pb-1">
            <span className="label-text font-medium">Driver</span>
          </div>
          <select
            name="driver"
            value={form.driver}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="" disabled>Select a driver</option>
            {drivers.map((driver) => {
              return <option key={driver.id} value={driver.id}>
                {driver.name} {driver.license_number}
              </option>
            })}
          </select>
        </div>
        <div className="divider divider-start text-xs text-base-content/50 mt-0 mb-0">Route</div>

        {/* to hook up the state to both inputs. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <div className="label pb-1">
              <span className="label-text font-medium">Start Location</span>
            </div>
            <input
              type="text"

              className="input input-bordered w-full"
              placeholder="e.g. Warehouse A"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <div className="label pb-1">
              <span className="label-text font-medium">End Location</span>
            </div>
            <input
              type="text"

              className="input input-bordered w-full"
              placeholder="e.g. Warehouse A"
              required
            />
          </div>
        </div>
        <div className="card-actions justify-end pt-2">
          <button type="submit" className="btn btn-primary">Create Trip</button>
        </div>
      </form>
    </div>
  </div>
}