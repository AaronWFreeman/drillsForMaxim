const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const {toDoTasks} = require('./models');

const seedData = require('./db/todos.json');

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());

app.get('/v1/todos', (req, res, next) => {
  toDoTasks.find()
  // working backward:
  // todos represents the information inside toDoTasks
  // todo represents one single instance of todos
  // serialize each todo, then map the serialized todo instances to todos
  // which still represents the info inside toDoTasks, then
  // return that whole thing in the form of a json response
  // then use the .find() method to return the first/all? element(s) in toDoTasks that
  // meet the criteria of the serialize/map/json methods

    .then(todos => res.json(todos.map(todo => todo.serialize())))
  // call the next function
    .catch(next);
});

app.get('/v1/todos/:id', (req, res, next) => {
  // basically the same thing as the GET above, only it's creating a variable for
  // id (assigning it to the value of the id from the request object), so that it
  // can be passed down to the findById method and later serialized,
  // then returned in the form of json
  const id = req.params.id;
  toDoTasks.findById(id)
    .then(item => {
      if (item) {
        res.json(item.serialize());
      } else {
        next();
      }
    })
    .catch(next);
});

app.post('/v1/todos', (req, res, next) => {
  // destructured {title} is unpacking its value
  // from the 'models' module
  // then saying that the incoming request is
  // actually the new title being created
  const { title } = req.body;
  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  // Using promises
  toDoTasks.create({title})
  // create a new todo task w/ title (informed by 'models' module),
  // which is equal to the req.body on line 46
  //
    .then(newItem => {
      // return 201 status, which means "created"
      res.status(201)
      // create a new url with newItem appended, according to its id
        .location(`${req.originalUrl}/${newItem.id}`)
        // serialize each newItem which represents a new instance within toDoTasks
        // then return that serialized instance in the form of JSON
        .json(newItem.serialize());
  })
    .catch(next);

});

app.put('/v1/todos/:id', (req, res, next) => {
  const id = req.params.id;
  /***** Never trust users - validate input *****/
  const updateItem = {};
  const updateableFields = ['title', 'completed'];
  // forEach array method is applied to the variable updateableFields,
  // which is an array of two fields.
  updateableFields.forEach(field => {
    // field represents a single field within the array
    // if the field is in the request body, then change the prior field within
    // updateItem array to the new field.
    if (field in req.body) {
      updateItem[field] = req.body[field];
    }
  });
  /***** Never trust users - validate input *****/
  if (!updateItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  // Using promises
  // Once updateItem has been populated by the newly updated title (lines 78/87),
  // use the findByIdAndUpdate mongoDB method on toDoTasks, which is an imported schema
  // from the models module. It takes three arguments, ID of post, populated object which you are
  // passing to the function (updateItem), and assigning its truthiness.
  toDoTasks.findByIdAndUpdate(id, updateItem, { new: true })
    // use a promise
    .then(item => {
      // item represents a single instance within updateItem
      if (item) {
        // if the item is truthy, respond by serializing that item
        // then returning its value in the form of json
        res.json(item.serialize());
      } else {
        // call the next function for all other cases
        next();
      }
    })
    .catch(next);
});

app.delete('/v1/todos/:id', (req, res, next) => {
  // same as the GET request with ID parameters
  const id = req.params.id;
  // Using promises
  toDoTasks.findByIdAndRemove(id)
    .then(count => {
      if (count) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(next);
});

// 404 catch-all
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: (process.env.NODE_ENV === 'development') ? err : {}
  });
});


if (require.main === module) {
  console.log('============ SERVER RUNNING ==========')
  mongoose.connect(DATABASE_URL, { useMongoClient: true })
    .then(() => {
      toDoTasks.insertMany(seedData);
    })
    .catch(err => {
      console.error('ERROR: Mongoose failed to connect! Is the database running?');
      console.error(err);
    });

    app.listen(PORT, function () {
      console.log('Your app is listening on port ' + this.address().port);
    });
}

module.exports = app; // Export for testing
