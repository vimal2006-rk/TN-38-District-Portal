import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const QUICK_LINKS = [
  { label: 'Home / முகப்பு', path: '/' },
  { label: 'Districts / மாவட்டங்கள்', path: '/districts' },
  { label: 'Membership / உறுப்பினர்', path: '/membership' },
  { label: 'News / செய்திகள்', path: '/news' },
  { label: 'Events / நிகழ்வுகள்', path: '/events' },
  { label: 'Gallery / படக்காட்சி', path: '/gallery' },
  { label: 'Contact / தொடர்பு', path: '/contact' },
  { label: 'Terms & Conditions / விதிமுறைகள்', path: '/terms' },
];

function Footer() {
  return (
    <footer style={{ backgroundColor: '#09246B' }} className="text-blue-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.jpg"
                alt="TMSSA Logo"
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-14 w-14 rounded-full object-cover border-2 border-[#F07818] shadow-lg flex-shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h2 className="text-white text-base font-bold leading-tight">
                  தமிழ்நாடு மொபைல் சேல்ஸ் அண்டு சர்வீஸ் அசோசியேஷன்
                </h2>
                <p style={{ color: '#F07818' }} className="text-xs font-medium">Tamilnadu Mobile Sales and Service Association</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-blue-300">
              தமிழ்நாட்டின் அனைத்து மாவட்ட மொபைல் விற்பனையாளர்கள் மற்றும் சேவை மையங்களை ஒருங்கிணைக்கும் தலைமை தளம்.
            </p>
            <p className="text-xs text-blue-400 mt-2">
              Tamilnadu Mobile Sales and Service Association
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ color: '#F07818' }} className="font-bold mb-4 text-sm uppercase tracking-wider">
              Quick Links / விரைவு இணைப்புகள்
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-blue-200 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: '#F07818' }} className="font-bold mb-4 text-sm uppercase tracking-wider">
              Contact Us / தொடர்பு
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} style={{ color: '#F07818' }} className="mt-0.5 flex-shrink-0" />
                <span className="text-blue-300">
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} style={{ color: '#F07818' }} className="flex-shrink-0" />
                <a href="tel:+919944773668" className="text-blue-300 hover:text-white transition-colors font-medium">
                  +91 99447 73668
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} style={{ color: '#F07818' }} className="flex-shrink-0" />
                <span className="text-blue-300">info@tnmssa.com</span>
              </li>
            </ul>

            {/* WhatsApp CTA */}
            <Link
              to="/whatsapp-groups"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#16A34A' }}
            >
              <ExternalLink size={14} />
              Join WhatsApp Groups
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-400"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <span>
            © {CURRENT_YEAR} தமிழ்நாடு மொபைல் சேல்ஸ் அண்டு சர்வீஸ் அசோசியேஷன் / Tamilnadu Mobile Sales and Service Association. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-blue-200 hover:text-white underline font-semibold">
              Terms &amp; Conditions
            </Link>
            <span className="flex items-center gap-1">
              Made with <span className="text-red-400">❤</span> for Tamil Nadu
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
