'use strict';

require('dotenv').config();

const express = require('express');
const app = express();

const superagent = require('superagent');

const ejs = require('ejs');
app.use(express.static('./public'));

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
