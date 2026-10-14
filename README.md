# Thebrandopedia API

Express and MongoDB backend for Thebrandopedia's Home feed and Discover connections. This repository contains the backend; the Expo app is maintained separately.

## Prerequisites

- Node.js 18 or later and npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- The Expo app project, if you want to run the mobile or web app

## Set up MongoDB

For a local database, install MongoDB Community Server and start the MongoDB service. On Windows, if it was installed as a Windows service, you can start it from an elevated PowerShell window:

```powershell
Start-Service MongoDB
```

The default local connection string is `mongodb://127.0.0.1:27017/thebrandopedia`. MongoDB creates the `thebrandopedia` database and its collections when the seed script first writes data.

Alternatively, create a database in MongoDB Atlas and use its connection string, including the database name, as `MONGODB_URI`.

## Run the backend

From this repository's root directory:

1. Install the dependencies:

   ```sh
   npm install
   ```

2. Create `.env` from the example. In PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   The example configures the local MongoDB URI and port `3000`. If you use Atlas or another port, edit `.env`:

   ```dotenv
   MONGODB_URI=mongodb://127.0.0.1:27017/thebrandopedia
   PORT=3000
   ```

3. Load the sample users and posts:

   ```sh
   npm run seed
   ```

   The seed script can be run again safely: it upserts the same five users and five posts and does not remove existing connection requests.

4. Start the API in development mode:

   ```sh
   npm run dev
   ```

   The API listens on `http://localhost:3000` by default. Use `npm start` to run it without Node's watch mode. Check that it is available at `http://localhost:3000/health`.

## Run the app

The Expo app is not included in this repository. In the app project's directory, set `EXPO_PUBLIC_API_URL` to an address the app can use to reach the backend, then start Expo with `npx expo start`.

The app uses the first seeded user's ID (`64a000000000000000000001`) as its current user. The seeded profile and post image values are filenames for images bundled with the app.

Use the appropriate API address for the device running the app:

| App target | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Web on the same computer | `http://localhost:3000` |
| Android emulator | `http://10.0.2.2:3000` |
| Physical device on the same network | `http://<your-computer-LAN-IP>:3000` |

For example, from the app project's root in PowerShell, start the backend first, then run:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://10.0.2.2:3000"
npx expo start
```

For a physical device, use the computer's LAN IP instead of `10.0.2.2` and make sure the phone and computer are on the same network. The API binds to `0.0.0.0` so it can accept connections from other devices.

## API endpoints

- `GET /health` reports whether the API is available.
- `GET /users` returns users and the `requestedUserIds` for the first seeded user. Pass `?currentUserId=<id>` to get request state for another user.
- `GET /posts` returns posts newest first, with each author populated.
- `POST /connect` accepts `{ "fromUserId": "...", "toUserId": "..." }`. Repeating a request for the same sender and recipient does not create a duplicate.

Run the backend tests with:

```sh
npm test
```
