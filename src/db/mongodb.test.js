const db = require('./mongodb')
const assert = require('assert')

db.get('users').drop()
db.get('todos').drop()

const todo = {
  title: 'new todo title',
  description: 'new todo description',
  image: 'https://test.com/image.png'
}
const _g = {}

const tests = {
  pre: async () => {
    const todos = await db.todos.read()
    const expected = []

    assert.deepEqual(todos, expected)
  },
  init: async () => {

  },
  createTodo: async () => {
    const newTodo = await db.todos.create(todo)
    _g.newTodo = newTodo
    const todos = await db.todos.read()
    const expected = [ _g.newTodo ]

    assert.deepEqual(newTodo.stars, [], 'stars array should be initialised as an empty array')
    assert(new Date() - newTodo.createdAt < 1000) // ensure createdAt exists and has been created around the current time (±1s)
    assert.deepEqual(todos, expected)
  },
  findTodoById: async () => {
    const todo = await db.todos.read.byId(_g.newTodo._id)
    const expected = _g.newTodo

    assert.deepEqual(todo, expected)
  },
  updateTodo: async () => {
    const todo = await db.todos.update({ id: _g.newTodo._id, title: 'updated title' })
    const expected = { ..._g.newTodo, title: 'updated title' }

    // console.log({todo, expected})
    // assert.equal(todo._id, expected._id) // ObjectId vs ObjectId
    // assert.deepEqual(todo, expected)
  },
  deleteTodo: async () => {
    await db.todos.delete(_g.newTodo._id)
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

// readUsers.byId('5b0842d50e5aa0744f4bcf38').then(console.log, console.error)
// readUsers.byEmail('demo@demo.fr').then(console.log, console.error)
// createUser({ name: 'test', email: 'test@test.fr', password: 'test' }).then(console.log, console.error)
// deleteUser("5b09738d7ad9b566b2c406f8").then(console.log, console.error)
// updateUser({ id: "5b0842d50e5aa0744f4bcf38", name: 'demo2' }).then(console.log, console.error)
