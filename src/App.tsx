import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary-700 dark:text-primary-400 mb-4">
            CreatorMetrics
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Analytics & Attribution Platform
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Welcome to Your MVP Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This is a starter template for your Creator analytics and attribution platform.
          </p>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Increment counter"
            >
              Count is {count}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click the button to test interactivity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
              📊 Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track creator performance metrics
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
              🔗 Attribution
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Connect content to conversions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
              📈 Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Data-driven recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
