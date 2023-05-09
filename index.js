import dotenv from 'dotenv'
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
const swaggerDocument = JSON.parse(readFileSync("./Swagger/swagger.json"));

dotenv.config()
process.env.UV_THREADPOOL_SIZE = 128;

const app = express()
const port = process.env.PORT; 
const  MONGOURI  = process.env.MOGOURI;

app.use(express.json());

// Models
import "./Models/User.js";
import "./Models/UrlCheck.js";
import "./Models/Tag.js";

// Routes
import {router as authRoutes} from"./Routes/authRoutes.js" ;
import {router as URLMangementRoutes} from"./Routes/URLMangementRoutes.js" ;
import {makeARequest} from"./URLMonitoring.js";
app.use(authRoutes);
app.use(URLMangementRoutes);

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

//Swagger support open GET / route tosee documentation
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Start monitoring URLS
app.use('/startMonitor',(async ()=>{
  //Start Monitoring the existing URL checks in the database
  const UrlCheck = mongoose.model("UrlCheck");
  const savedUrls= await UrlCheck.find({});
  for(let i=0;i<savedUrls.length;i++){
    makeARequest(savedUrls[i]);
  }
}));

app.listen(port, async () => {
  console.log(`URL Monitor app listening on port ${port}`);
})