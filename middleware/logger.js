const fs = require('fs');
const path = require('path');

const logger = (req, res, next) => {
    const log = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | IP: ${req.ip}\n`;
    fs.appendFile(path.join(__dirname, '..', 'requests.log'), log, err => {
        if (err) console.error('Logging error:', err);
    });
    next();
};

module.exports = logger;
