import 'dotenv/config';
import app from './app.js';

// Render sets PORT; locally it defaults to 5000 (the port the Vite dev proxy expects).
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`HRR API listening on ${HOST}:${PORT}`);
});
