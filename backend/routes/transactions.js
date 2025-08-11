const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ubah-ini-dengan-rahasia';

// middleware auth (optional) - if Authorization header present, attach user
async function authOptional(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return next();
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch (e) {
    // ignore invalid token
  }
  next();
}

router.use(authOptional);

// GET transactions (optionally filter by user_id if logged in)
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT * FROM transactions ORDER BY tanggal DESC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// POST create transaction
router.post('/', async (req, res) => {
  try {
    const { tanggal, jenis, kategori, nominal, metode_pembayaran, keterangan } = req.body;
    const user_id = req.user ? req.user.id : null;
    const q = `INSERT INTO transactions (user_id, tanggal, jenis, kategori, nominal, metode_pembayaran, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await req.db.query(q, [user_id, tanggal, jenis, kategori, nominal, metode_pembayaran, keterangan]);
    const [rows] = await req.db.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan transaksi' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await req.db.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.affectedRows === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus transaksi' });
  }
});

module.exports = router;
