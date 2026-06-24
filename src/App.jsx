import { Routes, Route, NavLink } from 'react-router-dom'
import Simulator from './pages/Simulator'
import Portfolio from './pages/Portfolio'
import GoalChecker from './pages/GoalChecker'

export default function App() {
  const navItems = [
    { to: '/', label: '積立シミュレーター', icon: '📈' },
    { to: '/portfolio', label: 'ポートフォリオ', icon: '💼' },
    { to: '/goal', label: '目標チェッカー', icon: '🎯' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center py-4">
            <h1 className="text-xl font-bold text-emerald-600 tracking-tight">NISA管理</h1>
          </div>
          <nav className="flex gap-1 pb-2 overflow-x-auto">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<Simulator />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/goal" element={<GoalChecker />} />
        </Routes>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
        ※ 投資は自己責任です。このアプリの計算は参考値です。
      </footer>
    </div>
  )
}
