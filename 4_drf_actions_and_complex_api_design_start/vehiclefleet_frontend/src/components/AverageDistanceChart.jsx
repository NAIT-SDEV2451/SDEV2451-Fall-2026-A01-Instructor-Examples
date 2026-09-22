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

function formatWeek(isoDate) {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-CA', {
    month: "short",
    day: "2-digit"
  })
}


export default function AverageDistanceChart({
  data
}) {
  // quick guard in case there's no data.
  if (!data) {
    data = []
  }
  // reshape the data from the prop
  const chartData = data.map((item) => {
    // let's change our week with our formatted week
    return {
      week: formatWeek(item.week),
      avg_distance: item.avg_distance
    }
  })
  console.log(chartData)


  return <div className="card bg-base-100 shadow-md">
    <div className="card-body">
      <h3 className="card-title text-base">Average Trip Distance per Week</h3>
      <ResponsiveContainer width="100%" height={300}>
        {/* The x axis uses the key of "week"
        in our data and the y axis uses the key of
        "avg_distance" from our data. */}
        <BarChart
          data={chartData}
          margin={{top: 5, right: 16, left: 0, bottom: 5}}
        >
          <CartesianGrid strokeDasharray="3 3"/>

          <XAxis dataKey={"week"} tick={{ fontSize: 12}} />
          <YAxis unit=" km" width={70} tick={{ fontSize: 12}}/>

          {/* Let's make the bars */}
          <Bar
            dataKey="avg_distance"
            fill="green"
            radius={[4,4,0,0]}
          />
        </BarChart>
      </ResponsiveContainer>



    </div>

  </div>
}