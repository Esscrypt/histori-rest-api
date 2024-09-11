# ERC20-Info

Comprehensive ERC20 Token Info API

---

## 📋 Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## 🚀 Installation

To get started with the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/erc20-info.git
cd erc20-info
npm install
```
This will start the server and listen on the port defined in your .env file (or the default port 3000 if not specified).

---


## Configure environment variables

The project requires a .env file for environment-specific configurations. Start by copying the .env.example file to create a new .env file:
```
cp .env.example .env
```

The project requires the following environment variables, which you can define in a .env file:
```
DATABASE_URL=your_postgres_connection_url
PORT=3000
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password

BASE_URL=http://localhost:3000
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_ENDPOINT_SECRET=whsec_12345
SALT_ROUNDS=10
```
Make sure to update these variables based on your environment. You can use the .env.example file as a reference.

---

## 🔧 Usage
To start the server in development mode, run:
```
npm run dev
```
This will start the server and listen on the port defined in your .env file (or the default port 3000 if not specified).

---
## 🗄️ Database
This project uses PostgreSQL as the database. You may need to create a DB and a user manually.
To connect to the database locally, run the following command:
```
psql -h localhost -U test -d mydb -W
```

## 🔒 License
This project is licensed under the MIT License. See the LICENSE file for details.

