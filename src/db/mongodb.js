const connect = require('monk')
const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/livecodings'

const db = connect(url)

// Helpers

// Replace `_id` (ObjectId) field by an `id` (String) field
const mapId = r => {
  const { _id, ...rest } = r

  return { id: _id.toString(), ...rest }
}
const mapIds = r => {
  if (!r) return

  return Array.isArray(r) ? r.map(mapId) : mapId(r)
}
const toId = f => (...args) => f(...args).then(mapIds)

// Collections

const users = db.get('users')
users.createIndex('email')

const todos = db.get('todos')


// USERS

const readUsers = () => users.find({}).then(mapIds)
readUsers.byId = id => users.findOne({ _id: id }).then(mapIds)
readUsers.byEmail = email => users.findOne({ email }).then(mapIds)

const createUser = user => users.insert({ ...user, createdAt: new Date() }).then(mapIds)

const updateUser = update => users.findOneAndUpdate({ _id: update.id }, { $set: update }).then(mapIds)

const deleteUser = id => users.findOneAndDelete({ _id: id }).then(mapIds)


// TODOS

const readTodos = () => todos.find({}).then(mapIds)
readTodos.byId = id => todos.findOne({ _id: id }).then(mapIds)

const createTodo = todo => todos.insert({ ...todo, stars: [], createdAt: new Date() }).then(mapIds)

const updateTodo = update => todos.findOneAndUpdate({ _id: update.id }, { $set: update }).then(mapIds)

const deleteTodo = id => todos.findOneAndDelete({ _id: id }).then(mapIds)

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
