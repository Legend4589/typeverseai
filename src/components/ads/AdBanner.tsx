"use client";

import React, { useEffect } from 'react';

interface AdBannerProps {
    slot: string;
    style?: React.CSSProperties;
    format?: 'auto' | 'fluid' | 'rectangle';
}

const AdBanner: React.FC<AdBannerProps> = ({ slot, style, format = 'auto' }) => {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', margin: '1rem 0', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-9489303278308026"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
            <div style={{ fontSize: '0.7rem', color: '#444', marginTop: '0.2rem' }}>ADVERTISEMENT</div>
        </div>
    );
};

export default AdBanner;
