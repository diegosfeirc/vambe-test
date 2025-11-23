'use client';

import Link from 'next/link';
import { BarChart3, Users, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import styles from './styles.module.css';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.header}>
          {/* Logo / Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logoLink} onClick={closeMobileMenu}>
              <div className={styles.logoIcon}>
                <span className={styles.logoText}>V</span>
              </div>
              <span className={styles.brandName}>Vambe Meetings</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className={styles.navLinks}>
            <Link href="/dashboard" className={styles.navLink}>
              <BarChart3 className={styles.navLinkIcon} />
              <span className={styles.navLinkText}>Dashboard</span>
            </Link>

            <Link href="/leads" className={styles.navLink}>
              <Users className={styles.navLinkIcon} />
              <span className={styles.navLinkText}>Leads</span>
            </Link>

            <Link href="/close-rate" className={styles.navLink}>
              <TrendingUp className={styles.navLinkIcon} />
              <span className={styles.navLinkText}>Rendimiento</span>
            </Link>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className={styles.menuIcon} />
            ) : (
              <svg className={styles.menuIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/dashboard" className={styles.mobileNavLink} onClick={closeMobileMenu}>
              <BarChart3 className={styles.mobileNavLinkIcon} />
              <span className={styles.mobileNavLinkText}>Dashboard</span>
            </Link>

            <Link href="/leads" className={styles.mobileNavLink} onClick={closeMobileMenu}>
              <Users className={styles.mobileNavLinkIcon} />
              <span className={styles.mobileNavLinkText}>Leads</span>
            </Link>

            <Link href="/close-rate" className={styles.mobileNavLink} onClick={closeMobileMenu}>
              <TrendingUp className={styles.mobileNavLinkIcon} />
              <span className={styles.mobileNavLinkText}>Rendimiento</span>
            </Link>

            <div className={styles.mobileThemeToggle}>
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
