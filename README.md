# 💬 IRC Client-Server Application

A modern IRC-style chat application with real-time messaging, channel management, and user presence tracking ON GOING.

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

## 📦 Installation

### Prerequisites
- Node.js v18+
- MongoDB 6.0+
- npm 9+ or yarn 1.22+

```bash
# Clone repository
git clone https://github.com/Mahmoud-Mh/IRC.git
cd irc-project

# Install dependencies
cd irc-server && npm install
cd ../irc-client && npm install

⚙️ Configuration
Backend Environment (irc-server/.env)


MONGODB_URI="mongodb://localhost:27017/irc"
PORT=3000
FRONTEND_URL="http://localhost:5173"

Frontend Environment (irc-client/.env)

VITE_API_URL="http://localhost:3000"

🖥️ Running the Application

Start Backend Server

cd irc-server
npm run start

Start Frontend Development Server

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


🚨 Troubleshooting
Issue	Solution
CORS Errors	Verify FRONTEND_URL in backend .env
MongoDB Connection Issues	Check if MongoDB service is running
Nickname Conflicts	Ensure nicknames are unique
Socket Disconnects	Verify network/firewall configurations
Missing Messages	Check MongoDB connection and indexes
📜 License

MIT License © 2024 Mahmoud Mouzoun
License

Happy Chatting! 💬🚀
