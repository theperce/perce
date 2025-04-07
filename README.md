# Telegram Mini App

A simple mini app for Telegram bots that demonstrates core functionality of the Telegram Web App API.

## Features

- Automatic theme adaptation (light/dark)
- User information display
- Main Button demonstration
- Sending data back to the bot
- BackButton handling

## Setup Instructions

### 1. Host the mini app

Host these files on a web server that supports HTTPS. You can use services like:
- GitHub Pages
- Vercel
- Netlify
- Firebase Hosting

### 2. Create a bot and configure the mini app

1. Talk to [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot with the `/newbot` command
3. After creating your bot, use the `/mybots` command
4. Select your bot
5. Go to "Bot Settings" > "Menu Button" or use the command `/setmenubutton`
6. Set the menu button URL to your hosted mini app URL

### 3. Add code to your bot to handle incoming data

When users interact with the mini app, it will send data to your bot. You need to implement handlers in your bot code to process this data.

Example for a Node.js bot using the `node-telegram-bot-api` library:

```javascript
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, {polling: true});

// Handle web app data
bot.on('web_app_data', (msg) => {
  const data = JSON.parse(msg.web_app_data.data);
  
  bot.sendMessage(
    msg.chat.id, 
    `Received data: ${JSON.stringify(data, null, 2)}`
  );
});
```

## Development Notes

- Make sure to test your mini app in both light and dark themes
- The app automatically adapts to the user's Telegram theme
- Review the [Telegram Mini Apps documentation](https://core.telegram.org/bots/webapps) for more details

## Files

- `index.html` - The main HTML structure
- `app.js` - JavaScript for interacting with the Telegram Web App API
- `styles.css` - Styling with theme support 