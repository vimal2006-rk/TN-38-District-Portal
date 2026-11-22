import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Home / முகப்பு', path: '/' },
  { label: 'Districts / மாவட்டங்கள்', path: '/districts' },
  { label: 'Membership / உறுப்பினர்', path: '/membership' },
  { label: 'News / செய்திகள்', path: '/news' },
  { label: 'Events / நிகழ்வுகள்', path: '/events' },
  { label: 'Gallery / படக்காட்சி', path: '/gallery' },
  { label: 'Contact / தொடர்பு', path: '/contact' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-white text-lg font-bold mb-1">
              TN 38 மாவட்ட போர்டல்
            </h2>
            <p className="text-orange-400 text-sm mb-4">TN 38 District Portal</p>
            <p className="text-sm leading-relaxed text-gray-400">
              Connecting all 38 districts of Tamil Nadu — bringing communities
              closer through information, events, and membership services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact Us / தொடர்பு
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-orange-400 flex-shrink-0" />
                <span className="text-gray-400">
                  Tamil Nadu, India
                  <br />
                  (Address Placeholder)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-orange-400 flex-shrink-0" />
                <span className="text-gray-400">+91 00000 00000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-orange-400 flex-shrink-0" />
                <span className="text-gray-400">info@tn38portal.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>
            &copy; {year} TN 38 District Portal / TN 38 மாவட்ட போர்டல். All
            rights reserved.
          </span>
          <span>Made with ❤️ for Tamil Nadu</span>
        </div>
      </div>
    </footer>
  );
}
