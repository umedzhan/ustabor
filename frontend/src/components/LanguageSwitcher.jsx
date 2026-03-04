import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
    const { lang, setLang } = useLanguage();

    return (
        <div className="fixed bottom-24 right-6 z-[999] flex flex-col gap-2 animate-slide-up">
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-1.5 flex flex-col gap-1 ring-1 ring-black/5">
                <button
                    onClick={() => setLang('uz')}
                    className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'uz'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-100'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                >
                    UZ
                </button>
                <button
                    onClick={() => setLang('ru')}
                    className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'ru'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-100'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                >
                    RU
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
            `}} />
        </div>
    );
};

export default LanguageSwitcher;
