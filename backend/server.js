require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const authRouter = require('./routes/auth');
const transactionsRouter = require('./routes/transactions');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'laporan_keuangan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use((req, res, next) => { req.db = pool; next(); });

app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);

app.get('/', (req, res) => res.send('API Laporan Keuangan berjalan'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server berjalan di http://localhost:${port}`));
