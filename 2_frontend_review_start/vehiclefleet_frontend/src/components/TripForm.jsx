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
    setForm({
      ...form, // spreading all existing values of form into the new obj
      [event.target.name]: event.target.value // i'm using the name of target and setting to the value.
    })
  }


  return <>
  </>
}