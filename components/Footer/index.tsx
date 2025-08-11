import React from 'react';
import Link from 'next/link';
import { Github, Twitter, BookOpen, MessageCircle, Shield, Zap } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const links = {
        product: [
            // { name: 'How it Works', href: '#how-it-works' },
            { name: 'Trade', href: '/trade' },
            { name: 'Resolvers', href: '/resolvers' },
            { name: 'Orders', href: '/orders' },
        ],
        developers: [
            { name: 'Documentation', href: '/docs', icon: <BookOpen size={16} /> },
            { name: 'API Reference', href: '/docs/api' },
            { name: 'Smart Contracts', href: '/docs/contracts' },
            { name: 'Integration Guide', href: '/docs/integration' },
        ],
        community: [
            { name: 'Discord', href: 'https://discord.gg/omneon', icon: <MessageCircle size={16} /> },
            { name: 'Twitter', href: 'https://twitter.com/omneon', icon: <Twitter size={16} /> },
            { name: 'GitHub', href: 'https://github.com/omneon', icon: <Github size={16} /> },
            { name: 'Blog', href: '/blog' },
        ],
        // legal: [
        //     { name: 'Privacy Policy', href: '/privacy' },
        //     { name: 'Terms of Service', href: '/terms' },
        //     { name: 'Security', href: '/security', icon: <Shield size={16} /> },
        // ]
    };

    return (
        <footer className="relative  border-t border-slate-800 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0   " />
            
            <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Zap size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">Omneon</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-6 max-w-md">
                            Intent-based cross-chain swaps between EVM and Move VM networks. 
                            Trade with confidence using atomic settlement and competitive resolver networks.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://twitter.com/omneon" className="text-slate-400 hover:text-white transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="https://github.com/omneon" className="text-slate-400 hover:text-white transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="https://discord.gg/omneon" className="text-slate-400 hover:text-white transition-colors">
                                <MessageCircle size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <ul className="space-y-3">
                            {links.product.map((link: any) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                                    >
                                        {link.icon}
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Developers Links */}
                    <div>
                        {/* <h4 className="text-white font-semibold mb-4">Developers</h4>
                        <ul className="space-y-3">
                            {links.developers.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                                    >
                                        {link.icon}
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul> */}
                    </div>

                    {/* Community & Legal */}
                    <div>
                        {/* <h4 className="text-white font-semibold mb-4">Community</h4>
                        <ul className="space-y-3 mb-6">
                            {links.community.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                                    >
                                        {link.icon}
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul> */}
                        
                        {/* <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {links.legal.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                                    >
                                        {link.icon}
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul> */}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                         
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span>4+ Mainnet Live</span>
                            </div>
                            <div className="text-slate-400 text-xs">
                                1+ Active Resolvers
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <p className="text-slate-400 text-sm">
                            &copy; {currentYear} Omneon. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;