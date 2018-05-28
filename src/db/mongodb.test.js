const db = require('./mongodb')
const assert = require('assert')

const user = {
  name: 'Test',
  email: 'test@test.fr',
  password: 'test'
}
const todo = {
  title: 'new todo title',
  description: 'new todo description',
  image: 'https://test.com/image.png'
}
const _g = {}

const tests = {
  init: async () => {
    // Drop collections
    db.get('users').drop()
    db.get('todos').drop()
  },
  prepareUsersTests: async () => {
  },
  // Users
  createUser: async () => {
    const newUser = await db.users.create(user)
    _g.newUser = newUser
    const users = await db.users.read()
    const expected = [ _g.newUser ]

    assert(new Date() - newUser.createdAt < 1000) // ensure createdAt exists and has been created around the current time (±1s)
    assert.deepEqual(users, expected)
  },
  findUserById: async () => {
    const user = await db.users.read.byId(_g.newUser.id)
    const expected = _g.newUser

    assert.deepEqual(user, expected)
  },
  updateUser: async () => {
    const user = await db.users.update({ id: _g.newUser.id, name: 'updated name' })
    const expected = { ..._g.newUser, name: 'updated name' }

    assert.deepEqual(user, expected)
  },
  deleteUser: async () => {
    await db.users.delete(_g.newUser.id)
    const users = await db.users.read()
    const expected = []

    assert.deepEqual(users, expected)
  },
  // Todos
  prepareTodosTests: async () => {
    const newUser = await db.users.create(user)
    _g.newUser = newUser
  },
  createTodo: async () => {
    todo.userId = _g.newUser.id
    const newTodo = await db.todos.create(todo)
    _g.newTodo = newTodo
    const todos = await db.todos.read()
    const expected = [ { ..._g.newTodo, author: _g.newUser.name } ]

    assert.deepEqual(newTodo.stars, [], 'stars array should be initialised as an empty array')
    assert(new Date() - newTodo.createdAt < 1000)
    assert.deepEqual(todos, expected)
  },
  findTodoById: async () => {
    const todo = await db.todos.read.byId(_g.newTodo.id)
    const expected = _g.newTodo

    assert.deepEqual(todo, expected)
  },
  updateTodo: async () => {
    const todo = await db.todos.update({ id: _g.newTodo.id, title: 'updated title' })
    const expected = { ..._g.newTodo, title: 'updated title' }

    assert.deepEqual(todo, expected)
  },
  deleteTodo: async () => {
    await db.todos.delete(_g.newTodo.id)
    const todos = await db.todos.read()
    const expected = []

    assert.deepEqual(todos, expected)
  },
}

const run = async () => {
  console.log(`testing`)

  for (const [k, v] of Object.entries(tests)) {
    await v()
      .then(() => console.log(`> ${k} ok`))
      .catch(err => console.log(`> ${k} !ok`, err.message))
  }
}

run()
