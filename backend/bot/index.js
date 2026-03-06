const { Telegraf } = require('telegraf');
const User = require('../models/User');

const BOT_TOKEN = process.env.BOT_TOKEN;

let bot = null;
if (BOT_TOKEN) {
    bot = new Telegraf(BOT_TOKEN);

    // ==================== /start ====================
    bot.start(async (ctx) => {
        const startPayload = ctx.payload;
        let welcomeMsg = `🏠 Xush kelibsiz *Ustabor*ga!\n\nProfessional ustalar bilan bog'laning. Mini App-ni ochish uchun tugmani bosing.`;
        let webAppUrl = process.env.FRONTEND_URL;

        if (startPayload) {
            // Check if it's an order ID (chat deep link) or vendor ID
            // For now, if payload exists, we adapt the greeting
            welcomeMsg = `🏠 Xush kelibsiz! So'rov bo'yicha ilovani ochish uchun quyidagi tugmani bosing.`;

            // If it looks like a chat link (we can use a prefix or just try to be smart)
            // Let's assume for now that direct payload = potential chat or vendor
            if (startPayload.length === 24) {
                webAppUrl = `${process.env.FRONTEND_URL}/chat/${startPayload}`;
                welcomeMsg = `💬 Yangi xabar! Chatni ochish uchun quyidagi tugmani bosing.`;
            } else {
                webAppUrl = `${process.env.FRONTEND_URL}/vendor/${startPayload}`;
            }
        }

        await ctx.replyWithMarkdown(welcomeMsg, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: startPayload ? '🚀 Ilovani ochish' : '🚀 Mini App-ni ochish', web_app: { url: webAppUrl } }]
                ]
            }
        });

        // Check if user exists and has phone/location
        const existing = await User.findOne({ telegramId: ctx.from.id.toString() });

        // Ask for contact if no phone
        if (!existing?.phone) {
            await ctx.reply('📞 Xizmatlardan to\'liq foydalanish uchun telefon raqamingizni yuboring:', {
                reply_markup: {
                    keyboard: [
                        [{ text: '☎️ Telefon raqamni yuborish', request_contact: true }],
                        [{ text: '📍 Lokatsiyamni yuborish', request_location: true }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else if (!existing?.location?.latitude) {
            // Ask for location if no phone
            await ctx.reply('📍 Yaqin ustalarni topish uchun lokatsiyangizni yuboring (ixtiyoriy):', {
                reply_markup: {
                    keyboard: [
                        [{ text: '📍 Lokatsiyamni yuborish', request_location: true }],
                        [{ text: '❌ O\'tkazib yuborish' }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
    });

    // ==================== Contact handler ====================
    bot.on('contact', async (ctx) => {
        const contact = ctx.message.contact;
        if (contact.user_id !== ctx.from.id) {
            return ctx.reply('Iltimos, o\'z raqamingizni yuboring.');
        }
        try {
            const user = await User.findOneAndUpdate(
                { telegramId: ctx.from.id.toString() },
                { phone: contact.phone_number },
                { upsert: true, new: true }
            );

            await ctx.reply(`✅ Raqamingiz saqlandi: ${contact.phone_number}\n\nEndi lokatsiyangizni yuboring (ixtiyoriy):`, {
                reply_markup: {
                    keyboard: [
                        [{ text: '📍 Lokatsiyamni yuborish', request_location: true }],
                        [{ text: '❌ O\'tkazib yuborish' }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } catch (err) {
            console.error("Bot contact update error:", err);
            ctx.reply('Xatolik yuz berdi. Iltimos keyinroq qayta urinib ko\'ring.');
        }
    });

    // ==================== Location handler ====================
    bot.on('location', async (ctx) => {
        const { latitude, longitude } = ctx.message.location;
        try {
            await User.findOneAndUpdate(
                { telegramId: ctx.from.id.toString() },
                { 'location.latitude': latitude, 'location.longitude': longitude },
                { upsert: true }
            );
            await ctx.reply('✅ Lokatsiyangiz saqlandi! Endi yaqin ustalarni topa olasiz.', {
                reply_markup: { remove_keyboard: true }
            });
        } catch (err) {
            console.error("Location update error:", err);
            ctx.reply('Xatolik yuz berdi.');
        }
    });

    // ==================== Skip location ====================
    bot.hears("❌ O'tkazib yuborish", async (ctx) => {
        await ctx.reply('Tushunildi! Ilovadan foydalanishingiz mumkin.', {
            reply_markup: { remove_keyboard: true }
        });
    });

    // ==================== /info command ====================
    bot.command('info', async (ctx) => {
        const user = await User.findOne({ telegramId: ctx.from.id.toString() });
        const role = user?.role;

        if (role === 'vendor') {
            await ctx.replyWithMarkdown(`📋 *Usta uchun qo'llanma*

🔹 *Kabinet:* Mini App orqali zakazlaringizni ko'ring
🔹 *Zakazlar:* Yangi zakazlarni qabul qiling yoki rad eting  
🔹 *Profil:* Portfolio, xizmatlar narxi, ish vaqtini sozlang
🔹 *To'lov:* Har bir yakunlangan zakazdan ${10}% komissiya olinadi
🔹 *Reyting:* Mijozlar baholashiga qarab reyting oshadi

📞 Yordam: @ustabor_support`);
        } else if (role === 'client') {
            await ctx.replyWithMarkdown(`📋 *Mijoz uchun qo'llanma*

🔹 *Usta topish:* Kategoriya bo'yicha usta tanlang
🔹 *Buyurtma:* Ustaning sahifasidan buyurtma bering
🔹 *Chat:* Usta bilan ilovada muloqot qiling
🔹 *Baholash:* Xizmatdan so'ng usta reytingini qoldiring
🔹 *Xavfsizlik:* Telefon raqam va username chatda ko'rinmaydi

📞 Yordam: @ustabor_support`);
        } else {
            await ctx.replyWithMarkdown(`👋 *Ustabor — Professional Xizmatlar Platformasi*

Siz hali ro'yxatdan o'tmagansiz.

Ro'yxatdan o'tish uchun /start buyrug'ini bering va Mini App-ni oching.

📞 Yordam: @ustabor_support`);
        }
    });

    // ==================== /help command ====================
    bot.command('help', async (ctx) => {
        await ctx.replyWithMarkdown(`🆘 *Yordam*

📌 Buyruqlar:
• /start — Botni boshlash va ilovani ochish
• /info — Platforma haqida ma'lumot
• /help — Yordam

❓ Savollar bo'lsa: @ustabor_support`);
    });

    // ==================== /vendor command ====================
    bot.command('vendor', (ctx) => {
        ctx.reply('Usta sifatida ishlash uchun ro\'yxatdan o\'ting:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Usta Kabinetiga kirish', web_app: { url: `${process.env.FRONTEND_URL || 'https://your-domain.com'}/vendor/register` } }]
                ]
            }
        });
    });

    bot.launch()
        .then(() => console.log('Telegram Bot started.'))
        .catch(err => {
            console.error('Telegram Bot failed to start:', err.message);
            console.warn('Backend server will continue running without bot functionality.');
        });

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
} else {
    console.warn('BOT_TOKEN is not defined in .env! Telegram bot is NOT running.');
}

module.exports = bot;
