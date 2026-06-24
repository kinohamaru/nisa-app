import { useState, useMemo } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'

const formatYen = (v) => `¥${Math.round(v).toLocaleString()}`

export default function GoalChecker() {
  const [goal, setGoal] = useState(10000000)
  const [current, setCurrent] = useState(500000)
  const [monthly, setMonthly] = useState(33333)
  const [rate, setRate] = useState(5)

  const result = useMemo(() => {
    const remaining = Math.max(goal - current, 0)
    const progress = Math.min((current / goal) * 100, 100)

    if (remaining === 0) return { months: 0, years: 0, remaining: 0, progress: 100, monthlyNeeded: 0 }

    const r = rate / 100 / 12
    let months = 0

    if (r === 0) {
      months = Math.ceil(remaining / monthly)
    } else {
      // 複利計算で何ヶ月かかるか
      // FV = current * (1+r)^n + monthly * ((1+r)^n - 1) / r = goal
      // 数値的に解く
      let asset = current
      while (asset < goal && months < 12000) {
        asset = asset * (1 + r) + monthly
        months++
      }
      if (months >= 12000) months = -1
    }

    // 目標達成に必要な月額（10年で達成するには？）
    const targetMonths = 10 * 12
    let monthlyNeeded = 0
    if (r === 0) {
      monthlyNeeded = remaining / targetMonths
    } else {
      monthlyNeeded = remaining * r / (Math.pow(1 + r, targetMonths) - 1)
    }

    return {
      months,
      years: months >= 0 ? months / 12 : -1,
      remaining,
      progress,
      monthlyNeeded: Math.ceil(monthlyNeeded),
    }
  }, [goal, current, monthly, rate])

  const progressColor = result.progress >= 80 ? '#10b981' : result.progress >= 50 ? '#f59e0b' : '#6366f1'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">目標達成チェッカー</h2>
        <p className="text-gray-500 text-sm mt-1">目標金額まであといくら・何年かかるか確認できます</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            目標金額
            <span className="ml-2 text-emerald-600 font-bold text-base">{formatYen(goal)}</span>
          </label>
          <input
            type="range" min={100000} max={50000000} step={100000}
            value={goal}
            onChange={e => setGoal(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10万</span><span>5,000万</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            現在の資産
            <span className="ml-2 text-emerald-600 font-bold text-base">{formatYen(current)}</span>
          </label>
          <input
            type="range" min={0} max={goal} step={10000}
            value={current}
            onChange={e => setCurrent(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>¥0</span><span>{formatYen(goal)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            毎月の積立額
            <span className="ml-2 text-emerald-600 font-bold text-base">{formatYen(monthly)}</span>
          </label>
          <input
            type="range" min={1000} max={100000} step={1000}
            value={monthly}
            onChange={e => setMonthly(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>¥1,000</span><span>¥100,000</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年利（想定）
            <span className="ml-2 text-emerald-600 font-bold text-base">{rate}%</span>
          </label>
          <input
            type="range" min={0} max={15} step={0.5}
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span><span>15%</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-medium text-gray-700 mb-4 text-center">達成率</p>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="70%" outerRadius="90%"
                startAngle={90} endAngle={-270}
                data={[{ value: result.progress, fill: progressColor }]}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: progressColor }}>
                {result.progress.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">達成</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">残り金額</p>
          <p className="text-base font-bold text-gray-800">{formatYen(result.remaining)}</p>
        </div>
        <div className={`rounded-2xl border shadow-sm p-4 text-center ${result.years > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
          <p className="text-xs text-emerald-600 mb-1">達成まで</p>
          {result.progress >= 100 ? (
            <p className="text-base font-bold text-emerald-700">達成済み 🎉</p>
          ) : result.years < 0 ? (
            <p className="text-base font-bold text-gray-500">計算不能</p>
          ) : (
            <p className="text-base font-bold text-emerald-700">
              約{result.years.toFixed(1)}年
              <span className="text-xs text-gray-400 ml-1">({result.months}ヶ月)</span>
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-blue-800 mb-1">💡 10年で達成するには？</p>
        <p className="text-sm text-blue-700">
          毎月 <span className="font-bold text-lg">{formatYen(result.monthlyNeeded)}</span> の積立が必要です
        </p>
        {result.monthlyNeeded > monthly && (
          <p className="text-xs text-blue-500 mt-1">
            現在の積立額より 毎月 {formatYen(result.monthlyNeeded - monthly)} 多く必要です
          </p>
        )}
        {result.monthlyNeeded <= monthly && result.progress < 100 && (
          <p className="text-xs text-emerald-600 mt-1">
            現在の積立ペースなら10年以内に達成できます ✓
          </p>
        )}
      </div>
    </div>
  )
}
