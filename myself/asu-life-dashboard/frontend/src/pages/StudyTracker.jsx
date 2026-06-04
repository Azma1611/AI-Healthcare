import React from 'react'
import { useUser } from '../context/UserContext'
import Card from '../components/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function StudyTracker() {
  const { currentUser, activeUser } = useUser()
  const isAsu = activeUser === 'asu'

  const chartData = isAsu
    ? [
        { day: 'Mon', hours: 3 },
        { day: 'Tue', hours: 4 },
        { day: 'Wed', hours: 5 },
        { day: 'Thu', hours: 4 },
        { day: 'Fri', hours: 6 },
        { day: 'Sat', hours: 2 },
        { day: 'Sun', hours: 1 },
      ]
    : [
        { day: 'Mon', income: 142 },
        { day: 'Tue', income: 138 },
        { day: 'Wed', income: 145 },
        { day: 'Thu', income: 150 },
        { day: 'Fri', income: 158 },
        { day: 'Sat', income: 120 },
        { day: 'Sun', income: 128 },
      ]

  return (
    <div className="space-y-6 pr-4">
      <Card title={isAsu ? 'Study Flow' : 'Daily Income Tracker'} icon={isAsu ? '📚' : '💵'}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              />
              <Line
                type="monotone"
                dataKey={isAsu ? 'hours' : 'income'}
                stroke={isAsu ? '#f472b6' : '#60a5fa'}
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title={isAsu ? 'Semester Info' : 'Weekly Earnings'} icon={isAsu ? '🎓' : '📅'}>
          {isAsu ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Semester:</span>
                <span className="font-semibold">3rd Year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Credits:</span>
                <span className="font-semibold">18/24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subjects:</span>
                <span className="font-semibold">6</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">This Week:</span>
                <span className="font-semibold text-green-400">$980</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Week:</span>
                <span className="font-semibold">$950</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Average/Day:</span>
                <span className="font-semibold">$140</span>
              </div>
            </div>
          )}
        </Card>

        <Card title={isAsu ? 'Top Subjects' : 'Monthly Earnings'} icon={isAsu ? '⭐' : '💸'}>
          {isAsu ? (
            <ul className="space-y-2">
              <li className="flex justify-between p-2 bg-white/5 rounded">
                <span>AI & Robotics</span>
                <span className="text-pink-300">12 hrs</span>
              </li>
              <li className="flex justify-between p-2 bg-white/5 rounded">
                <span>Algorithms</span>
                <span className="text-purple-300">9 hrs</span>
              </li>
              <li className="flex justify-between p-2 bg-white/5 rounded">
                <span>Web Dev</span>
                <span className="text-blue-300">7 hrs</span>
              </li>
            </ul>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">This Month:</span>
                <span className="font-semibold text-green-400">$3,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Month:</span>
                <span className="font-semibold">$3,100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Growth:</span>
                <span className="font-semibold text-green-300">+3.2%</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
