const connectToMongo = require('./db')

const express = require('express')

var cors = require('cors')

connectToMongo();


const app = express()
const port = 5000

//Available routes
app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/tickets', require('./routes/tickets'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`iNotebook backend listening on port ${port}`)
})
