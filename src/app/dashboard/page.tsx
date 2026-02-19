"use client";

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Navbar from '@/components/layout/Navbar';
import AdBanner from '@/components/features/ads/AdBanner';
// Navbar is in layout, no need here.

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: { color: '#a0a0a0' }
        },
        title: {
            display: true,
            text: 'WPM Progress (Last 7 Days)',
            color: '#fff',
            font: { size: 16 }
        },
    },
    scales: {
        y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: '#a0a0a0' }
        },
        x: {
            grid: { display: false },
            ticks: { color: '#a0a0a0' }
        }
    }
};

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const data = {
    labels,
    datasets: [
        {
            label: 'Average WPM',
            data: [45, 48, 52, 50, 55, 58, 62],
            borderColor: '#00f3ff',
            backgroundColor: 'rgba(0, 243, 255, 0.5)',
            tension: 0.4,
        },
        {
            label: 'Accuracy %',
            data: [92, 94, 93, 95, 96, 95, 98],
            borderColor: '#7b2cbf',
            backgroundColor: 'rgba(123, 44, 191, 0.5)',
            tension: 0.4,
        },
    ],
};

export default function DashboardPage() {
    return (
        <div className="container" style={{ paddingTop: '4rem', minHeight: '100vh' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Your Progress</h1>
                <p className="text-muted">Analysis of your typing journey.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3>Tests Taken</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>142</p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3>Best WPM</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>89</p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3>Avg Accuracy</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>96%</p>
                </div>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3>Typing Level</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Pro Typist</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', height: '400px', display: 'flex', justifyContent: 'center' }}>
                <Line options={options} data={data} />
            </div>

            <AdBanner />

            <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3>Weak Keys Heatmap</h3>
                    <p className="text-muted" style={{ marginTop: '1rem' }}>Based on error frequency:</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {['P', 'Q', 'Z', ';'].map(key => (
                            <span key={key} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                background: 'rgba(255, 0, 85, 0.2)',
                                border: '1px solid var(--error)',
                                borderRadius: '4px',
                                color: 'var(--error)',
                                fontWeight: 'bold'
                            }}>
                                {key}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3>Recent Activity</h3>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <li key={i} style={{
                                padding: '1rem 0',
                                borderBottom: '1px solid var(--glass-border)',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>Typing Test (60s)</span>
                                <span style={{ color: 'var(--accent-primary)' }}>6{i} WPM</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
