"use client";

import React from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { Check, X } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '$0',
        frequency: 'Forever',
        features: [
            'Basic typing lessons',
            'Limited daily tests',
            'Simple analytics',
            'Global Leaderboard Access',
            'Standard themes'
        ],
        notIncluded: [
            'Advanced AI coaching',
            'Unlimited tests',
            'Pro themes',
            'Ad-free experience'
        ],
        cta: 'Start Free'
    },
    {
        name: 'Pro',
        price: '$9',
        frequency: '/month',
        recommended: true,
        features: [
            'Everything in Free',
            'Unlimited typing tests',
            'AI Personal Coach',
            'Advanced weak-key analysis',
            'Multiplayer tournaments',
            'Exclusive neon themes',
            'No ads'
        ],
        notIncluded: [],
        cta: 'Go Pro'
    },
    {
        name: 'Team',
        price: '$49',
        frequency: '/month',
        features: [
            'Everything in Pro',
            'Up to 10 members',
            'Team analytics dashboard',
            'Custom tournaments',
            'Admin management',
            'Priority support'
        ],
        notIncluded: [],
        cta: 'Contact Sales'
    }
];

export default function PricingPage() {
    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800 }}>
                    Unleash Your Potential
                </h1>
                <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Choose the plan that fits your ambition. Whether you're a student or a professional, we have the tools to make you faster.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className="glass-panel"
                        style={{
                            padding: '2.5rem',
                            position: 'relative',
                            border: plan.recommended ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                            transform: plan.recommended ? 'scale(1.05)' : 'none',
                            boxShadow: plan.recommended ? '0 0 30px rgba(0, 243, 255, 0.2)' : 'none'
                        }}
                    >
                        {plan.recommended && (
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'var(--accent-gradient)',
                                padding: '0.25rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                color: '#fff'
                            }}>
                                MOST POPULAR
                            </div>
                        )}

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2rem' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800 }}>{plan.price}</span>
                            <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>{plan.frequency}</span>
                        </div>

                        <div style={{ height: '1px', background: 'var(--glass-border)', marginBottom: '2rem' }} />

                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {plan.features.map((feature, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ color: 'var(--success)', display: 'flex' }}><Check size={18} /></span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                            {plan.notIncluded.map((feature, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.5 }}>
                                    <span style={{ color: 'var(--text-muted)', display: 'flex' }}><X size={18} /></span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href={`/checkout?plan=${plan.name}`} style={{ textDecoration: 'none' }}>
                            <Button variant={plan.recommended ? 'primary' : 'outline'} size="lg" style={{ width: '100%' }}>
                                {plan.cta}
                            </Button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
