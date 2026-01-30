require('dotenv').config();
const { Bot } = require("gramio");

async function getUpdates() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.error("Error: TELEGRAM_BOT_TOKEN is missing in .env");
        return;
    }

    console.log("Fetching updates... (Please send a message to the bot in your group/channel first)");

    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

    try {
        // Gramio doesn't have a simple getUpdates method exposed easily in the high-level API usually used for bots listening,
        // but we can use the raw API.
        const updates = await bot.api.getUpdates();

        if (updates.length === 0) {
            console.log("No updates found. Please send a message 'Hello' to the bot in your group.");
            return;
        }

        console.log("\nFound the following recent chats:");
        updates.forEach(update => {
            const message = update.message || update.channel_post || update.my_chat_member;
            if (message && message.chat) {
                console.log(`--------------------------------------------------`);
                console.log(`Chat Name: ${message.chat.title || message.chat.username || message.chat.first_name}`);
                console.log(`Chat Type: ${message.chat.type}`);
                console.log(`Chat ID:   ${message.chat.id}`);
                console.log(`--------------------------------------------------`);
            }
        });

        console.log("\nCopy the 'Chat ID' you want and paste it into your .env file as TELEGRAM_CHAT_ID.");

    } catch (error) {
        console.error("Failed to fetch updates:", error);
    }
}

getUpdates();
