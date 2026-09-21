import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';


export default function AverageDistanceChart({
  data
}) {
  // reshape the data from the prop
  const chartData = data.map((item) => {
    return item
  })


  return <div className="card bg-base-100 shadow-md">
    <div className="card-body">
      <h3 className="card-title text-base">Average Trip Distance per Week</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={[]}
          margin={{top: 5, right: 16, left: 0, bottom: 5}}
        >
          <CartesianGrid />

        </BarChart>
      </ResponsiveContainer>



    </div>

  </div>
}