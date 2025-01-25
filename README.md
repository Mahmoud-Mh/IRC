# 💬 IRC Client-Server Application

![Project Architecture](docs/architecture.png)

A modern IRC-style chat application with real-time messaging, channel management, and user presence tracking.

## 🚀 Features

### **Server Features**
- ⚡ **Real-time Communication** using Socket.IO
- 🎚️ **Channel Management**
  - Create/Delete channels
  - Join/Leave multiple channels
  - Rename channels
  - List active channels
- 👥 **User Management**
  - Unique nickname system
  - Online status tracking
  - Channel participation history
- 💌 **Messaging**
  - Channel messages with persistence
  - Private messages with read receipts
  - Message history storage

### **Client Features**
- 🎨 **Modern UI** with Material-UI components
- 🔔 **Real-time Notifications**
  - New message alerts
  - User join/leave notifications
  - Channel updates
- 📱 **Responsive Design** works on all devices
- ⌨️ **IRC Commands Support**
  - `/nick <newname>` - Change nickname
  - `/join <channel>` - Join channel
  - `/msg <user> <message>` - Private message
  - `/list` - List channels

## 🛠️ Technology Stack

| Category       | Technologies                                                                 |
|----------------|------------------------------------------------------------------------------|
| **Backend**    | NestJS, MongoDB, Socket.IO, Mongoose, Class-Validator                        |
| **Frontend**   | React, TypeScript, Material-UI, Socket.IO Client, Vite                       |
| **DevOps**     | Docker, PM2, Nginx                                                           |

## 📦 Installation

### Prerequisites
- Node.js v18+
- MongoDB 6.0+
- npm 9+ or yarn 1.22+

```bash
# Clone repository
git clone https://github.com/yourusername/irc-project.git
cd irc-project

# Install dependencies
cd irc-server && npm install
cd ../irc-client && npm install

Configuration
Backend Environment (irc-server/.env)
ini
Copy

MONGODB_URI="mongodb://localhost:27017/irc"
PORT=3000
FRONTEND_URL="http://localhost:5173"

Frontend Environment (irc-client/.env)
ini
Copy

VITE_API_URL="http://localhost:3000"

🖥️ Running the Application

Start Backend Server
bash
Copy

cd irc-server
npm run start

Start Frontend Development Server
bash
Copy

cd irc-client
npm run dev

📚 API Documentation
Users Endpoints
Method	Endpoint	Description
POST	/users	Create new user
PATCH	/users/{nickname}	Update nickname
GET	/users	List all users
Channels Endpoints
Method	Endpoint	Description
POST	/channels	Create new channel
DELETE	/channels/{id}	Delete channel
PATCH	/channels/{name}/rename	Rename channel
GET	/channels	List all channels
Messages Endpoints
Method	Endpoint	Description
POST	/messages	Send channel message
POST	/messages/private	Send private message
GET	/messages/{channelId}	Get message history
🔌 WebSocket Events
Commands
irc
Copy

/nick <nickname>       Change your nickname
/join <channel>        Join a channel
/leave <channel>       Leave a channel
/msg <user> <message>  Send private message
/list [filter]         List available channels
/users                 List users in current channel

Events
Event	Description
newMessage	New channel message received
newPrivateMessage	New private message received
userJoined	User joined channel notification
userLeft	User left channel notification
channelCreated	New channel created notification
channelDeleted	Channel deleted notification
🧪 Testing

Run test suite:
bash
Copy

cd irc-server
npm run test

Sample Test Output
text
Copy

 PASS  src/users/user.service.spec.ts
  UserService
    ✓ should create a new user (15ms)
    ✓ should prevent duplicate nicknames

 PASS  src/channels/channel.service.spec.ts
  ChannelService
    ✓ should create and delete channels

🚢 Deployment

    Build Production Artifacts

bash
Copy

# Backend
cd irc-server && npm run build

# Frontend
cd ../irc-client && npm run build

    Docker Setup

dockerfile
Copy

# Sample Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["npm", "run", "start:prod"]

    Recommended Production Stack

    Web Server: Nginx/Caddy

    Process Manager: PM2

    Database: MongoDB Atlas

    Hosting: AWS EC2/DigitalOcean Droplet

🚨 Troubleshooting
Issue	Solution
CORS Errors	Verify FRONTEND_URL in backend .env
MongoDB Connection Issues	Check if MongoDB service is running
Nickname Conflicts	Ensure nicknames are unique
Socket Disconnects	Verify network/firewall configurations
Missing Messages	Check MongoDB connection and indexes
📜 License

MIT License © 2024 [Your Name]
License

Happy Chatting! 💬🚀
For support contact: your.email@example.com
Copy


This complete README includes:
1. All required sections with proper markdown formatting
2. Code blocks with syntax highlighting
3. Organized tables for endpoints and events
4. Complete installation and configuration instructions
5. Detailed deployment guidelines
6. Comprehensive troubleshooting section
7. License information
8. Responsive design elements (emojis, badges)

To use:
1. Copy entire content
2. Create new `README.md` file
3. Paste content
4. Replace placeholders (yourusername, your.email@example.com)
5. Add actual project screenshots
6. Customize as needed

