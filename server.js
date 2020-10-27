/*
Page: Server
Student Name: Jean M. de Freitas
Student ID: 301125083
Date: 10/09/2020
*/

// ==========================================
// MONGODB SETUP 
// ==========================================

// Loads MongoDB
var MongoClient = require('mongodb').MongoClient;

// Convert the Contact type String ID to Object ID to DB
var ObjectID = require('mongodb').ObjectID;

// MongoDB database on the cloud
const uri = "mongodb+srv://jeanmf:9e279jk3q5@clusterportfolio.dly4k.azure.mongodb.net/WebDevelopment?retryWrites=true&w=majority";

// ==========================================
// DB FUNCTIONS
// ==========================================

    // Find the contacts data in DB collection
    function findContacts() {
      return MongoClient.connect(uri).then(function(db) {
        var collection = db.db("WebDevelopment").collection('contacts');
        return collection.find({ "name": { "$exists": true } }).sort({'name': 1}).toArray();
      }).then(function(items) {
        return items;
      });
  }
  
    // Update the contact in DB collection using ID
    function updateContact(id, data) {
      return MongoClient.connect(uri).then(function(db) {
        var collection = db.db("WebDevelopment").collection('contacts');
        return collection.updateOne( {_id:id} , {"$set" : data});
      }).then(function(resp) {
        console.log(resp);
      });
    }  
  
    // Delete the contact in DB collection using ID
    function deleteContact(id) {
      return MongoClient.connect(uri).then(function(db) {
        var collection = db.db("WebDevelopment").collection('contacts');
        return collection.deleteOne( {_id:id} );
      }).then(function(err, result) {
        return err;
      });
	}

    // Add contact to DB collection
    function addContact(data) {
      return MongoClient.connect(uri).then(function(db) {
        var collection = db.db("WebDevelopment").collection('contacts');
        return collection.insertOne(data);
      }).then(function(resp) {
        console.log(resp);
      });
    }

// ==========================================
// LOGIN + LOGOUT + SESSION + FUNCTIONS
// ==========================================

var express = require('express');
var app = express();
var ObjectID = require('mongodb').ObjectID;

var hash = require('pbkdf2-password')()
var path = require('path');
var session = require('express-session');

// config
var logged = false;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load the Database functions

// Find contacts 
findContacts().then(function(items) {
  // "Dummy DB" to received all the contacts/data
  var contacts = items;
  // verify in terminal if the function findContacts is getting the contacts
  console.log(items);

  // user and pass used to do log in
  var users = [{username: 'jeanmf@live.com', pass: '12345', name: 'User'}];
  app.use(express.urlencoded({ extended: false }))
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'this is secret'
  }));

  // Login error message
  app.use(function(req, res, next){
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    // if the user wrong the user/pass or try to go direct to 
    // business contacts page, it will get an error msg
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    next();
  });

  function hashUsers(){
    users.forEach(user => {
      hash({ password: user.pass }, function (err, pass, salt, hash) {
        if (err) throw err;
        user.salt = salt;
        user.hash = hash;
      });
    });
  }

  hashUsers();

  // Authenticate the user, check user/pass and after hash it
  function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    var curr_user = {};
    users.forEach(user => {
    if(user.username === name){
      curr_user = user;
    }
    });
    hash({ password: pass, salt: curr_user.salt }, function (err, pass, salt, hash) {
      if (err) return fn(err);
      if (hash === curr_user.hash) return fn(null, curr_user)
      fn(new Error('invalid password'));
    });
  }

  // Verify if the user is logged in, before redirect to business contact page
  function verifySession(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.session.error = 'You need to do log in first!';
      res.redirect('/login#LG');
    }
  }

  // business contacts page route
  app.get('/business_contacts', verifySession, function(req, res){
    res.render('pages/business_contacts', {users : contacts});
  });

  app.get('/business_contacts/delete/:id', function(req, res){
    let id = new ObjectID(req.params.id);
    // delete the contact using its ID
    deleteContact(id).then(function(err) {
      console.log(err);
      // update the contacts in DB and table
      findContacts().then(function(items) {
        contacts = items;
        res.redirect('/business_contacts#BC');
      });
    });
  });

  app.post('/business_contacts/edit/:id', function(req, res){
    let data = req.body;
    let id = new ObjectID(req.params.id);
    data._id = id;
    // update the contact edited
    updateContact(id, data).then(function(err) {
      console.log(err);
      // update the contacts in DB and table
      findContacts().then(function(items) {
        contacts = items;
        res.redirect('/business_contacts#BC');
      });
    });
  });

  app.post('/business_contacts/add', function(req, res){
    let data = req.body;
    // add the contact using the addContact function
    addContact(data).then(function(err) {
      console.log(err);
      // update the contacts in DB and table
      findContacts().then(function(items) {
        contacts = items;
        res.redirect('/business_contacts#BC');
      });
    });
  });

  // End the user's session doing log out
  app.get('/logout', function(req, res){
    logged = false;
    req.session.destroy(function(){
      res.redirect('/');
    });
  });

  // login page route
  app.get('/login', function(req, res){
    res.render('pages/login', {logged: logged});
    // if not logged it direct to login page
    /*
    if(logged == false){
      res.render('pages/login', {logged: logged});
    }
    // if logged it will redirect to business contacts page
    else{
      res.redirect('/business_contacts#BC');
    }*/
  });

  // Do log in and create the session
  app.post('/login', function(req, res){
    authenticate(req.body.username, req.body.password, function(err, user){
      if (user) {
        req.session.regenerate(function(){
          req.session.user = user;
        logged = true;
          res.redirect('/business_contacts#BC');
        });
      } else {
      logged = false;
        req.session.error = 'Something went wrong! Try again!';
        res.redirect('/login#LG');
      }
    });
  });

// ==========================================
// ROUTES
// ==========================================

// index page 
app.get('/', function(req, res) {
	res.render('pages/index');
});

// about page 
app.get('/about', function(req, res) {
	res.render('pages/about');
});

// projects page 
app.get('/projects', function(req, res) {
	res.render('pages/projects');
});

// services page 
app.get('/services', function(req, res) {
	res.render('pages/services');
});

// contact page 
app.get('/contact', function(req, res) {
	res.render('pages/contact');
});

// Access to assets
app.use('/public', express.static('public'));

// Start Server -> Command for Heroku or localhost:3000
app.listen(process.env.PORT || 3000, 
	() => console.log("Server started."));

}, function(err) {
	console.error('Unhandled promise rejection', err, err.stack);
  });