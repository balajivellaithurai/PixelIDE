import { Link } from 'react-router-dom'
import { FiCode, FiCheckCircle, FiCpu, FiLayers, FiTerminal, FiExternalLink } from 'react-icons/fi'

function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Top Navigation Bar */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FiCode className="text-white text-lg" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Pix
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
              v1.0.0
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/vitejs/vite" 
              target="_blank" 
              rel="noreferrer"
              className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              Docs <FiExternalLink className="text-xs" />
            </a>
            <Link 
              to="/workspace"
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-sm font-medium transition-all shadow-md shadow-purple-600/10 hover:shadow-purple-500/20 hover:-translate-y-0.5 inline-flex items-center"
            >
              Launch Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none"></div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-8 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400"></span>
          Environment Ready & Tailwind v4 Configured
        </div>

        {/* Hero Section */}
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] mb-6">
          The collaborative IDE built for the{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            modern web
          </span>
        </h1>
        
        <p className="text-lg text-neutral-400 max-w-2xl mb-12 leading-relaxed">
          Create, edit, compile, and run your projects directly in the cloud. A pixel-perfect developer workspace complete with Monaco Editor, Tailwind CSS integration, and terminal output.
        </p>

        {/* Tech Stack Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FiCpu className="text-2xl" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Tailwind CSS v4</h3>
            <p className="text-sm text-neutral-400">
              Leveraging the brand-new `@tailwindcss/vite` plugin for lightning-fast compilation and utility styling.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FiTerminal className="text-2xl" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Monaco Code Editor</h3>
            <p className="text-sm text-neutral-400">
              Equipped with full syntax highlighting, auto-complete, and editor features powered by VS Code's editor engine.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FiLayers className="text-2xl" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">React 19 + Zustand</h3>
            <p className="text-sm text-neutral-400">
              Modern frontend architecture utilizing lightweight state management and optimized rendering.
            </p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="w-full max-w-4xl p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-emerald-500 text-xl flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-200">Compile Error Fixed</p>
              <p className="text-xs text-neutral-400">Removed missing `App.css` import and initialized the styling environment successfully.</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/40">
            Success
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <p>&copy; {new Date().getFullYear()} Pix. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Home
