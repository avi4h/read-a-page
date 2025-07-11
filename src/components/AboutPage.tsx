import React from 'react';
import { LogoLargeIcon } from './Icons';

const AboutPage: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <LogoLargeIcon className="w-16 h-16" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-teal-600 dark:text-brand-teal-400 font-serif">What's this all about?</h1>
            </div>
            <div className="mt-8 space-y-6 text-lg text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                <p>
                    Ever stood in a bookstore, paralyzed by choice? Or maybe you've picked up a book with a stunning cover, only to find the story inside didn't quite match up. We've all been there.
                </p>
                <p>
                    That's the little problem this place is built to solve.
                </p>
                <p>
                    The idea is simple: what if you could decide on your next read based on the most important part, the story itself? Here, everything else is stripped away. No covers. No author names. No hype. Just a page.
                </p>
                <p>
                    Next, see if the writing itself hooks you. If it does, a click reveals the title, author, and all the details. If not, move to next one.
                </p>
                <p>
                    Think of it like a blind taste test for books. 
                </p>
                <p>
                    So go on, turn a page. Your next favorite book might be one you never would have picked up otherwise.
                </p>
                <p className="text-center font-semibold pt-4">Happy reading!</p>
            </div>
        </div>
    );
};

export default AboutPage;
