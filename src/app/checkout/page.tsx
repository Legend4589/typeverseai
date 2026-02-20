import React, { Suspense } from 'react';
import CheckoutForm from './CheckoutForm';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>Loading checkout...</div>}>
            <CheckoutForm />
        </Suspense>
    );
}
