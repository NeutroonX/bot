# Crypto Command Center Telegram Bot

## Project Description
The Crypto Command Center is a comprehensive Telegram bot designed to provide users with real-time cryptocurrency market data, news, and personal portfolio management tools. It integrates with various cryptocurrency APIs to deliver up-to-date information directly within Telegram.

## Features

### Market Information
*   **/prices**: Displays the top 20 cryptocurrency gainers in the last 24 hours.
*   **/legacy**: Shows the top 30 cryptocurrencies by market capitalization.
*   **/gas**: Provides current Ethereum gas fees (Safe, Propose, Fast).
*   **/news**: Fetches the latest crypto news headlines.
*   **/info SYMBOL**: Get detailed information for a specific cryptocurrency (e.g., `/info BTC`).

### Personal Tools
*   **/add SYMBOL AMOUNT**: Add a specified amount of a cryptocurrency to your personal portfolio (e.g., `/add ETH 0.5`).
*   **/portfolio**: View the current value and breakdown of your cryptocurrency portfolio.
*   **/alert SYMBOL > or < PRICE**: Set a price alert for a cryptocurrency (e.g., `/alert BTC > 70000` or `/alert ADA < 0.50`).

### Quick Price Check
*   Simply type any cryptocurrency symbol (e.g., `ETH`, `XRP`) to get a quick price check.

## Technical Details

### Architecture
The bot is built using Node.js and leverages the `node-telegram-bot-api` library for interacting with the Telegram Bot API. HTTP requests to external APIs are handled using `axios`.

### API Integrations
*   **Telegram Bot API**: For sending and receiving messages, and handling bot commands.
*   **CoinMarketCap API (Pro)**: Used for fetching cryptocurrency prices, market capitalization, and top gainers/losers.
*   **Etherscan API**: Provides real-time Ethereum gas fee information.
*   **CryptoCompare API**: Utilized for fetching the latest cryptocurrency news headlines.

### Data Persistence
Currently, `db.json` serves as a simple, local placeholder for storing user portfolios and alerts. For a production-ready or serverless deployment, this would typically be replaced with a robust cloud-based database solution such as Firebase Firestore, AWS DynamoDB, MongoDB Atlas, or PostgreSQL.

### Error Handling
Basic error handling is implemented for API calls to gracefully manage network issues or invalid responses, providing user-friendly messages when data cannot be fetched.

## Prerequisites
Before running this bot, ensure you have the following installed:
*   Node.js (LTS version recommended)
*   npm (Node Package Manager, usually comes with Node.js)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd bot_tg
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Configuration

1.  **Obtain API Keys:**
    *   **Telegram Bot Token:** Create a new bot via BotFather on Telegram to get your token.
    *   **CoinMarketCap API Key:** Register on the CoinMarketCap Developer website to get a Pro API key.
    *   **News API Key:** Obtain an API key from a crypto news provider (e.g., CryptoCompare, NewsAPI.org if you adapt the code).
    *   **Etherscan API Key:** Register on the Etherscan website to get an API key.

2.  **Update `config.json`:**
    Open the `config.json` file in the project root and replace the placeholder values with your actual API keys:

    ```json
    {
      "telegram_token": "YOUR_TELEGRAM_TOKEN",
      "coinmarketcap_api_key": "YOUR_COINMARKETCAP_API_KEY",
      "news_api_key": "YOUR_NEWS_API_KEY",
      "etherscan_api_key": "YOUR_ETHERSCAN_API_KEY"
    }
    ```

## Usage

To start the bot, run the following command in your terminal from the project root directory:

```bash
node index.js
```

The bot will start polling for messages. You can then interact with it directly on Telegram.

## Deployment Considerations
This bot is designed with serverless deployment in mind. While it currently uses polling for simplicity, it can be adapted for webhook-based deployment on platforms like AWS Lambda, Google Cloud Functions, or Vercel. The `fs` and `schedule` modules were removed from `index.js` to facilitate serverless compatibility.

## Contributing
Contributions are welcome! Please feel free to open issues or submit pull requests.

## License
This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).