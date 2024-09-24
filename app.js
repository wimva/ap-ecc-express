import express from 'express';
import dotenv from 'dotenv';
import testRoute from './routes/test.js';
import indexRoute from './routes/index.js';
import messagesRoute from './routes/messages.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/', indexRoute);
app.use('/test', testRoute);
app.use('/messages', messagesRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
