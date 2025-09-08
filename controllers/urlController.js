const Url = require('../models/urlModel');
const generateShortcode = require('../utils/shortcodeGenerator');
const { isWebUri } = require('valid-url');

exports.createShortUrl = async (req, res) => {
    try {
        const { url, validity = 30, shortcode } = req.body;

        if (!url || !isWebUri(url)) {
            return res.status(400).json({ error: "Invalid URL format" });
        }

        let finalShortcode = shortcode || generateShortcode();

        if (shortcode) {
            const exists = await Url.findOne({ shortcode });
            if (exists) {
                return res.status(409).json({ error: "Shortcode already in use" });
            }
        } else {
            let exists = await Url.findOne({ shortcode: finalShortcode });
            while (exists) {
                finalShortcode = generateShortcode();
                exists = await Url.findOne({ shortcode: finalShortcode });
            }
        }

        const expiry = new Date(Date.now() + validity * 60000);

        const newUrl = new Url({
            originalUrl: url,
            shortcode: finalShortcode,
            expiry: expiry
        });

        await newUrl.save();

        return res.status(201).json({
            shortLink: `${process.env.BASE_URL}/${finalShortcode}`,
            expiry: expiry.toISOString()
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};

exports.getUrlStats = async (req, res) => {
    try {
        const { shortcode } = req.params;
        const urlData = await Url.findOne({ shortcode });

        if (!urlData) {
            return res.status(404).json({ error: "Shortcode not found" });
        }

        return res.json({
            totalClicks: urlData.clicks.length,
            originalUrl: urlData.originalUrl,
            createdAt: urlData.createdAt,
            expiry: urlData.expiry,
            clicks: urlData.clicks
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};

exports.redirectUrl = async (req, res) => {
    try {
        const { shortcode } = req.params;
        const urlData = await Url.findOne({ shortcode });

        if (!urlData) {
            return res.status(404).json({ error: "Shortcode not found" });
        }

        if (new Date() > urlData.expiry) {
            return res.status(410).json({ error: "Link expired" });
        }

        urlData.clicks.push({
            referrer: req.get('Referrer') || 'direct',
            location: req.ip
        });
        await urlData.save();

        return res.redirect(urlData.originalUrl);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};
