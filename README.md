# IRC Chat Application

## Overview

This project implements a simple IRC-style chat application. It is built with **NestJS** for the backend and utilizes **Socket.IO** for real-time communication. Users can join channels, send messages (both channel-wide and private), and receive real-time updates for various events.

---

## Features

### Core Functionalities
1. **User Management**
   - Users can create unique nicknames.
   - Users can join or leave channels.
   - Users can view a list of active users in a specific channel.

2. **Channel Management**
   - Create channels dynamically.
   - Join existing channels.
   - Fetch a list of all available channels.

3. **Message Management**
   - Send and retrieve messages within a channel.
   - Send and receive private messages between users.
   - Persist messages in a MongoDB database for later retrieval.

4. **Notification System**
   - Notify users in a channel when someone joins or leaves.
   - Notify users when they receive a private message.

5. **Database**
   - MongoDB is used to store users, channels, and messages.

---

## Technology Stack

- **Backend Framework**: NestJS
- **WebSockets**: Socket.IO
- **Database**: MongoDB (via Mongoose)
- **Frontend**: React (recommended via Vite)
- **Styling**: TailwindCSS

---

## Installation

### Prerequisites

Before getting started, ensure that you have the following installed:

1. **Node.js**: [Download Node.js](https://nodejs.org/)
2. **MongoDB**: A running MongoDB instance (either locally or through a service like MongoDB Atlas).

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mahmoud-Mh/IRC.git
   cd <repository_directory>

   
2. **Install backend dependencies**
npm install
npm run start

2. **Install frontend dependencies**

npm install react-router-dom
npm install socket.io-client
npm install axios
npm install --save-dev @types/react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

3. **Install additional NestJS dependencies:**

npm install -g @nestjs/cli
npm install @nestjs/mongoose mongoose @nestjs/platform-socket.io socket.io



