import dotenv from 'dotenv'
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./Swagger/swagger.json" assert { type: "json" };
import { Worker } from 'worker_threads';

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
app.use(authRoutes);
app.use(URLMangementRoutes);
import {makeARequest} from"./URLMonitoring.js";
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

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
  const UrlCheck = mongoose.model("UrlCheck");
  const savedUrls= await UrlCheck.find({});
  for(let i=0;i<savedUrls.length;i++){
    makeARequest(savedUrls[i]);
  }
})