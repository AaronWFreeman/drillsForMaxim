'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const toDoTaskSchema = new mongoose.Schema({
  title: String,
  completed: {type: Boolean, default: false}
});

toDoTaskSchema.methods.serialize = function() {
  retur
}

const toDoTasks = mongoose.model('toDoTasks', toDoTaskSchema);



module.exports = {toDoTasks};