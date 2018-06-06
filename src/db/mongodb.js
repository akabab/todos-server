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

const prepareTodo = async todo => {
  const user = await readUsers.byId(todo.userId)

  return { ...todo, author: user.name }
}
const prepareTodos = async todos => Promise.all(todos.map(prepareTodo))


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

const readTodos = () => todos.find({}).then(mapIds).then(prepareTodos)
readTodos.byId = id => todos.findOne({ _id: id }).then(mapIds).then(prepareTodo)

const createTodo = todo => todos.insert({ ...todo, stars: [], createdAt: new Date() }).then(mapIds).then(prepareTodo)

const updateTodo = update => todos.findOneAndUpdate({ _id: update.id }, { $set: update }).then(mapIds).then(prepareTodo)

const deleteTodo = id => todos.findOneAndDelete({ _id: id }).then(mapIds).then(prepareTodo)

const vote = async ({ todoId, userId }) => {
  const todo = await readTodos.byId(todoId)

  if (!todo) { return }

  const stars = todo.stars.includes(userId)
    ? todo.stars.filter(id => id !== userId) // remove vote
    : [ ...todo.stars, userId ] // add vote

  return updateTodo({ id: todo.id, stars })
}

module.exports = {
  ...db,
  todos: {
    create: createTodo,
    read: readTodos,
    update: updateTodo,
    delete: deleteTodo,
    vote: vote
  },
  users: {
    create: createUser,
    read: readUsers,
    update: updateUser,
    delete: deleteUser
  }
}
