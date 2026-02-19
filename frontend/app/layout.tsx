
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'OpenConnect - Build Your Future',
    description: 'Connecting innovators with opportunities. Social platform for developers and creators.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
                        <Header />
                        <main className="flex-1 w-full relative">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
