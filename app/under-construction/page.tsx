export default function UnderConstruction() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">
          Page Under Construction
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This page is currently being built. Please check back later.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  )
}

