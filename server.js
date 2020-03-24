'use strict';

require('dotenv').config();

const express = require('express');
const app = express();

const superagent = require('superagent');

const ejs = require('ejs');
app.use(express.urlencoded({extended:true}));

app.use(express.static('./public'));

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3001;

app.get('/', (request, response) => {
    // console.log('/hello route');
    response.render('./pages/index.ejs');
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
