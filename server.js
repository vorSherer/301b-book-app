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

const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);

client.on('error', err => console.error(err));   // TODO: write a new errorHandler to render only this error to the page without a response.



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
    })//.catch(err => errorHandler(err, response));
})

app.post('/books', (request, response) => {
    console.log(request.body);
    let{title, description} = request.body;
    let sql = 'INSERT INTO savedbooks (title, description) VALUES ($1, $2) RETURNING id;';
    let safeValues = [title, description];
    client.query(sql, safeValues)
    .then(results => {
        console.log(results.rows);
        let id = results.rows.id;
        // find matching book id, render that to a details page.
    })
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
    // response.render('./pages/error.ejs', {error:'status 500, Not found.'});
    err = 'Sorry, not a valid search.'
    response.render('./pages/error.ejs', {error:(err)});
}

app.get('*', (request, response) => {  
    response.status(404).send('Sorry, the page you requested does not exist! :( ');
});


client.connect()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
});

