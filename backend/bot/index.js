const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;

let bot = null;
if (BOT_TOKEN) {
    bot = new Telegraf(BOT_TOKEN);

    bot.start((ctx) => {
        const startPayload = ctx.payload;
        if (startPayload) {
            ctx.reply(`Xush kelibsiz! Siz quyidagi usta sahifasiga tashrif buyurdingiz: ${startPayload}`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Ustani ko\'rish', web_app: { url: `${process.env.FRONTEND_URL || 'https://your-domain.com'}/vendor/${startPayload}` } }]
                    ]
                }
            });
        } else {
            ctx.reply('Xush kelibsiz! Usto xizmatlar markazining Mini App\'idan foydalanish uchun quyidagi tugmani bosing.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Mini App-ni ochish', web_app: { url: process.env.FRONTEND_URL || 'https://your-domain.com' } }]
                    ]
                }
            });
        }
    });

    // Command to register as professional (vendor)
    bot.command('vendor', (ctx) => {
        ctx.reply('Usta sifatida ishlash uchun quyidagi Mini App orqali ro\'yxatdan o\'ting:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Usta Kabinetiga kirish', web_app: { url: `${process.env.FRONTEND_URL || 'https://your-domain.com'}/vendor` } }]
                ]
            }
        });
    });

    bot.launch().then(() => console.log('Telegram Bot started.'));

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
} else {
    console.warn('BOT_TOKEN is not defined in .env! Telegram bot is NOT running. Please read implementation_plan.md and define it.');
}

module.exports = bot;
