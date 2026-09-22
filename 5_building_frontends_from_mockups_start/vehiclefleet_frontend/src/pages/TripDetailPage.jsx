// let's get the first trip from the mockdata
import { TRIPS } from "../mockData";


export default function TripDetailPage() {
  // let's select the first one
  const trip = TRIPS[0]
  console.log(trip)
  return <>
    {/* <div className="flex flex-col gap-6"> */}
      <h1>trip</h1>
    {/* </div> */}
  </>
}