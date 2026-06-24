import { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']
const STORAGE_KEY = 'nisa_portfolio'

const formatYen = (v) => `¥${Number(v).toLocaleString()}`

const empty = () => ({ name: '', category: '国内株式', buyPrice: '', currentPrice: '', quantity: '' })

const FUND_SUGGESTIONS = [
  { name: 'eMAXIS Slim 全世界株式（オール・カントリー）', category: '外国株式' },
  { name: 'eMAXIS Slim 米国株式（S&P500）', category: '外国株式' },
  { name: 'eMAXIS Slim 先進国株式インデックス', category: '外国株式' },
  { name: 'eMAXIS Slim 新興国株式インデックス', category: '外国株式' },
  { name: 'eMAXIS Slim 国内株式（TOPIX）', category: '国内株式' },
  { name: 'eMAXIS Slim 国内株式（日経平均）', category: '国内株式' },
  { name: 'eMAXIS Slim バランス（8資産均等型）', category: 'バランス型' },
  { name: 'eMAXIS Slim 先進国債券インデックス', category: '外国債券' },
  { name: 'SBI・V・S&P500インデックス・ファンド', category: '外国株式' },
  { name: 'SBI・V・全米株式インデックス・ファンド', category: '外国株式' },
  { name: 'SBI・V・全世界株式インデックス・ファンド', category: '外国株式' },
  { name: '楽天・全米株式インデックス・ファンド', category: '外国株式' },
  { name: '楽天・全世界株式インデックス・ファンド', category: '外国株式' },
  { name: '楽天・S&P500インデックス・ファンド', category: '外国株式' },
  { name: 'ニッセイ外国株式インデックスファンド', category: '外国株式' },
  { name: 'ニッセイ日経平均インデックスファンド', category: '国内株式' },
  { name: 'たわらノーロード 先進国株式', category: '外国株式' },
  { name: 'たわらノーロード 国内株式（日経225）', category: '国内株式' },
  { name: 'iFree S&P500インデックス', category: '外国株式' },
  { name: 'iFree 日経225インデックス', category: '国内株式' },
  { name: '三菱UFJ-eMAXIS Slim 国内リートインデックス', category: 'リート' },
  { name: 'eMAXIS Slim 先進国リートインデックス', category: 'リート' },
  { name: 'NEXT FUNDS 日経225連動型上場投信（1321）', category: '国内株式' },
  { name: 'iShares Core S&P 500 ETF（IVV）', category: '外国株式' },
  { name: 'Vanguard Total Stock Market ETF（VTI）', category: '外国株式' },
  { name: 'Vanguard S&P 500 ETF（VOO）', category: '外国株式' },
]

function NameInput({ value, onChange, onSelectSuggestion }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleChange = (e) => {
    const v = e.target.value
    onChange(v)
    if (v.trim().length >= 1) {
      const filtered = FUND_SUGGESTIONS.filter(f =>
        f.name.toLowerCase().includes(v.toLowerCase())
      ).slice(0, 6)
      setSuggestions(filtered)
      setOpen(filtered.length > 0)
    } else {
      setOpen(false)
    }
    setActiveIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      onSelectSuggestion(suggestions[activeIndex])
      setOpen(false)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const handleSelect = (suggestion) => {
    onSelectSuggestion(suggestion)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <input
        required
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value.trim().length >= 1 && suggestions.length > 0 && setOpen(true)}
        placeholder="例: eMAXIS Slim 全世界株式"
        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={s.name}
              onMouseDown={() => handleSelect(s)}
              className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between gap-2 ${
                i === activeIndex ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="truncate">{s.name}</span>
              <span className="text-xs text-gray-400 shrink-0 bg-gray-100 px-1.5 py-0.5 rounded-full">{s.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Portfolio() {
  const [holdings, setHoldings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
  })
  const [form, setForm] = useState(empty())
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings))
  }, [holdings])

  const calcPL = (h) => {
    const current = h.currentPrice * h.quantity
    const cost = h.buyPrice * h.quantity
    return { current, cost, pl: current - cost, rate: cost > 0 ? ((current - cost) / cost) * 100 : 0 }
  }

  const totalCurrent = holdings.reduce((s, h) => s + h.currentPrice * h.quantity, 0)
  const totalCost = holdings.reduce((s, h) => s + h.buyPrice * h.quantity, 0)
  const totalPL = totalCurrent - totalCost
  const totalRate = totalCost > 0 ? (totalPL / totalCost) * 100 : 0

  const pieData = holdings.map(h => ({
    name: h.name,
    value: Math.round(h.currentPrice * h.quantity),
  })).filter(d => d.value > 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    const entry = {
      id: editId || Date.now(),
      name: form.name,
      category: form.category,
      buyPrice: Number(form.buyPrice),
      currentPrice: Number(form.currentPrice),
      quantity: Number(form.quantity),
    }
    if (editId) {
      setHoldings(prev => prev.map(h => h.id === editId ? entry : h))
    } else {
      setHoldings(prev => [...prev, entry])
    }
    setForm(empty())
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (h) => {
    setForm({ name: h.name, category: h.category, buyPrice: String(h.buyPrice), currentPrice: String(h.currentPrice), quantity: String(h.quantity) })
    setEditId(h.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (confirm('削除しますか？')) setHoldings(prev => prev.filter(h => h.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ポートフォリオ</h2>
          <p className="text-gray-500 text-sm mt-1">保有銘柄の損益を管理します</p>
        </div>
        <button
          onClick={() => { setForm(empty()); setEditId(null); setShowForm(true) }}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          ＋ 追加
        </button>
      </div>

      {holdings.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">取得金額</p>
            <p className="text-base font-bold text-gray-800">{formatYen(Math.round(totalCost))}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">現在評価額</p>
            <p className="text-base font-bold text-emerald-700">{formatYen(Math.round(totalCurrent))}</p>
          </div>
          <div className={`rounded-2xl border shadow-sm p-4 text-center ${totalPL >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-xs mb-1 ${totalPL >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>損益</p>
            <p className={`text-base font-bold ${totalPL >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {totalPL >= 0 ? '+' : ''}{formatYen(Math.round(totalPL))}
              <span className="text-xs ml-1">({totalRate.toFixed(1)}%)</span>
            </p>
          </div>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-700 mb-2">資産配分</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatYen(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editId ? '銘柄を編集' : '銘柄を追加'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">銘柄名</label>
                <NameInput
                  value={form.name}
                  onChange={v => setForm(p => ({ ...p, name: v }))}
                  onSelectSuggestion={s => setForm(p => ({ ...p, name: s.name, category: s.category }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">カテゴリ</label>
                <select
                  value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {['国内株式', '外国株式', '国内債券', '外国債券', 'リート', 'バランス型', 'その他'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">取得単価(円)</label>
                  <input
                    required type="number" min="0" value={form.buyPrice}
                    onChange={e => setForm(p => ({ ...p, buyPrice: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">現在単価(円)</label>
                  <input
                    required type="number" min="0" value={form.currentPrice}
                    onChange={e => setForm(p => ({ ...p, currentPrice: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">口数/株数</label>
                  <input
                    required type="number" min="0" value={form.quantity}
                    onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  キャンセル
                </button>
                <button type="submit"
                  className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
                  {editId ? '更新する' : '追加する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {holdings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-4xl mb-3">💼</p>
            <p className="text-gray-500 text-sm">まだ銘柄が登録されていません</p>
            <p className="text-gray-400 text-xs mt-1">「＋ 追加」から保有銘柄を登録しましょう</p>
          </div>
        ) : (
          holdings.map(h => {
            const { current, cost, pl, rate } = calcPL(h)
            return (
              <div key={h.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{h.category}</span>
                    </div>
                    <p className="font-semibold text-gray-800 truncate">{h.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{h.quantity}口 × {formatYen(h.currentPrice)}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-bold text-gray-800">{formatYen(Math.round(current))}</p>
                    <p className={`text-sm font-medium ${pl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {pl >= 0 ? '+' : ''}{formatYen(Math.round(pl))} ({rate.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => handleEdit(h)}
                    className="flex-1 text-xs text-gray-500 hover:text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    編集
                  </button>
                  <button onClick={() => handleDelete(h.id)}
                    className="flex-1 text-xs text-red-400 hover:text-red-600 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    削除
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
