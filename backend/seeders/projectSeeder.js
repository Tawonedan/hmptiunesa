const fs = require('fs');
const path = require('path');
const connectDB = require('../config/database');
const Project = require('../models/Project');
const mongoose = require('mongoose');

async function seedProjects() {
    try {
        // Koneksi ke database
        await connectDB();

        // Hapus semua data project yang ada
        await Project.deleteMany({});
        console.log('Data proyek yang ada telah dihapus');

        // Baca file projects.json
        const projectsDataPath = path.join(__dirname, '../../frontend/src/data/projects.json');
        const rawData = fs.readFileSync(projectsDataPath, 'utf8');
        const data = JSON.parse(rawData);
        const projectItems = data.projectItems || (Array.isArray(data) ? data : []);

        const projects = projectItems.map(item => {
            // Konversi year ke startDate (Jan 1st of that year)
            const year = parseInt(item.year) || new Date().getFullYear();
            const startDate = new Date(year, 0, 1);

            // Konversi team (array of strings) ke schema team objects
            const team = (item.team || []).map(name => ({
                name: name,
                role: 'Member' // Default role
            }));

            // Map links
            const links = {};
            if (item.link) links.website = item.link;
            if (item.github) links.github = item.github;

            return {
                title: item.title,
                description: item.description, // Benefits are currently ignored as they don't fit schema directly
                category: item.category,
                status: 'completed', // Assuming listed projects are completed/showcased
                thumbnail: item.image,
                images: item.detailImage ? [item.detailImage] : [],
                startDate: startDate,
                team: team,
                technologies: item.tags || [],
                links: links,
            };
        });

        // Menyimpan data ke database
        const result = await Project.insertMany(projects);
        console.log(`${result.length} proyek berhasil ditambahkan ke database`);

        // Menutup koneksi
        await mongoose.connection.close();
        console.log('Koneksi ditutup. Seeding data proyek selesai!');

    } catch (error) {
        console.error('Error saat seeding proyek:', error);
        process.exit(1);
    }
}

// Jalankan seeder
seedProjects();
