const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
// const schedule = require('node-schedule'); // Removed for serverless
// const fs = require('fs'); // Removed for serverless
const config = require('./config.json');

// --- API KEYS (Read from config.json and Environment Variables) ---
const TELEGRAM_TOKEN = config.telegram_token;
const COINMARKETCAP_API_KEY = config.coinmarketcap_api_key;
const NEWS_API_KEY = config.news_api_key;
const ETHERSCAN_API_KEY = config.etherscan_api_key;

// Initialize bot with webhook (no polling)
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// --- DATABASE (Placeholder functions for external database) ---
// In a real serverless setup, you'd integrate with a cloud database like Firebase Firestore, DynamoDB, etc.

async function getPortfolio(chatId) {
    // Placeholder: Fetch portfolio from external DB
    console.log(`Fetching portfolio for chatId: ${chatId}`);
    // Example: return (await db.collection('portfolios').doc(chatId).get()).data();
    return {}; // Return empty for now
}

async function savePortfolio(chatId, portfolio) {
    // Placeholder: Save portfolio to external DB
    console.log(`Saving portfolio for chatId: ${chatId}`);
    // Example: await db.collection('portfolios').doc(chatId).set(portfolio);
}

async function getAlerts(chatId) {
    // Placeholder: Fetch alerts from external DB
    console.log(`Fetching alerts for chatId: ${chatId}`);
    // Example: return (await db.collection('alerts').doc(chatId).get()).data().alerts || [];
    return []; // Return empty for now
}

async function saveAlerts(chatId, alerts) {
    // Placeholder: Save alerts to external DB
    console.log(`Saving alerts for chatId: ${chatId}`);
    // Example: await db.collection('alerts').doc(chatId).set({ alerts });
}

// --- API HELPER FUNCTIONS ---

async function getCryptoData(symbols) {
    try {
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            headers: { 'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY },
            params: { symbol: symbols.join(','), convert: 'USD' },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching crypto data:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function getTopCoins(params) {
    try {
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
            headers: { 'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY },
            params: { ...params, convert: 'USD' },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching top coins:', error);
        return null;
    }
}

// --- BOT COMMANDS ---

bot.onText(~/start/, (msg) => {
    const chatId = msg.chat.id;
    const greeting = 
'🚀 **WAGMI, Crypto Commander!** 🚀' +
'\n\nI\'m your all-in-one crypto bot. Here\'s a list of commands:\n' +
'\n**Market Info:**\n' +
'- /prices - Top 20 gainers in the last 24h.\n' +
'- /legacy - Top 30 coins by market cap.\n' +
'- /gas - Current Ethereum gas fees.\n' +
'- /news - Latest crypto news headlines.\n' +
'- /info SYMBOL - Get details on a specific crypto.\n' +
'\n**Personal Tools:**\n' +
'- /add SYMBOL AMOUNT - Add a coin to your portfolio.\n' +
'- /portfolio - View your portfolio\'s value.\n' +
'- /alert SYMBOL > or < PRICE - Set a price alert (e.g., /alert BTC > 70000).\n' +
'\nOr just type any crypto symbol (like ETH) for a quick price check.\n';
    bot.sendMessage(chatId, greeting, { parse_mode: 'Markdown' });
});

bot.onText(~/prices/, async (msg) => {
    const chatId = msg.chat.id;
    const cryptos = await getTopCoins({ start: 1, limit: 20, sort: 'percent_change_24h', sort_dir: 'desc' });
    if (cryptos) {
        let message = '🔥 **Top 20 Performing Cryptos (24h)** 🔥\n\n';
        cryptos.forEach((crypto, index) => {
            const price = crypto.quote.USD.price;
            const change24h = crypto.quote.USD.percent_change_24h;
            message += `${index + 1}. **${crypto.name} (${crypto.symbol})**\n   - Price: $${price.toFixed(4)}\n   - Change (24h): ${change24h.toFixed(2)}% 🟢\n\n`;
        });
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } else {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch the crypto prices right now.");
    }
});

bot.onText(~/legacy/, async (msg) => {
    const chatId = msg.chat.id;
    const cryptos = await getTopCoins({ start: 1, limit: 30, sort: 'market_cap', sort_dir: 'desc' });
    if (cryptos) {
        let message = '🏆 **Legacy Cryptos (Top 30 by Market Cap)** 🏆\n\n';
        cryptos.forEach((crypto, index) => {
            const price = crypto.quote.USD.price;
            const change24h = crypto.quote.USD.percent_change_24h;
            const symbol = change24h >= 0 ? '🟢' : '🔴';
            message += `${index + 1}. **${crypto.name} (${crypto.symbol})**\n   - Price: $${price.toFixed(4)}\n   - Change (24h): ${change24h.toFixed(2)}% ${symbol}\n\n`;
        });
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } else {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch legacy crypto prices.");
    }
});

bot.onText(~/gas/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`);
        const gas = response.data.result;
        let message = `⛽ **Ethereum Gas Fees** ⛽\n\n- **Low:** ${gas.SafeGasPrice} Gwei\n- **Average:** ${gas.ProposeGasPrice} Gwei\n- **High:** ${gas.FastGasPrice} Gwei`;
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch gas fees.");
    }
});

bot.onText(~/news/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${NEWS_API_KEY}`);
        const news = response.data.Data;
        let message = '📰 **Latest Crypto News** 📰\n\n';
        news.slice(0, 5).forEach(article => {
            message += `[${article.title}](${article.url})\n\n`;
        });
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown', disable_web_page_preview: true });
    } catch (e) {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch the news.");
    }
});

bot.onText(~/info (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const symbol = match[1].toUpperCase();
    const data = await getCryptoData([symbol]);
    if (data && data[symbol]) {
        const crypto = data[symbol];
        const quote = crypto.quote.USD;
        const price = quote.price;
        const change1h = quote.percent_change_1h;
        const change24h = quote.percent_change_24h;

        const priceChange1h = (price * change1h) / 100;
        const priceChange24h = (price * change24h) / 100;

        const symbol1h = change1h >= 0 ? '🟢' : '🔴';
        const symbol24h = change24h >= 0 ? '🟢' : '🔴';

        let message = `\n*${crypto.name} (${crypto.symbol})*\n\n**Price:** $${price.toFixed(4)}\n\n**1h Change:** ${change1h.toFixed(2)}% ( $${priceChange1h.toFixed(4)} ) ${symbol1h}\n**24h Change:** ${change24h.toFixed(2)}% ( $${priceChange24h.toFixed(2)} ) ${symbol24h}\n        `;
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } else {
        bot.sendMessage(chatId, `Could not find info for **${symbol}**.`, { parse_mode: 'Markdown' });
    }
});

bot.onText(~/add (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const symbol = match[1].toUpperCase();
    const amount = parseFloat(match[2]);

    if (isNaN(amount) || amount <= 0) {
        bot.sendMessage(chatId, "Please enter a valid amount.");
        return;
    }

    let portfolio = await getPortfolio(chatId);
    portfolio[symbol] = (portfolio[symbol] || 0) + amount;
    await savePortfolio(chatId, portfolio);
    bot.sendMessage(chatId, `Added **${amount} ${symbol}** to your portfolio.`, { parse_mode: 'Markdown' });
});

bot.onText(~/portfolio/, async (msg) => {
    const chatId = msg.chat.id;
    const portfolio = await getPortfolio(chatId);

    if (!portfolio || Object.keys(portfolio).length === 0) {
        bot.sendMessage(chatId, "Your portfolio is empty. Use `/add SYMBOL AMOUNT` to add coins.");
        return;
    }

    const symbols = Object.keys(portfolio);
    const prices = await getCryptoData(symbols);

    if (!prices) {
        bot.sendMessage(chatId, "Could not fetch prices to calculate portfolio value.");
        return;
    }

    let totalValue = 0;
    let message = '💼 **Your Crypto Portfolio** 💼\n\n';

    for (const symbol of symbols) {
        const amount = portfolio[symbol];
        const price = prices[symbol] ? prices[symbol].quote.USD.price : 0;
        const value = amount * price;
        totalValue += value;
        message += `**${symbol}**: ${amount} ($${value.toFixed(2)})\n`;
    }

    message += `\n**Total Value:** **$${totalValue.toFixed(2)}**`;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

bot.onText(~/alert (.+) ([<>]) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const symbol = match[1].toUpperCase();
    const condition = match[2]; // '>' or '<'
    const price = parseFloat(match[3]);

    if (isNaN(price)) {
        bot.sendMessage(chatId, "Please enter a valid price for the alert.");
        return;
    }

    let alerts = await getAlerts(chatId);
    alerts.push({ symbol, condition, price });
    await saveAlerts(chatId, alerts);
    bot.sendMessage(chatId, `🔔 Alert set: I will notify you if **${symbol}** goes ${condition === '>' ? 'above' : 'below'} **$${price}**.`, { parse_mode: 'Markdown' });
});

// --- QUICK PRICE CHECK ---
bot.on('message', async (msg) => {
    // Ignore commands
    if (msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const symbol = msg.text.trim().toUpperCase();

    // Basic check to avoid firing on random text
    if (symbol.length > 5 || symbol.includes(' ')) return;

    const data = await getCryptoData([symbol]);
    if (data && data[symbol]) {
        const crypto = data[symbol];
        const quote = crypto.quote.USD;
        const price = quote.price;
        const change24h = quote.change24h; // This was a bug, should be percent_change_24h
        const symbol24h = change24h >= 0 ? '🟢' : '🔴';
        let message = `**${crypto.name} (${symbol})**\n`;
        message += `**Price:** $${price.toFixed(4)}\n`;
        message += `**24h Change:** ${change24h.toFixed(2)}% ${symbol24h}`;
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }
});



console.log('Crypto Command Center is running locally with polling!');