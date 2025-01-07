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
  const sql =
    "SELECT event_id, event_type, title, description, event_date FROM events";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal mengambil data acara.");
    }
    res.render("informasi", { events: results });
  });
});
app.get("/profile", (req, res) => {
  res.render("profile", { title: "profile" }); // Render the 'informasi.ejs' template
});
// Rute untuk mendapatkan data dari tabel BPH
// Route untuk BPH
app.get("/bph", (req, res) => {
  const sql = "SELECT gambar, nama, jabatan FROM bph";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal mengambil data BPH.");
    }
    res.render("bph", { anggota: results }); // Mengirim data ke halaman EJS
  });
});

// Route untuk Internal
app.get("/internal", (req, res) => {
  const sql = "SELECT gambar, nama, jabatan FROM internal";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal mengambil data Internal.");
    }
    res.render("internal", { anggota: results }); // Mengirim data ke halaman EJS
  });
});

// Route untuk Akademis
app.get("/akademis", (req, res) => {
  const sql = "SELECT gambar, nama, jabatan FROM akademis";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal mengambil data Akademis.");
    }
    res.render("akademis", { anggota: results }); // Mengirim data ke halaman EJS
  });
});

// Route untuk Eksternal
app.get("/eksternal", (req, res) => {
  const sql = "SELECT gambar, nama, jabatan FROM eksternal";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal mengambil data Eksternal.");
    }
    res.render("eksternal", { anggota: results }); // Mengirim data ke halaman EJS
  });
});

// Route untuk Medinfo
app.get("/medinfo", (req, res) => {
  const sql = "SELECT gambar, nama, jabatan FROM medinvo";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal mengambil data Medinfo.");
    }
    res.render("medinfo", { anggota: results }); // Mengirim data ke halaman EJS
  });
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
app.get("/admin-pengurus", (req, res) => {
  const sql = `
    SELECT 'bph' AS divisi, id, nama, jabatan, gambar FROM bph
    UNION ALL
    SELECT 'akademis' AS divisi, id, nama, jabatan, gambar FROM akademis
    UNION ALL
    SELECT 'eksternal' AS divisi, id, nama, jabatan, gambar FROM eksternal
    UNION ALL
    SELECT 'internal' AS divisi, id, nama, jabatan, gambar FROM internal
    UNION ALL
    SELECT 'medinvo' AS divisi, id, nama, jabatan, gambar FROM medinvo
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal mengambil data pengurus.");
    }
    res.render("admin-pengurus", { pengurus: results }); // Mengirim data ke template EJS
  });
});

app.post("/upload_struktural", upload.single("gambar"), (req, res) => {
  const { nama, divisi, jabatan } = req.body;

  if (!req.file) {
    return res.status(400).send("File gambar tidak diunggah.");
  }

  const gambar = req.file.buffer;

  const sql = `INSERT INTO ${divisi} (nama, jabatan, gambar) VALUES (?, ?, ?)`;
  db.query(sql, [nama, jabatan, gambar], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Gagal menambahkan data.");
    }
    res.redirect("/admin-pengurus");
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
    res.redirect("/admin"); // Redirect ke halaman utama
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
