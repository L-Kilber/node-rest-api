const wait = (time) =>
  new Promise(resolve =>
    setTimeout(resolve, time)
  )

const todosDatabase = (() => {
  let idSequence = 1
  const todos = {}

  const insert = async (todo) => {
    await wait(500)
    const id = idSequence++
    const data = { ...todo, id }
    todos[id] = data
    return data
  }

  const list = async () => {
    await wait(100)
    return Object.values(todos)
  }

  const get = async (id) => {
    await wait(100)
    return todos[id]
  }

  const update = async (todo) => {
    await wait(500)
    todos[todo.id] = todo
    return todo
  }

  const del = async (id) => {
    await wait(500)
    delete todos[id]
  }

  return {
    insert,
    list,
    get,
    update,
    del,
  }

})()



const http = require('http')

const server = http.createServer((request, response) => {
  //GET /hello/:nome -> Hello ${nome}
  if (request.method === 'GET' && /^\/hello\/\w+$/.test(request.url)) {
    response.writeHead(200) // Sucess Status Code
    const [ , ,name] = request.url.split('/')
    response.end(`Hello ${name}`)
    return
  }

  //GET /hello -> Hellor world!
  if (request.method === 'GET' && request.url.startsWith('/hello')) {
    response.writeHead(200) // Sucess Status Code
    response.end('Hello World!\n')
    return
  }

  //POST /echo
  if (request.method === 'POST' && request.url.startsWith('/echo')) {
    response.writeHead(200) // Sucess Status Code
    request.pipe(response)
    return
  }

  //*****************//
  //API TODOS

  if (request.method === 'GET' && /^\/todos\/\d+$/.test(request.url)) {
    const [,, idRaw] = request.url.split('/')
    const id = parseInt(idRaw)

    todoDatabase.get(id).then(todo => {
      if (!todo) {
        response.writeHead(404)
        response.end({message: 'Not Found'})
      } else {
        response.writeHead(200)
        response.end(todo)
      }
    })
    return
  }

  if (request.method === 'POST' && request.url.startsWith('/todos')) {
    let bodyRaw = ''

    request.on('data', data => bodyRaw += data)
    request.once('end', () => {
      const todo = JSON.parse(bodyRaw)
      todosDatabase.insert(todo)
        .then(inserted => {
          response.writeHead(201) // Creat Sucess Status Code
          response.end(JSON.stringify(inserted))
        })
    })
    return
  }

  if (request.method === 'GET' && request.url.startsWith('/todos')) {
    todosDatabase.list().then(todos => {
      response.writeHead(200)
      response.end(JSON.stringify({todos}))
    })
    return
  }

  if (request.method === 'DELETE' && /^\/todos\/\d+$/.test(request.url)) {
    const [,, idRaw] = request.url.split('/')
    const id = parseInt(idRaw)

    todosDatabase.del(id).then(() => {
      response.writeHead(204)
      response.end()
    })
  }

  response.writeHead(404) // Not Found Code
  response.end('Not Found')
})

server.listen(3000, '0.0.0.0', () => {
  console.log('Server started')
})
