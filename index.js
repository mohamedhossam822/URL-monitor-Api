require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./Swagger/swagger.json');
//const swaggerDocument = require('./Swagger/SwaggerDocument.ts');
//const bodyParser = require("body-parser");
//const cors = require("cors");
const app = express()
const port = process.env.PORT; 
const  MONGOURI  = process.env.MOGOURI;

//app.use(cors());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


// Models
require("./Models/User");
require("./Models/UrlCheck");
require("./Models/Tag");
// Routes
app.use(require("./Routes/authRoutes"));

// Database Connection
mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongo");
});

mongoose.connection.on("error", (err) => {
  console.log("error connecting to mongo", err);
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})