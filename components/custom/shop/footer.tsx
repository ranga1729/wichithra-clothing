import Link from 'next/link'
import { Mail, Share2, Globe } from 'lucide-react'

export function KoaFooter() {
  return (
    <footer className="bg-[#101010] text-white w-full">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">KOA</h3>
            <p className="text-gray-400 mb-4">
              Premium activewear for warriors. Performance. Style. Attitude.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#3D79BE] transition">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#3D79BE] transition">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#3D79BE] transition">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/shop/activewear" className="hover:text-[#3D79BE] transition">
                  Activewear
                </Link>
              </li>
              <li>
                <Link href="/shop/casual" className="hover:text-[#3D79BE] transition">
                  Casual Wear
                </Link>
              </li>
              <li>
                <Link href="/shop/accessories" className="hover:text-[#3D79BE] transition">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/shop/sale" className="hover:text-[#3D79BE] transition">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-[#3D79BE] transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#3D79BE] transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#3D79BE] transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#3D79BE] transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/faq" className="hover:text-[#3D79BE] transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#3D79BE] transition">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#3D79BE] transition">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#3D79BE] transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mb-8 pb-8 border-b border-[#2A2A2A]">
          <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg focus:outline-none focus:border-[#3D79BE] focus:ring-1 focus:ring-[#3D79BE]"
            />
            <button className="px-6 py-2 bg-[#3D79BE] text-white rounded-lg hover:bg-[#2D5FA3] transition font-semibold">
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; 2024 KOA. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-[#3D79BE] transition">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-[#3D79BE] transition">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-[#3D79BE] transition">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
