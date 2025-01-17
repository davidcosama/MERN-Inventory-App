const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const mongoose = require('mongoose')

const Product = require('./models/Product');
const config = require('./config');

const port = process.env.PORT || 5000

// SET UP express and using socketio middleware
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// set up a socket namespace
io.on("connection", socket => {
  console.log("New client connected")
  io.emit("updates", "there are updates")
  socket.on("disconnect", () => console.log("Client disconnected"))
})

// SET UP MONGOOSE
const dbURL = config.mongoURI;

mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
  console.log("Successfully connected to MongoDB")
})

app.use(express.json())

// GET ALL PRODUCTS
app.get('/product/get/', (req, res) => {
  Product.find({}, (err, products) => {
    res.send(products)
  })
})

// Creates a product
app.post('/product/create', async(req, res) => {
  try {
    const product = new Product(req.body)
    console.log(product)
    const saved = await product.save()
    console.log("Successfully saved product")
    // broadcast the changes to all clients
    if (saved) {
      io.emit("updates", req.body)
      console.log("Broadcasting changes")
      res.sendStatus(200)
    }
  } catch (err) {
    res.sendStatus(500)
    console.log(err)
  }
})

// updates a product by ID
app.post('/product/update/', async (req, res) => {
  try {
    console.log(req.body)
    const updated = await Product.findOneAndUpdate({id: req.body.id}, req.body, {useFindAndModify: false, new:true})
    if (updated) {
      console.log("Updated: " + updated)
      io.emit("updates", req.body)
      res.sendStatus(200)
    }
  } catch (err) {
    res.sendStatus(500)
    console.log(err)
  }
})

// removes a product by ID
app.post('/product/delete/', async (req, res) => {
  try {
    const deleted = await Product.deleteOne({id: req.body.id})
    if (deleted) {
      io.emit("updates", req.body)
      res.sendStatus(200)
    }
  } catch (err) {
    res.sendStatus(500)
    console.log(err)
  }
})

server.listen(port, () => {
  console.log("Server is listening on port", server.address().port)
})
