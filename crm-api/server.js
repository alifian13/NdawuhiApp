// crm-api/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware (Keamanan & Parsing JSON)
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- ROUTES DASAR --- //

// 1. Route Test (Untuk mengecek apakah server hidup)
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Omnichannel CRM API!" });
});

// 2. Route Daftar User Baru (Siswa/Tutor/Staff)
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Simpan ke database menggunakan Prisma
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // Catatan: Di tahap produksi, password harus di-hash pakai bcrypt!
                role
            }
        });

        res.status(201).json({ 
            message: "User berhasil dibuat", 
            user: newUser 
        });
    } catch (error) {
        res.status(500).json({ error: "Gagal membuat user", detail: error.message });
    }
});

// 3. Route Tarik Data Semua Tutor & Siswa (Untuk Staff Kantor)
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await prisma.user.findMany({
            where: {
                role: { in: ['SISWA', 'TUTOR'] }
            },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: "Gagal mengambil data kontak" });
    }
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`🚀 Server CRM berjalan di http://localhost:${PORT}`);
});