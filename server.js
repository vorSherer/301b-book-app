'use strict';

require('dotenv').config();

const express = require('express');
const app = express();

const superagent = require('superagent');
const methodOverride = require('method-override');

const ejs = require('ejs');
app.use(express.urlencoded({extended:true}));

app.use(express.static('./public'));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3001;

const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);

client.on('error', err => clientErrorHandler(err));

function clientErrorHandler (err) {
    err = 'Sorry, nothing from the database on that.'
    response.render('./pages/error.ejs', {error:(err)});
}



app.get('/', renderHomepage);
app.get('/searches/new', bookRequestPageHandler);
app.post('/searches', bookFetchHandler);
app.post('/books', addBookHandler);

//..................... Homepage view function ........................//
function renderHomepage(request, response) {
    let sql = 'SELECT * FROM savedbooks;';
    client.query(sql)
    .then(results => {
        let books = results.rows;
        let bookCount = books.length;
        console.log('book count ', bookCount);     // REMOVE THIS BEFORE FINISHING
        response.render('./pages/index.ejs', {booksArray: books, bookCount}); // not doing anything yet with bookCount on index page.
    })
}

//..................... Display Book Search Page function ........................//
function bookRequestPageHandler(request, response) {
    response.render('./pages/searches/new.ejs');
}

//.....................Initial Book Search function ........................//
function bookFetchHandler(request, response) {
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
}

//..................... Book Constructor function ........................//
function Book (obj) {
    const placeholderImage = 'http://i.imgur.com/J5LVHEL.jpg';
    const regex = /^(http:\/\/)/g;
    
    this.title = obj.title ? obj.title : 'Title not available';
    this.authors = obj.authors ? obj.authors[0] : 'No single author available';
    this.thumbnail_url = obj.imageLinks ? obj.imageLinks.smallThumbnail.replace(regex, 'https://') : placeholderImage;
    this.description = obj.description ? obj.description : 'Description not provided';
    this.isbn13 = obj.industryIdentifiers[0].identifier;
}

//.....................Add Book function ........................//

function addBookHandler(request, response) {
    // console.log(request.body);     // REMOVE THIS BEFORE FINISHING
    let myBookshelf = '';
    let{title, authors, isbn13, thumbnail_url, description} = request.body;
    let sql = 'INSERT INTO savedbooks (title, authors, isbn13, thumbnail_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;';
    let safeValues = [title, authors, isbn13, thumbnail_url, description, myBookshelf];
    // added return in front of client
    return client.query(sql, safeValues)
    .then(results => {
        let id = results.rows[0].id;
        // commented out 101 per Chance
        console.log(results.rows[0])     // REMOVE THIS BEFORE FINISHING
        // response.redirect(`./pages/books/show.ejs/${id}`)
        response.redirect(`/books/${results.rows[0].id}`)   
        // find matching book id, render that to a details page.
    }).catch(err => errorHandler(err, response)) 
}

//.....................Select Book From Database function ........................//
app.get('/books/:id', (request, response) => {
    getBookshelves()
      .then(shelves => {
        let sql = 'SELECT * FROM savedbooks WHERE id=$1;';
        let safeValue = [request.params.id];
        client.query(sql, safeValue)
          .then(results => {
            let singleBook = results.rows[0];
            response.render('./pages/books/show.ejs', {book: singleBook, bookshelves: shelves.rows});
        }).catch(err => errorHandler(err, response));
    });
});

function getBookshelves() {
    let SQL = 'SELECT DISTINCT bookshelf FROM savedbooks ORDER BY bookshelf;';
    return client.query(SQL);
}

  //..................... Update Book in Database function ........................//
app.put('/books/:id', updateBookshelf);

function updateBookshelf(request,response) {
    // console.log(response.body);     // REMOVE THIS BEFORE FINISHING
    let{title, authors, isbn13, thumbnail_url, description, bookshelf} = request.body;
    let sql = `UPDATE savedbooks SET title=$1, authors=$2, isbn13=$3, thumbnail_url=$4, description=$5, bookshelf=$6 WHERE id=$7;`;
    let safeValues = [title, authors, isbn13, thumbnail_url, description, bookshelf, request.params.id];
    client.query(sql, safeValues)
      .then(response.redirect(`/books/${request.params.id}`))
      .catch(err => errorHandler(err, response));
}




//..................... Delete Book From Database function ........................//
// function deleteBook(request, response) {
//     // get the id from the param
//     let id = request.params.book_id;
//     // deconstruct the request
//     let {//(request.body key1, e.g.,)//title, description} = request.body;
//     //search the database for the id that matches
//     // let sql = 'SELECT * FROM savedbooks WHERE id=$1;';
//     // let safeValues = [id];
//     //update the information in the database
//     let sql = 'UPDATE savedbooks SET {columnName}=$1, {columnName2}=$2, {columnName3}=$3, etc... WHERE id=$last;';
//     let safeValues = [id];
//     // redirect to the task

// }

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

