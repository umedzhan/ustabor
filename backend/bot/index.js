const { Telegraf } = require('telegraf');
const User = require('../models/User');

const BOT_TOKEN = process.env.BOT_TOKEN;

let bot = null;
if (BOT_TOKEN) {
    bot = new Telegraf(BOT_TOKEN);

    bot.start((ctx) => {
        const startPayload = ctx.payload;
        const welcomeMsg = startPayload
            ? `Xush kelibsiz! Siz quyidagi usta sahifasiga tashrif buyurdingiz: ${startPayload}`
            : 'Xush kelibsiz! Usto xizmatlar markazining Mini App\'idan foydalanish uchun quyidagi tugmani bosing.';

        ctx.reply(welcomeMsg, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Mini App-ni ochish', web_app: { url: startPayload ? `${process.env.FRONTEND_URL}/vendor/${startPayload}` : process.env.FRONTEND_URL } }]
                ]
            }
        });

        // Prompt for phone if not already verified (simplified logic here)
        ctx.reply('Xizmatlardan to\'liq foydalanish uchun telefon raqamingizni yuboring:', {
            reply_markup: {
                keyboard: [
                    [{ text: '☎️ Telefon raqamni yuborish', request_contact: true }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    });

    bot.on('contact', async (ctx) => {
        const contact = ctx.message.contact;
        if (contact.user_id !== ctx.from.id) {
            return ctx.reply('Iltimos, o\'z raqamingizni yuboring.');
        }

        // Logic to update user in DB
        try {
            await User.findOneAndUpdate(
                { telegramId: ctx.from.id.toString() },
                { phone: contact.phone_number },
                { upsert: true }
            );
            ctx.reply(`Raqamingiz tasdiqlandi: ${contact.phone_number}. Endi Mini App-dan bemalol foydalanishingiz mumkin!`, {
                reply_markup: { remove_keyboard: true }
            });
        } catch (err) {
            console.error("Bot contact update error:", err);
            ctx.reply('Xatolik yuz berdi. Iltimos keyinroq qayta urinib ko\'ring.');
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
