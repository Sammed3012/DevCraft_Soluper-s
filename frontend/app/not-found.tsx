
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] p-4 text-center">
            <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-slate-700 mb-2">Page Not Found</h2>
            <p className="text-slate-500 mb-8 max-w-md">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link href="/" className="btn-primary">
                Go Home
            </Link>
        </div>
    );
}
