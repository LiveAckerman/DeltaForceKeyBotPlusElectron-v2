'use strict';

const TasksdbService = require('../service/database/tasksdb');
const tasksdb = new TasksdbService();
tasksdb.init();

class TasksController {
  async addTask(args) {
    tasksdb.insertTask(args);
    return { success: true };
  }

  async getTasks(args) {
    return tasksdb.queryTasks(args);
  }

  async deleteTask(args) {
    tasksdb.deleteTask(args.id);
    return { success: true };
  }

  async updateTask(args) {
    tasksdb.updateTask(args);
    return { success: true };
  }
}
TasksController.toString = () => '[class TasksController]';

module.exports = TasksController;