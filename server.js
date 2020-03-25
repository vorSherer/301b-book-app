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
})//.catch(err => errorHandler(err, response));

app.get('errors', (request, response) => {
    response.render('./pages/error.ejs');
})

app.get('/searches/new', (request, response) => {
    response.render('./pages/searches/new.ejs');
})//.catch(err => errorHandler(err, response));

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
    })//.catch(err => errorHandler(err, response));
})

//response.body path items.volumeInfo
function Book (obj) {
    const placeholderImage = 'http://i.imgur.com/J5LVHEL.jpg';
    const regex = /^(http:\/\/)/g;
    // console.log('constr title: ', obj.title);     // REMOVE THIS BEFORE FINISHING
    
    this.title = obj.title ? obj.title : 'Title not available';
    this.authors = obj.authors ? obj.authors[0] : 'No single author available';
    this.thumbnail_url = obj.imageLinks ? obj.imageLinks.smallThumbnail.replace(regex, 'https://') : placeholderImage;
    this.description = obj.description ? obj.description : 'Description not provided';
    // this.isbn13 = obj.industryIdentifiers[0].identifier;
}

function errorHandler (err, response) {
    console.error(err);
    if(response) {
        response.status(500).send('Sorry, I can\'t help with that.');
    }
}

app.get('*', (request, response) => {  
    res.status(404).send('Sorry, the page you requested does not exist! :( ');
});



app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
