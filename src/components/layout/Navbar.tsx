"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '../common/Button';
import styles from './Navbar.module.css';

const Navbar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const links = [
        { name: 'Typing Test', href: '/typing-test' },
        { name: 'Competition', href: '/competition' },
        { name: 'Games', href: '/games' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Leaderboard', href: '/leaderboard' },
        { name: 'Pricing', href: '/pricing' },
    ];

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.brand}>
                TYPEVERSE AI
            </Link>

            <div className={styles.links}>
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            <div className={styles.actions}>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/profile" style={{ textDecoration: 'none' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid transparent' }} className="hover:border-white">
                                {user.displayName || user.email?.split('@')[0]}
                            </span>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={logout}>
                            Log Out
                        </Button>
                    </div>
                ) : (
                    <>
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button variant="primary" size="sm">Get Started</Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
