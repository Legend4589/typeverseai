import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // Mock auth check: in production verify session cookie or token
    // const token = request.cookies.get('token');

    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Check if user is admin
        // return NextResponse.redirect(new URL('/login', request.url));
    }

    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        // Check if user is logged in
        // return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
};
