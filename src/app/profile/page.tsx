"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import { User, Trophy, Medal, Award, Settings, Edit2 } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        displayName: user?.displayName || '',
        bio: 'Typing enthusiast on the road to 100 WPM.',
        country: 'Global',
        keyboard: 'Standard',
        website: ''
    });

    useEffect(() => {
        if (user?.email) {
            fetch(`/api/user?email=${user.email}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        setProfile(prev => ({ ...prev, ...data.data }));
                    }
                })
                .catch(err => console.error(err));
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    ...profile,
                    image: user?.photoURL
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsEditing(false);
                // Optionally show a toast here
            } else {
                alert('Failed to save profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error saving profile');
        }
    };

    if (!user) {
        return <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>Please log in to view your profile.</div>;
    }

    return (
        <div className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                {/* Left Column: User Card */}
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', height: 'fit-content' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        margin: '0 auto 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: '#fff'
                    }}>
                        {user.photoURL ? <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : (profile.displayName[0] || 'U')}
                    </div>

                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{profile.displayName}</h2>
                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Level 42 &bull; Grandmaster</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="glass-panel" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)' }}>
                            <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold' }}>142</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Best WPM</span>
                        </div>
                        <div className="glass-panel" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)' }}>
                            <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold' }}>98%</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy</span>
                        </div>
                    </div>

                    {!isEditing && (
                        <Button variant="outline" style={{ width: '100%' }} onClick={() => setIsEditing(true)}>
                            <Edit2 size={16} style={{ marginRight: '0.5rem' }} /> Edit Profile
                        </Button>
                    )}
                </div>

                {/* Right Column: Details & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Profile Details or Edit Form */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={24} /> About
                            </h3>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Display Name</label>
                                    <input
                                        type="text"
                                        value={profile.displayName}
                                        onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Bio</label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                        rows={3}
                                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Keyboard</label>
                                    <input
                                        type="text"
                                        value={profile.keyboard}
                                        onChange={e => setProfile({ ...profile, keyboard: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <Button type="submit" variant="primary">Save Changes</Button>
                                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>{profile.bio}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Keyboard</span>
                                        <p>{profile.keyboard}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Location</span>
                                        <p>{profile.country}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Achievements */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Trophy size={24} color="var(--warning)" /> Achievements
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {[
                                { name: 'Speed Demon', icon: <Trophy size={20} />, color: '#ffaa00' },
                                { name: 'Consistent', icon: <Medal size={20} />, color: '#00f3ff' },
                                { name: 'Early Bird', icon: <Award size={20} />, color: '#7b2cbf' },
                            ].map((badge) => (
                                <div key={badge.name} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${badge.color}`,
                                    borderRadius: '100px',
                                    color: badge.color
                                }}>
                                    {badge.icon}
                                    <span>{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Account Settings Placeholder */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Settings size={24} /> Settings (Coming Soon)
                        </h3>
                        <p className="text-muted">Manage your subscription, change password, and privacy settings.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
