const express = require('express')
const path = require('path')
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
const isValid = require('date-fns/isValid')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null
const dbPath = path.join(__dirname, 'todoApplication.db')
const app = express()
app.use(express.json())
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server Running At http://localhost/3000/')
    })
  } catch (e) {
    console.log(`Error Occured:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
//
const haspriorityAndStatusProperties = query => {
  return query.status !== undefined && query.priority !== undefined
}
const haspriorityProperty = query => {
  return query.priority !== undefined
}
const hasStatusProperty = query => {
  return query.status !== undefined
}
const hasStatusAndCategory = query => {
  return query.status !== undefined && query.category !== undefined
}
const haspriorityAndCategoryProperties = query => {
  return query.priority !== undefined && query.category !== undefined
}
const hasCategory = query => {
  return query.category !== undefined
}
const hasSearchQuery = query => {
  return query.search_q !== undefined
}

app.get('/todos/', async (request, response) => {
  let sqlQuery = ''
  const {status, priority, category, search_q = ''} = request.query
  switch (true) {
    case haspriorityAndStatusProperties(request.query):
      if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          sqlQuery = `
        SELECT id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate FROM todo
        WHERE status='${status}' AND priority='${priority}'
        `
          const list = await db.all(sqlQuery)
          response.send(list)
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case haspriorityAndCategoryProperties(request.query):
      if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
        if (
          category === 'WORK' ||
          category === 'HOME' ||
          category === 'LEARNING'
        ) {
          sqlQuery = `
        SELECT id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate FROM todo
        WHERE category='${category}' AND priority='${priority}'
        `
          const list = await db.all(sqlQuery)
          response.send(list)
        } else {
          response.status(400)
          response.send('Invalid Todo Category')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasStatusAndCategory(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          sqlQuery = `
        SELECT id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate FROM todo
        WHERE status='${status}' AND category='${category}'
        `
          const list = await db.all(sqlQuery)
          response.send(list)
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasCategory(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        sqlQuery = `
        SELECT id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate FROM todo
        WHERE  category='${category}'
        `
        const list = await db.all(sqlQuery)
        response.send(list)
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case haspriorityProperty(request.query):
      if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
        sqlQuery = `
        SELECT id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate FROM todo
        WHERE  priority='${priority}'
        `
        const list = await db.all(sqlQuery)
        response.send(list)
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasStatusProperty(request.query):
      if (status === 'TO DO' || status === 'DONE' || status === 'IN PROGRESS') {
        sqlQuery = `
        SELECT id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate FROM todo
        WHERE status= '${status}'
        `
        const list = await db.all(sqlQuery)
        response.send(list)
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case hasSearchQuery(request.query):
      sqlQuery = `
      SELECT id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate FROM TODO WHERE todo like "%${search_q}%";
      `
      const listArray = await db.all(sqlQuery)
      response.send(listArray)
  }
})
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const sqlQuery = `
  SELECT id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate FROM TODO WHERE id=${todoId};
  `
  const todo = await db.get(sqlQuery)
  response.send(todo)
})
app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  if (isMatch(date, 'yyyy-MM-dd')) {
    let newDate = format(new Date(date), 'yyyy-MM-dd')
    const sqlQuery = `
  SELECT id as id,
        todo as todo,
        priority as priority,
        status as status,
        category as category,
        due_date as dueDate FROM TODO WHERE due_date='${newDate}';
  `
    const todo = await db.all(sqlQuery)
    response.send(todo)
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          let newDate = format(new Date(dueDate), 'yyyy-MM-dd')
          const sqlQuery = `
  insert into todo(id,todo,priority,status,category,due_date)
  values(${id},'${todo}','${priority}','${status}','${category}','${newDate}')
  `
          await db.run(sqlQuery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const previousTodoQuery = `
  SELECT * FROM TODO WHERE ID=${todoId};
  `
  const previousTodo = await db.get(previousTodoQuery)
  const {
    todo = previousTodo.todo,
    priority = previousTodo.previousTodo,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body
  const query = request.body
  let sqlQuery = ''
  switch (true) {
    case query.status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        sqlQuery = `
    update todo set
    todo='${todo}',
    priority='${priority}',
    status='${status}',
    category='${category}',
    due_date='${dueDate}'
    where id=${todoId};
    `
        await db.run(sqlQuery)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case query.priority !== undefined:
      if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
        sqlQuery = `
    update todo set
    todo='${todo}',
    priority='${priority}',
    status='${status}',
    category='${category}',
    due_date='${dueDate}'
    where id=${todoId}
    `
        await db.run(sqlQuery)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case query.category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        sqlQuery = `
    update todo set
    todo='${todo}',
    priority='${priority}',
    status='${status}',
    category='${category}',
    due_date='${dueDate}'
    where id=${todoId};
    `
        await db.run(sqlQuery)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case query.todo !== undefined:
      sqlQuery = `
    update todo set
    todo='${todo}',
    priority='${priority}',
    status='${status}',
    category='${category}',
    due_date='${dueDate}'
    where id=${todoId};
    `
      await db.run(sqlQuery)
      response.send('Todo Updated')
      break
    case query.dueDate !== undefined:
      if (isMatch(dueDate, 'yyyy-MM-dd')) {
        let newDate = format(new Date(dueDate), 'yyyy-MM-dd')
        sqlQuery = `
    update todo set
    todo='${todo}',
    priority='${priority}',
    status='${status}',
    category='${category}',
    due_date='${newDate}'
    where id=${todoId};
    `
        await db.run(sqlQuery)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const sqlQuery = `
  delete from todo where id=${todoId};
  `
  await db.run(sqlQuery)
  response.send('Todo Deleted')
})
module.exports = app
