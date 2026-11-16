import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext.tsx';

export function Footer() {
  const { t } = useAppContext();

  return (
    <footer className="bg-[#2C1E16] text-[#F5EFE0] border-t border-[#4E3B31] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Link to="/" className="font-display text-xl font-bold text-[#FFF8E7] leading-snug block">
            CHEGOLAND Agri-Empire LTD Dairy Farm and Shop
          </Link>
          <p className="mt-3 text-sm text-[#D7CCC8] leading-relaxed max-w-sm">
            {t.footer.tagline}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#FFF8E7] mb-4">{t.footer.quickLinks}</h3>
          <ul className="space-y-2.5 text-sm text-[#D7CCC8]">
            <li>
              <Link to="/shop" className="hover:text-white transition-colors">
                {t.nav.shop}
              </Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-white transition-colors">
                {t.nav.track}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                {t.nav.about}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                {t.nav.contact}
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-white transition-colors">
                {t.adminPortal}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3 text-sm text-[#D7CCC8]">
          <h3 className="text-sm font-semibold text-[#FFF8E7] mb-4">{t.footer.contactTitle}</h3>
          <p className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#81C784] shrink-0 mt-0.5" aria-hidden="true" />
            <span>Kapcholyo, Kaplong, Sotik Constituency · Bomet County</span>
          </p>
          <p className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-[#81C784] shrink-0" aria-hidden="true" />
            <a href="tel:+254712345678" className="hover:text-white tabular-nums">
              +254 712 345 678
            </a>
          </p>
          <p className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#81C784] shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t.footer.hoursDesc}</span>
          </p>
        </div>
      </div>

      <div className="border-t border-[#4E3B31]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#BCAAA4]">
          <p>© {new Date().getFullYear()} {t.footer.rights}</p>
          <p>M-Pesa Paybill Ready · Fresh Cold-Chain Delivery</p>
        </div>
      </div>
    </footer>
  );
}
