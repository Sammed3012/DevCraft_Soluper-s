
'use client';

import Link from 'next/link';
import { Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-slate-200 bg-slate-50 py-12 mt-auto">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-1">
                    <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
                            <span className="font-bold text-sm">OC</span>
                        </div>
                        OpenConnect
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        Connecting innovators with opportunities. Showcase your skills, build your portfolio, and grow your career.
                    </p>
                    <div className="flex space-x-3">
                        <Link href="#" className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm hover:shadow-md">
                            <Twitter size={18} />
                        </Link>
                        <Link href="#" className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm hover:shadow-md">
                            <Github size={18} />
                        </Link>
                        <Link href="#" className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-blue-700 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                            <Linkedin size={18} />
                        </Link>
                    </div>
                </div>

                <div className="md:ml-auto">
                    <h4 className="font-bold text-slate-900 mb-4 tracking-tight">Platform</h4>
                    <ul className="space-y-3 text-sm text-slate-500 font-medium">
                        <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Dashboard</Link></li>
                        <li><Link href="/demos" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Watch Demos</Link></li>
                        <li><Link href="/skills" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Skills Dashboard</Link></li>
                        <li><Link href="/profile" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Your Profile</Link></li>
                    </ul>
                </div>

                <div className="md:ml-auto">
                    <h4 className="font-bold text-slate-900 mb-4 tracking-tight">Resources</h4>
                    <ul className="space-y-3 text-sm text-slate-500 font-medium">
                        <li><Link href="#" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Blog</Link></li>
                        <li><Link href="#" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Community</Link></li>
                        <li><Link href="#" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Documentation</Link></li>
                        <li><Link href="#" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Help Center</Link></li>
                    </ul>
                </div>

                <div className="md:ml-auto">
                    <h4 className="font-bold text-slate-900 mb-4 tracking-tight">Company</h4>
                    <ul className="space-y-3 text-sm text-slate-500 font-medium">
                        <li><Link href="#" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">About Us</Link></li>
                        <li><Link href="#" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Careers</Link></li>
                        <li><Link href="#" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Contact</Link></li>
                        <li><Link href="#" className="hover:text-blue-600 transition-colors hover:translate-x-1 inline-block">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} OpenConnect. All rights reserved.</p>
                <div className="flex space-x-6 mt-4 md:mt-0 font-medium">
                    <Link href="#" className="hover:text-slate-600">Terms</Link>
                    <Link href="#" className="hover:text-slate-600">Privacy</Link>
                    <Link href="#" className="hover:text-slate-600">Cookies</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
