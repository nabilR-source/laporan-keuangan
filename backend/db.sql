CREATE DATABASE IF NOT EXISTS laporan_keuangan;
USE laporan_keuangan;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  tanggal DATE NOT NULL,
  jenis ENUM('pemasukan','pengeluaran','saving') NOT NULL,
  kategori VARCHAR(100),
  nominal BIGINT NOT NULL,
  metode_pembayaran VARCHAR(50),
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- sample user (password: 'password' hashed not provided here; create user via API or manually)
