# Sai Chat

A real-time chat application built with Node.js, Express, and Socket.io.

## Features

- Real-time messaging
- Multiple chat rooms
- Global chat room
- Room creation and sharing
- User presence indicators
- Typing indicators
- Message history (24-hour retention)
- Full-screen responsive design

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Sairamthecityhunter/Sai-Chat.git
cd Sai-Chat
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## Environment Variables

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)

## Deployment

### For Production Deployment:

1. Set the `PORT` environment variable to your hosting provider's port
2. Make sure the server is accessible on the internet
3. The app will automatically use the current host for Socket.io connections

### Common Hosting Platforms:

- **Heroku**: Set `PORT` environment variable
- **Railway**: Automatically sets `PORT`
- **Render**: Automatically sets `PORT`
- **Vercel/Netlify**: Requires serverless function setup (not recommended for Socket.io)

## Troubleshooting

If the app doesn't show anything when deployed:

1. Check that the server is running and accessible
2. Verify Socket.io connections are allowed (check firewall/proxy settings)
3. Check browser console for errors
4. Ensure WebSocket connections are supported by your hosting provider

## License

ISC

