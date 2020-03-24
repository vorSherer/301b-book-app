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

app.get('/searches/new', (request, response) => {
    response.render('./pages/searches/new.ejs');
})

app.post('/searches', (request, response) => {
    console.log(request.body);
    let searchItem = request.body.search[0]
    let titleOrAuthor = request.body.search[1];
  
    let url = 'https://www.googleapis.com/books/v1/volumes?q='
  
    if(titleOrAuthor === 'title') {
      url += `+intitle:${searchItem}`;
    } else if(titleOrAuthor === 'author') {
    url += `+inauthor:${searchItem}`;
    }
    // superagent.get(url)
    // console.log(url);
    // .then(results => {
    //     // process results and send to constructor

    // })
})

//response.body path items.volumeInfo
function Book (obj) {
    this.title = obj.title;
    this.authors = obj.authors;
    this.thumbnail_url = obj.imageLinks.smallThumbnail;
    this.description = obj.
    this.isbn13 = obj.industryIdentifiers.identifier[0];
}

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
