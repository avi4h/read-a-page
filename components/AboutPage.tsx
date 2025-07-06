import React from 'react';

const AboutPage: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-teal-600 dark:text-brand-teal-400 font-serif">What's this all about?</h1>
            </div>
            <div className="mt-8 space-y-6 text-lg text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                <p>
                    Ever stood in a bookstore, paralyzed by choice? Or maybe you've picked up a book with a stunning cover, only to find the story inside didn't quite match up. We've all been there.
                </p>
                <p>
                    That's the little problem this place was built to solve. This is a space for <span className="font-semibold text-slate-800 dark:text-white">pure discovery</span>.
                </p>
                <p>
                    The idea is simple: what if you could decide on your next read based on the most important part—the story itself? Here, we strip everything else away. No covers. No author names. No hype. Just the first page.
                </p>
                <p>
                    You get to dive headfirst into a new world, meet new characters, and see if the writing itself hooks you. If it does, a single click reveals the title, author, and all the details. If not, no big deal—another page from another world is just a click away.
                </p>
                <p>
                   Think of it like a blind taste test for books. And our slightly quirky, infinitely creative digital librarian (a friendly AI) is always here, dreaming up new pages to ensure you never run out of stories to explore.
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
