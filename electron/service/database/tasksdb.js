'use strict';

const { BasedbService } = require('./basedb');

class TasksdbService extends BasedbService {
  constructor() {
    const options = {
      dbname: 'sqlite-demo.db',
    };
    super(options);
    this.tasksTableName = 'tasks';
  }

  /**
   * 初始化 tasks 表
   */
  init() {
    this._init();

    const masterStmt = this.db.prepare('SELECT * FROM sqlite_master WHERE type=? AND name = ?');
    let tableExists = masterStmt.get('table', this.tasksTableName);
    if (!tableExists) {
      const createTasksTableSql = `
        CREATE TABLE ${this.tasksTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key_card_name TEXT NOT NULL,
          key_card_position TEXT NOT NULL,
          key_card_price INTEGER NOT NULL,
          is_buy_end BLOB NOT NULL,
          buy_end_time TEXT,
          key_card_floating_range REAL NOT NULL
        );
      `;
      this.db.exec(createTasksTableSql);
    }
  }

  /**
   * 插入任务
   */
  insertTask(task) {
    const stmt = this.db.prepare(`
      INSERT INTO ${this.tasksTableName}
      (key_card_name, key_card_position, key_card_price, is_buy_end, buy_end_time, key_card_floating_range)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      task.keyCardName || '', // 确保为字符串
      task.keyCardPosition || '', // 确保为字符串
      task.keyCardPrice || 0, // 确保为数字
      task.isBuyEnd||0, // 布尔值转换为数字
      task.buyEndTime || null, // 确保为字符串或 null
      task.keyCardFloatingRange || 0.0 // 确保为数字
    );
  }

  /**
   * 查询任务
   */
  queryTasks(filter = {}) {
    let sql = `SELECT * FROM ${this.tasksTableName}`;
    const conditions = [];
    const values = [];

    if (filter.keyCardName) {
      conditions.push('key_card_name LIKE ?');
      values.push(`%${filter.keyCardName}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const rows = this.db.prepare(sql).all(values);

    // 转换字段为驼峰命名
    return rows.map(row => ({
      id: row.id,
      keyCardName: row.key_card_name,
      keyCardPosition: row.key_card_position,
      keyCardPrice: row.key_card_price,
      isBuyEnd: row.is_buy_end,
      buyEndTime: row.buy_end_time,
      keyCardFloatingRange: row.key_card_floating_range,
    }));
  }

  /**
   * 删除任务
   */
  deleteTask(id) {
    const stmt = this.db.prepare(`DELETE FROM ${this.tasksTableName} WHERE id = ?`);
    stmt.run(id);
  }

  /**
   * 更新任务
   */
  updateTask(task) {
    const stmt = this.db.prepare(`
      UPDATE ${this.tasksTableName}
      SET key_card_name = ?, key_card_position = ?, key_card_price = ?, is_buy_end = ?, buy_end_time = ?, key_card_floating_range = ?
      WHERE id = ?
    `);
    stmt.run(
      task.keyCardName,
      task.keyCardPosition,
      task.keyCardPrice,
      task.isBuyEnd,
      task.buyEndTime,
      task.keyCardFloatingRange,
      task.id
    );
  }
}

module.exports = TasksdbService;