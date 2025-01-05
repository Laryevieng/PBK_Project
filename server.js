const express = require("express");
const multer = require("multer");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const app = express();

// Konfigurasi Express dan EJS
app.set("view engine", "ejs");
app.use(express.static("public")); // Untuk file statis
app.use(bodyParser.urlencoded({ extended: true }));

// Konfigurasi MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Ganti dengan username MySQL Anda
  password: "", // Ganti dengan password MySQL Anda
  database: "db_pbk", // Ganti dengan nama database Anda
});

// Tes koneksi database
db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to database.");
});

// Konfigurasi Multer untuk upload file
const upload = multer({ storage: multer.memoryStorage() });

// Halaman utama (form upload dan daftar gambar)

app.get("/", (req, res) => {
  res.render("index", { title: "homepage" }); // Render the 'informasi.ejs' template
});
app.get("/informasi", (req, res) => {
  res.render("informasi", { title: "Informasi" }); // Render the 'informasi.ejs' template
});
app.get("/profile", (req, res) => {
  res.render("profile", { title: "profile" }); // Render the 'informasi.ejs' template
});
app.get("/bph", (req, res) => {
  res.render("bph", { title: "bph" }); // Render the 'informasi.ejs' template
});

app.get("/demis", (req, res) => {
  const sql = "SELECT id, nama FROM gambar";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal mengambil data gambar.");
    }
    res.render("demis", { gambar: results });
  });
});

app.get("/admin", (req, res) => {
  const sql = "SELECT id, nama FROM gambar";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal mengambil data gambar.");
    }
    res.render("admin", { gambar: results });
  });
});

// Endpoint upload gambar
app.post("/upload", upload.single("gambar"), (req, res) => {
  const nama = req.body.nama;
  const gambar = req.file.buffer; // File dalam bentuk buffer

  const sql = "INSERT INTO gambar (nama, file_gambar) VALUES (?, ?)";
  db.query(sql, [nama, gambar], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal menyimpan gambar.");
    }
    res.redirect("/"); // Redirect ke halaman utama
  });
});

// Endpoint untuk menampilkan gambar berdasarkan ID
app.get("/gambar/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT file_gambar FROM gambar WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal mengambil gambar.");
    }
    if (result.length === 0) {
      return res.status(404).send("Gambar tidak ditemukan.");
    }
    res.setHeader("Content-Type", "image/jpeg");
    res.send(result[0].file_gambar);
  });
});

// Jalankan server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
