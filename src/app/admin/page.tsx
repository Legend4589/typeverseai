"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar'; // For navigation
import Button from '@/components/common/Button';

// Mock admin check
const isAdmin = true; // In real app, check auth context and claims

export default function AdminPanel() {
    const [users, setUsers] = useState([
        { id: 1, name: 'Alice', email: 'alice@example.com', role: 'user', status: 'active' },
        { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user', status: 'banned' },
    ]);

    if (!isAdmin) {
        return <div className="container" style={{ paddingTop: '4rem' }}>Access Denied</div>;
    }

    return (
        <div className="container" style={{ paddingTop: '4rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
                <Button variant="primary">Add New Lesson</Button>
            </header>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3>User Management</h3>
                <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem 0' }}>Name</th>
                            <th style={{ padding: '1rem 0' }}>Email</th>
                            <th style={{ padding: '1rem 0' }}>Status</th>
                            <th style={{ padding: '1rem 0' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem 0' }}>{user.name}</td>
                                <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{user.email}</td>
                                <td style={{ padding: '1rem 0' }}>
                                    <span style={{
                                        color: user.status === 'active' ? 'var(--success)' : 'var(--error)',
                                        fontWeight: 'bold'
                                    }}>
                                        {user.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 0' }}>
                                    <Button size="sm" variant="ghost" style={{ color: 'var(--error)' }}>Ban</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3>Platform Revenue</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '1rem' }}>
                    <div>
                        <span className="text-muted">Total Users</span>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>1,234</p>
                    </div>
                    <div>
                        <span className="text-muted">Pro Subscribers</span>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>89</p>
                    </div>
                    <div>
                        <span className="text-muted">Monthly Revenue</span>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>$4,450</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
