require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const logger = require('./middleware/logger');
const urlRoutes = require('./routes/urlRoutes');

const app = express();

app.use(express.json());
app.use(logger);

app.use('/', urlRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
