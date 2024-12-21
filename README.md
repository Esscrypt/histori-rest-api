# Histori REST API

The **Histori REST API** is a powerful tool for accessing historical blockchain data across multiple networks. This API provides reliable, developer-friendly endpoints for querying blocks, transactions, and accounts with high scalability and performance.

---

## 🚀 Features

- **Multi-Network Support**: Access blockchain data from Ethereum, Binance Smart Chain, and more.
- **Developer-Friendly**: Intuitive endpoints and clear documentation for seamless integration.
- **Production-Ready**: High-performance and scalable architecture.

---

## 🛠️ Project Setup

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm** (Node Package Manager)

### Installation

Clone the repository:
```bash
git clone https://github.com/your-repo/histori-rest-api.git
cd histori-rest-api
```
Install dependencies:
```bash
npm install
```

## 📖 Configuring `networks.json`

The `networks.json` file is where you configure network-specific details for accessing blockchain data through the Histori REST API. This includes RPC URLs, network IDs, chain IDs, block explorer links, and more. You can fill this configuration with custom RPC URLs or use **Histori’s multi-RPC service** for seamless integration.

---

### 📝 How to Fill `networks.json`

1. **Understand the Fields**:
   - **`name`**: The friendly name of the network (e.g., Ethereum Mainnet).
   - **`networkId`**: A unique identifier for the network (e.g., `eth-mainnet`).
   - **`chainId`**: The chain ID of the network (e.g., `1` for Ethereum Mainnet).
   - **`active`**: Indicates whether this network is active (`true` or `false`).
   - **`history`**: Whether historical data is enabled for this network.
   - **`blockExplorer`**: URL for the network's block explorer.
   - **`blockTime`**: Average time (in seconds) between blocks.
   - **`nativeCurrencyToUSDPool`**: Address of the liquidity pool for native currency to USD conversion.
   - **`poolInversed`**: Boolean indicating whether the pool ratio is inversed.
   - **`rpc`**: List of RPC URLs for the network.
   - **`poolScale`**: Scale factor for the native currency to USD conversion.
   - **`USDCAddress`/`USDTAddress`**: Token contract addresses for USDC/USDT.

2. **Option 1: Using Custom RPC URLs**:
   - Replace the `<YOUR_HISTORI_PROJECT_ID_HERE>` placeholder in the `rpc.url` with your preferred RPC URL.
   - Example:
     ```json
     {
         "url": "https://custom-node.example.com/eth-mainnet"
     }
     ```

3. **Option 2: Using Histori Multi-RPC Service**:
   - Histori provides a multi-RPC service with optimized performance and reliability. Follow these steps to obtain your `projectId`:

---

### 🔑 Steps to Get Your `projectId` for Histori Multi-RPC Service

1. **Visit the Histori Dashboard**:
   - Go to the [Histori Dashboard](https://histori.xyz/dashboard) and log in or sign up for an account.

2. **Create a Project**:
   - Navigate to the **Projects** section and click **Create New Project**.
   - Fill in your project details and save.

3. **Get Your `projectId`**:
   - Once your project is created, you’ll see a unique `projectId` associated with it.
   - Example: `abc123xyz456`

4. **Update `networks.json`**:
   - Replace `<YOUR_HISTORI_PROJECT_ID_HERE>` in the RPC URLs with your `projectId`.
   - Example:
     ```json
     {
         "url": "https://node.histori.xyz/eth-mainnet?projectId=abc123xyz456"
     }
     ```

---

### 🛠 Example `networks.json`

```json
[
    {
        "name": "Ethereum Mainnet",
        "networkId": "eth-mainnet",
        "chainId": 1,
        "active": true,
        "history": true,
        "blockExplorer": "https://etherscan.io/",
        "blockTime": 12,
        "nativeCurrencyToUSDPool": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
        "poolInversed": true,
        "rpc": [
            {
                "url": "https://node.histori.xyz/eth-mainnet?projectId=abc123xyz456"
            }
        ],
        "poolScale": 6,
        "USDCAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "USDTAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7"
    },
    {
        "name": "Ethereum Sepolia Testnet",
        "networkId": "eth-sepolia",
        "chainId": 11155111,
        "active": true,
        "history": false,
        "blockExplorer": "https://sepolia.etherscan.io/",
        "blockTime": 12,
        "rpc": [
            {
                "url": "https://node.histori.xyz/eth-sepolia?projectId=abc123xyz456"
            }
        ],
        "USDCAddress": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
    }
]
```

## 📖 Configuring `.env`

The `.env` file is essential for configuring environment variables required for running the Histori REST API. This includes settings for the server port and database connections for different blockchain networks. Follow the steps below to configure your `.env` file.

---

### 📝 How to Fill the `.env` File

1. **Copy the Template**:
   - Create a new `.env` file by copying the provided `.env.example` file:
     ```bash
     cp .env.example .env
     ```

2. **Set the Server Port**:
   - Define the port where the API will run. The default is `3001`:
     ```dotenv
     PORT=3001
     ```

3. **Configure the Database Connection**:
   - If you want to use endpoints that use scraped data (get tokens by symbol, get tokens by name, etc.), you need to access a database containing the scraped and parsed data. You can use the [Histori Scraper](https://github.com/Esscrypt/histori-evm-scraper-rust) or create your own and fill up a database table. Set the database connection details for each network you intend to support. Use the format below, replacing `<chain_id>` with the chain ID of the network (e.g., `1` for Ethereum Mainnet).

   Example template for Ethereum Mainnet (`chain_id 1`):
    ```dotenv
    DB_HOST_1=<YOUR_DB_HOST>
    DB_PORT_1=<YOUR_DB_PORT>
    DB_USER_1=<YOUR_DB_USERNAME>
    DB_PASSWORD_1=<YOUR_DB_PASSWORD>
    DB_DATABASE_1=<YOUR_DB_NAME>
    ```

---

### 🔑 Notes:
- Replace the placeholder values (e.g., `<YOUR_DB_HOST>`, `<YOUR_DB_PORT>`, etc.) with actual values specific to your database setup.
- Ensure the database user has sufficient privileges to access and manage the specified database.

With this setup, the application will connect to the appropriate database for each supported blockchain network. If you need further assistance, refer to the [Histori Documentation](https://docs.histori.xyz).

## 📦 Running the Project

**Development Mode**

Start the API in development mode with live-reload for faster iteration:
```bash
npm run start:dev
```

**Production Mode**

Compile and run the project in production mode:
```bash
npm run build
npm run start:prod
```

## 📜 API Documentation

Comprehensive documentation is available at:
[Histori REST API Documentation](https://docs.histori.xyz)

Use the following Swagger URL locally after starting the server:
```bash
http://localhost:3001/api-docs
```

## 📫 Let's Build Together

Explore the power of blockchain history with Histori. Whether you’re a developer, researcher, or visionary, we’re here to support your journey.

- **Website**: [histori.xyz](https://histori.xyz)
- **Docs**: [docs.histori.xyz](https://docs.histori.xyz)
- **Email**: contact@histori.xyz

---

⭐️ From the [Histori Team](https://github.com/orgs/Esscrypt/teams/core) – Your gateway to blockchain insights!