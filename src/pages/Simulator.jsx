import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const formatYen = (v) => `¥${v.toLocaleString()}`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}年後</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}：{formatYen(Math.round(p.value))}
        </p>
      ))}
    </div>
  )
}

export default function Simulator() {
  const [monthly, setMonthly] = useState(33333)
  const [years, setYears] = useState(20)
  const [rate, setRate] = useState(5)

  const data = useMemo(() => {
    const r = rate / 100 / 12
    const result = []
    for (let y = 1; y <= years; y++) {
      const n = y * 12
      const total = monthly * n
      const asset = r === 0
        ? total
        : monthly * ((Math.pow(1 + r, n) - 1) / r)
      result.push({
        year: y,
        元本: Math.round(total),
        運用益込み: Math.round(asset),
      })
    }
    return result
  }, [monthly, years, rate])

  const final = data[data.length - 1]
  const profit = final ? final['運用益込み'] - final['元本'] : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">積立シミュレーター</h2>
        <p className="text-gray-500 text-sm mt-1">毎月いくら積み立てると何年後にいくらになるか確認できます</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            毎月の積立額
            <span className="ml-2 text-emerald-600 font-bold text-base">{formatYen(monthly)}</span>
          </label>
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => setMonthly(v => Math.max(1000, v - 1000))}
              className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200 transition-colors shrink-0"
            >－</button>
            <input
              type="range" min={1000} max={500000} step={1000}
              value={monthly}
              onChange={e => setMonthly(Number(e.target.value))}
              className="flex-1 accent-emerald-500"
            />
            <button
              type="button"
              onClick={() => setMonthly(v => Math.min(500000, v + 1000))}
              className="w-9 h-9 rounded-xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-colors shrink-0"
            >＋</button>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>¥1,000</span><span>¥500,000</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            積立期間
            <span className="ml-2 text-emerald-600 font-bold text-base">{years}年</span>
          </label>
          <input
            type="range" min={1} max={40} step={1}
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1年</span><span>40年</span>
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

      {final && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">投資元本</p>
            <p className="text-lg font-bold text-gray-800">{formatYen(final['元本'])}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-4 text-center">
            <p className="text-xs text-emerald-600 mb-1">最終資産</p>
            <p className="text-lg font-bold text-emerald-700">{formatYen(final['運用益込み'])}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm p-4 text-center">
            <p className="text-xs text-blue-600 mb-1">運用益</p>
            <p className="text-lg font-bold text-blue-700">{formatYen(profit)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-medium text-gray-700 mb-4">資産推移グラフ</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorAsset" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tickFormatter={v => `${v}年`} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `${(v / 10000).toFixed(0)}万`} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="元本" stroke="#6366f1" fill="url(#colorBase)" strokeWidth={2} />
            <Area type="monotone" dataKey="運用益込み" stroke="#10b981" fill="url(#colorAsset)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
