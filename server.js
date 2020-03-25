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
    // console.log('/hello route');     // REMOVE THIS BEFORE FINISHING
    response.render('./pages/index.ejs');
})

app.get('/searches/new', (request, response) => {
    response.render('./pages/searches/new.ejs');
})

app.post('/searches', (request, response) => {
    // console.log('req.body: ', request.body);     // REMOVE THIS BEFORE FINISHING
    let searchItem = request.body.search[0]
    let titleOrAuthor = request.body.search[1];
  
    let url = 'https://www.googleapis.com/books/v1/volumes?q='
  
    if(titleOrAuthor === 'title') {
      url += `+intitle:${searchItem}`;
    } else if(titleOrAuthor === 'author') {
    url += `+inauthor:${searchItem}`;
    }

    superagent.get(url)
    .then(results => {
        // console.log('res.body: ', results.body);     // REMOVE THIS BEFORE FINISHING
        let bookArr = results.body.items;
        // console.log('bookArr[0].volInfo: ', bookArr[0].volumeInfo);     // REMOVE THIS BEFORE FINISHING
        let returnSample = bookArr.map(book => {
        return new Book(book.volumeInfo);
    })
    response.render('./pages/searches/show.ejs', {books:returnSample})
    })
})

//response.body path items.volumeInfo
function Book (obj) {
    const placeholderImage = 'http://i.imgur.com/J5LVHEL.jpg';

    // console.log('constr title: ', obj.title);     // REMOVE THIS BEFORE FINISHING
    
    this.title = obj.title || 'Title not available';
    this.authors = obj.authors[0] || 'No single author available';
    this.thumbnail_url = obj.imageLinks.smallThumbnail || placeholderImage;
    this.description = obj.description;
    // this.isbn13 = obj.industryIdentifiers[0].identifier;
}

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
