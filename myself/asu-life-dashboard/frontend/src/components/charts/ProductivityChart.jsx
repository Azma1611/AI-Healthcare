import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser } from '../../context/UserContext';

const CustomTooltip = ({ active, payload, label }) => {
  const { themeStyles } = useUser();
  if (active && payload && payload.length) {
    return (
      <div className={`rounded-xl p-3 text-sm shadow-lg ${themeStyles.card}`}>
        <p className="font-bold text-gray-800 dark:text-white mb-1">{`${label}`}</p>
        <p style={{ color: payload[0].color }} className="font-medium">{`Asu: ${payload[0].value}%`}</p>
        <p style={{ color: payload[1].color }} className="font-medium">{`Yaso: ${payload[1].value}%`}</p>
      </div>
    );
  }
  return null;
};

export const ProductivityChart = () => {
  const { analyticsData, themeStyles } = useUser();
  const { productivityData } = analyticsData;
  const { chart } = themeStyles;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={productivityData}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
        <XAxis dataKey="day" tick={{ fill: chart.tick, fontSize: 12 }} tickLine={false} axisLine={{ stroke: chart.grid }} />
        <YAxis tick={{ fill: chart.tick, fontSize: 12 }} tickLine={false} axisLine={{ stroke: chart.grid }} unit="%" />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: chart.line1, strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
          formatter={(value) => <span className="text-gray-700 dark:text-gray-300 capitalize">{value}</span>}
        />
        <Line
          type="monotone"
          dataKey="asu"
          stroke={chart.line1}
          strokeWidth={2.5}
          dot={{ r: 4, fill: chart.line1, stroke: 'none' }}
          activeDot={{ r: 8, stroke: 'white', strokeWidth: 2, fill: chart.line1 }}
        />
        <Line
          type="monotone"
          dataKey="yaso"
          stroke={chart.line2}
          strokeWidth={2.5}
          dot={{ r: 4, fill: chart.line2, stroke: 'none' }}
          activeDot={{ r: 8, stroke: 'white', strokeWidth: 2, fill: chart.line2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
