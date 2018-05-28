const connect = require('monk')
const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/livecodings'

const db = connect(url)

// Collections

const users = db.get('users')
users.createIndex('email')

const todos = db.get('todos')


// USERS

const readUsers = () => users.find({})
readUsers.byId = id => users.findOne({ _id: id })
readUsers.byEmail = email => users.findOne({ email })

const createUser = user => users.insert({ ...user, createdAt: new Date() })

const updateUser = update => users.findOneAndUpdate({ _id: update.id }, { $set: update })

const deleteUser = id => users.findOneAndDelete({ _id: id })


// TODOS

const readTodos = () => todos.find({})
readTodos.byId = id => todos.findOne({ _id: id })

const createTodo = todo => todos.insert({ ...todo, stars: [], createdAt: new Date() })

const updateTodo = update => todos.findOneAndUpdate({ _id: update.id }, { $set: update })

const deleteTodo = id => todos.findOneAndDelete({ _id: id })

const vote = async ({ todoId, userId }) => {
  const todo = await readTodos.byId(todoId)

  if (!todo) { return }

  const stars = todo.stars.includes(userId)
    ? todo.stars.filter(id => id !== userId) // remove vote
    : [ ...todo.stars, userId ] // add vote

  return updateTodo({ id: todo._id, stars })
}

module.exports = {
  ...db,
  todos: {
    create: createTodo,
    read: readTodos,
    update: updateTodo,
    delete: deleteTodo,
    vote
  },
  users: {
    create: createUser,
    read: readUsers,
    update: updateUser,
    delete: deleteUser
  }
}
