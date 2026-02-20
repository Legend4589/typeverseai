import React from 'react';

interface AdBannerProps {
    slot: string; // AdSense slot ID
    format?: 'auto' | 'fluid' | 'rectangle';
    style?: React.CSSProperties;
}

const AdBanner: React.FC<AdBannerProps> = ({ slot, format = 'auto', style }) => {
    return (
        <div className="ad-banner-container" style={{
            width: '100%',
            minHeight: '100px',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed rgba(255,255,255,0.2)',
            margin: '2rem 0',
            ...style
        }}>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Ad Space (Slot: {slot})</span>
            {/* Google AdSense Script would go here */}
            {/* <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                 data-ad-slot={slot}
                 data-ad-format={format}
                 data-full-width-responsive="true"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({});
            </script> */}
        </div>
    );
};

export default AdBanner;
