const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')

app.use(express.json())
app.use(cors())

var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: '00df68d74dc947609b811bab18cf525d',
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload:{
      environment:"development"
  }
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.get('/api/students', (req, res) => {
    res.status(200).send(students)
    rollbar.info('Student list was requested')
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
           students.push(name)
           res.status(200).send(students)
           rollbar.info('student was created successfully')
       } else if (name === ''){
           res.status(400).send('You must enter a name.')
           rollbar.error('Blank input was submitted')
       } else {
           res.status(400).send('That student already exists.')
           rollbar.warning('tried to create new user with old credentials')
       }
   } catch (err) {
       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
    rollbar.critical('student deleted')
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
