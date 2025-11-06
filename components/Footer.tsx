'use client'

export default function Footer() {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    alert('Page Under Construction')
  }

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold text-white">TempusMail</span>
            </div>
            <p className="text-sm text-gray-400">
              Free temporary email service for your privacy and security.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={handleLinkClick} className="text-sm hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" onClick={handleLinkClick} className="text-sm hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" onClick={handleLinkClick} className="text-sm hover:text-white transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={handleLinkClick} className="text-sm hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" onClick={handleLinkClick} className="text-sm hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" onClick={handleLinkClick} className="text-sm hover:text-white transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={handleLinkClick} className="text-sm hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" onClick={handleLinkClick} className="text-sm hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" onClick={handleLinkClick} className="text-sm hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} TempusMail. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

