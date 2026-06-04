import React from 'react'
import { useUser } from '../context/UserContext'
import Card from '../components/Card'

export default function Money() {
  const { currentUser, activeUser } = useUser()
  const isAsu = activeUser === 'asu'

  return (
    <div className="space-y-6 pr-4">
      {/* Main Stats */}
      <Card title={isAsu ? 'Savings Dashboard' : 'Income & Savings'} icon="💰">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg">
            <p className="text-xs uppercase text-slate-400 mb-2">{isAsu ? 'Saved' : 'Total Earnings'}</p>
            <p className="text-3xl font-bold">${currentUser.stats.savings}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
            <p className="text-xs uppercase text-slate-400 mb-2">{isAsu ? 'Monthly Goal' : 'This Month'}</p>
            <p className="text-3xl font-bold">${isAsu ? 2200 : 3200}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Tracker */}
        <Card title="Recent Expenses" icon="📊">
          <ul className="space-y-3">
            {currentUser.dashboard.expenses.map((expense, idx) => (
              <li key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded">
                <div>
                  <p className="font-semibold">{expense.category}</p>
                  <p className="text-xs text-slate-400">{expense.date}</p>
                </div>
                <p className="font-bold text-pink-300">-${expense.amount}</p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Savings Goals */}
        <Card title={isAsu ? 'Savings Goals' : 'Financial Goals'} icon="🎯">
          <ul className="space-y-3">
            <li className="p-3 bg-white/5 rounded">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{isAsu ? 'Study Fund' : 'Bike Savings'}</span>
                <span className="text-sm text-pink-300">62%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full">
                <div className="h-2 bg-pink-500 rounded-full" style={{ width: '62%' }} />
              </div>
            </li>
            <li className="p-3 bg-white/5 rounded">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{isAsu ? 'Future' : 'Emergency Fund'}</span>
                <span className="text-sm text-purple-300">32%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full">
                <div className="h-2 bg-purple-500 rounded-full" style={{ width: '32%' }} />
              </div>
            </li>
          </ul>
        </Card>
      </div>

      {/* Spending Tips */}
      <Card title="Money Tips" icon="💡">
        <div className="space-y-3">
          <div className="p-3 bg-white/5 rounded">
            <p className="font-semibold mb-1">💪 Today's Challenge</p>
            <p className="text-sm text-slate-300">{isAsu ? 'Skip one unnecessary purchase' : 'Save 5% of daily earnings'}</p>
          </div>
          <div className="p-3 bg-white/5 rounded">
            <p className="font-semibold mb-1">✅ Stay Focused</p>
            <p className="text-sm text-slate-300">{isAsu ? 'Save for your future' : 'Track every transaction'}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
