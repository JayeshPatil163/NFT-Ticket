# NFT Ticket Backend

This is the backend for the NFT Ticket application. It is built using Node.js and Express.

## Project Structure

```
Backend
├── src
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── middlewares
│   ├── config
│   └── app.js
├── tests
└── package.json
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd Backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the server, run:
```
npm start
```

The server will run on `http://localhost:3000`.

## API Endpoints

- **GET /items**: Retrieve all items.
- **POST /items**: Create a new item.

## Testing

To run the tests, use:
```
npm test
```

## License

This project is licensed under the MIT License.