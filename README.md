# Thebrandopedia API

Local Express and MongoDB API for the Home feed and Discover connections.

## Run locally

1. Install and start MongoDB locally.
2. In this directory, copy `.env.example` to `.env` and set `MONGODB_URI` if needed.
3. Install dependencies and insert the seed data:

   ```sh
   npm install
   npm run seed
   ```

4. Start the API:

   ```sh
   npm run dev
   ```

The API listens on `http://localhost:3000`. `GET /health` can be used to check the server.
The seed script is repeatable: it upserts the same five user and post IDs, and leaves existing
connection requests intact.

## Endpoints

- `GET /users` returns all users and a `requestedUserIds` array for the first seeded user.
  Optionally pass `?currentUserId=<id>` to return the request state for another user. The app uses
  the requested IDs to restore the Request/Requested state after reloading.
- `GET /posts` returns posts newest first, with the author populated as a user object.
- `POST /connect` accepts `{ "fromUserId": "...", "toUserId": "..." }`. Requests are unique per
  sender/recipient pair; repeating a request does not create another record.

## App connection

The Expo app uses the first seeded user's ID (`64a000000000000000000001`) as its current user.
Set `EXPO_PUBLIC_API_URL` before starting Expo to point the app at the API:

- Web: `http://localhost:3000`
- Android emulator: `http://10.0.2.2:3000`
- Physical device: `http://<your-computer-LAN-IP>:3000`

Example for PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://10.0.2.2:3000"
npm run start
```

The profile and post image fields are filenames from the app's existing `assets` folders; the app
uses these filenames to display the bundled images.
