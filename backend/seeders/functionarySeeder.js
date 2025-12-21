const fs = require('fs');
const path = require('path');
const connectDB = require('../config/database');
const Functionary = require('../models/Functionary');
const mongoose = require('mongoose');

async function seedFunctionaries() {
    try {
        // 1. Connect to Database
        await connectDB();

        // 2. Clear existing data
        await Functionary.deleteMany({});
        console.log('Existing functionary data cleared.');

        // 3. Read JSON data
        const dataPath = path.join(__dirname, '../../frontend/src/data/fungsionaris.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const functionaries = JSON.parse(rawData);

        // 4. Map and Transform Data
        const mappedFunctionaries = functionaries.map(f => {
            return {
                name: f.nama,
                studentId: f.nim,
                position: f.jabatan,
                department: f.departemen,
                period: "2024/2025", // Default period
                photo: f.foto,
                email: f.email,
                phoneNumber: f.kontak || '',
                bio: f.deskripsi || '',
                socialMedia: {
                    instagram: f.instagram || '',
                    linkedin: f.linkedin || '',
                    github: f.github || ''
                },
                isActive: true
            };
        });

        // 5. Insert Data
        await Functionary.insertMany(mappedFunctionaries);
        console.log(`Successfully seeded ${mappedFunctionaries.length} functionaries.`);

        // 6. Close Connection
        await mongoose.connection.close();
        console.log('Database connection closed.');

    } catch (error) {
        console.error('Error seeding functionaries:', error);
        process.exit(1);
    }
}

seedFunctionaries();
