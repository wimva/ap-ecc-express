# AP ECC Express API

Backend service built with Express and MongoDB for managing users and messages.

## User Endpoints

- `GET /users` — Retrieve all users.
- `GET /users/:id` — Retrieve a user by MongoDB ObjectId.
- `GET /users/by-email?email=<address>` — Retrieve the user identifier by email address.
  - **Success (200):** `{ "id": "<userId>" }`
  - **Missing email (400):** `{ "message": "Email query parameter is required" }`
  - **Not found (404):** `{ "message": "User not found" }`
- `POST /users` — Create a new user.
- `PUT /users/:id` — Update a user.
- `DELETE /users/:id` — Delete a user.

## Running the Service

Ensure you have a `.env` file with `MONGO_URI` defined, then start the server:

```bash
npm install
npm run dev
```

The API will be available at `http://localhost:3000` by default.
