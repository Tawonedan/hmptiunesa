require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('../models/Member');
const fs = require('fs');
const path = require('path');

// Sambungkan ke database (jika dijalankan langsung)
if (require.main === module) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('MongoDB Connected for Seed');
            seedMembers();
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

const seedMembers = async () => {
    try {
        // Baca data dari file JSON
        const dataPath = path.join(__dirname, '../../frontend/src/data/members.json');

        if (!fs.existsSync(dataPath)) {
            console.error('File members.json tidak ditemukan di:', dataPath);
            process.exit(1);
        }

        const membersRaw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        console.log(`Ditemukan ${membersRaw.length} data anggota dalam file JSON.`);

        // Hapus data lama (opsional, hati-hati di production)
        await Member.deleteMany({});
        console.log('Data anggota lama dihapus.');

        // Map data JSON ke format Schema Mongoose
        const membersToInsert = membersRaw.map(item => {
            // Tentukan status aktif
            const isActive = item.status && item.status.toLowerCase() === 'aktif';

            // Parse tahun angkatan
            const yearJoined = parseInt(item.angkatan) || new Date().getFullYear();

            return {
                name: item.nama,
                studentId: item.nim,
                email: item.email || `${item.nim}@mhs.unesa.ac.id`, // Fallback email jika kosong
                batch: item.angkatan,
                department: 'S1 Teknik Informatika', // Default value karena required di schema
                yearJoined: yearJoined,
                photo: item.foto,
                phoneNumber: item.kontak || '',
                address: '', // Tidak ada di JSON
                socialMedia: {
                    instagram: item.instagram || '',
                    linkedin: item.linkedin || '',
                    github: item.github || ''
                },
                interests: [], // Convert array if needed: item.keahlian || [],
                skills: [], // item.keahlian || [],
                membership: {
                    isActive: isActive,
                    membershipType: 'regular',
                    joinDate: new Date(yearJoined, 7, 1) // Asumsi masuk bulan Agustus
                }
            };
        });

        // Validasi duplikat email/nim sebelum insert (meskipun Mongoose akan error, lebih baik filter dulu)
        // Untuk bulk insert yang aman, kita bisa gunakan ordered: false agar yang error (duplikat) di-skip tapi sisanya lanjut
        // Tapi deleteMany sudah dijalankan, jadi harusnya aman dari duplikat di DB, kecuali ada duplikat di JSON source

        // Insert ke database
        // Gunakan chunk jika data sangat banyak (> 1000)
        const chunkSize = 500;
        let insertedCount = 0;

        for (let i = 0; i < membersToInsert.length; i += chunkSize) {
            const chunk = membersToInsert.slice(i, i + chunkSize);
            try {
                await Member.insertMany(chunk, { ordered: false });
                insertedCount += chunk.length;
                console.log(`Berhasil insert chunk ${i} - ${i + chunk.length}`);
            } catch (error) {
                console.warn(`Warning pada chunk ${i}:`, error.message);
                // Jika error bulk, lanjutkan (karena ordered: false, yang sukses tetap masuk)
                if (error.insertedDocs) {
                    insertedCount += error.insertedDocs.length;
                }
            }
        }

        console.log(`Seeding selesai! Total anggota berhasil diimport: ${insertedCount}`);

        if (require.main === module) {
            process.exit();
        }
    } catch (error) {
        console.error('Gagal seeding members:', error);
        if (require.main === module) {
            process.exit(1);
        }
    }
};

module.exports = seedMembers;
