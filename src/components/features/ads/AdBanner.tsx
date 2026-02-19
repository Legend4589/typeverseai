"use client";

import React, { useEffect } from 'react';

interface AdBannerProps {
    layout?: 'horizontal' | 'vertical';
    slotId?: string;
    className?: string;
}

export default function AdBanner({ layout = 'horizontal', slotId, className }: AdBannerProps) {
    useEffect(() => {
        // Only run this in production with a real ad client ID
        // try {
        //   (window.adsbygoogle = (window as any).adsbygoogle || []).push({});
        // } catch (err) {
        //   console.error("AdSense error:", err);
        // }
    }, []);

    return (
        <div
            className={`ad-container ${className}`}
            style={{
                margin: '2rem auto',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px dashed var(--text-muted)',
                borderRadius: '8px',
                maxWidth: layout === 'horizontal' ? '728px' : '300px',
                width: '100%',
                height: layout === 'horizontal' ? '90px' : '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}
        >
            <span>Advertisement Space (Google AdSense)</span>

            {/* Production Code Example: */}
            {/* 
      <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-YOUR_CLIENT_ID"
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-ad-full-width-responsive="true"></ins>
      */}
        </div>
    );
}
