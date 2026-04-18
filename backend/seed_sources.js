const mongoose = require('mongoose');
const { SourceCredibility } = require('./src/models/Source');
require('dotenv').config();

const seedSources = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const sources = [
            {
                sourceName: 'National Geographic',
                sourceURL: 'https://www.nationalgeographic.com',
                sourceCategory: 'Science',
                authorityScore: 95,
                accuracyScore: 98,
                recencyScore: 90,
                overallScore: 94,
                status: 'verified',
                vetNote: 'Top-tier scientific and geographical resource.',
                isOfficial: true
            },
            {
                sourceName: 'NASA Earth Observatory',
                sourceURL: 'https://earthobservatory.nasa.gov',
                sourceCategory: 'Science',
                authorityScore: 100,
                accuracyScore: 100,
                recencyScore: 95,
                overallScore: 98,
                status: 'verified',
                vetNote: 'Definitive source for space-based visibility claims.',
                isOfficial: true
            },
            {
                sourceName: 'Encyclopedia Britannica',
                sourceURL: 'https://www.britannica.com',
                sourceCategory: 'Encyclopedia',
                authorityScore: 98,
                accuracyScore: 99,
                recencyScore: 85,
                overallScore: 94,
                status: 'verified',
                vetNote: 'Highly reliable historical and general knowledge base.',
                isOfficial: true
            },
            {
                sourceName: 'History Channel',
                sourceURL: 'https://www.history.com',
                sourceCategory: 'Educational',
                authorityScore: 85,
                accuracyScore: 80,
                recencyScore: 90,
                overallScore: 85,
                status: 'verified',
                vetNote: 'Good for historical overview and cultural context.',
                isOfficial: false
            },
            {
                sourceName: 'Scientific American',
                sourceURL: 'https://www.scientificamerican.com',
                sourceCategory: 'Science',
                authorityScore: 92,
                accuracyScore: 95,
                recencyScore: 95,
                overallScore: 94,
                status: 'verified',
                vetNote: 'Peer-reviewed scientific journalism.',
                isOfficial: false
            }
        ];

        // Clear existing and add new
        // await SourceCredibility.deleteMany({});
        for (const s of sources) {
            await SourceCredibility.updateOne(
                { sourceURL: s.sourceURL },
                { $set: s },
                { upsert: true }
            );
        }

        console.log('Sources seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedSources();
