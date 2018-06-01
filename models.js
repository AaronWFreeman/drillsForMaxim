'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const toDoTaskSchema = new mongoose.Schema({
  title: String,
  completed: {type: Boolean, default: false}
});

toDoTaskSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    completed: this.completed
  };
};

const toDoTasks = mongoose.model('toDoTasks', toDoTaskSchema);



module.exports = {toDoTasks};