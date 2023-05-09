import got from 'got';
import mongoose from 'mongoose';
import { sendNotification } from "./Controllers/Helpers/SendingEmail.js";
const UrlCheck = mongoose.model("UrlCheck");

//Constructing the request to be made based on the paramters given
async function makeARequest(URL){

    //Construct options objects to be sent with the request
    var options = {};

    //Add Request method
    options.method='GET';

    //Construct the url
    const constructedUrl=URL.protocol + '://' +  URL.url +":"+URL.port+"/"+URL.path;

    //Add timeout
    options.timeout ={request : URL.timeout};

    //Add Auth checks
    if(URL.authentication!=null) {
      options.username=URL.authentication.username;
      options.password=URL.authentication.password;
    }

    //Add Headers
    var headers={};
    if(URL.httpHeaders!=null){
        URL.httpHeaders.forEach(header=>{
            headers[header.key]=header.value;
        })
    }
    options.headers=headers;

    //Add IgnoreSSL Check
    if(URL.protocol.toLowerCase()=="https" && URL.ignoreSSL==true)
    options.https={rejectUnauthorized: true};
    
    //Threshold - retry x times on status codes,error codes 
    options.retry={
      limit: URL.threshold,
      statusCodes: [408,413,429,500,502,503,504,521,522,524],
      errorCodes: [
        'ETIMEDOUT',
        'ECONNRESET',
        'EADDRINUSE',
        'ECONNREFUSED',
        'EPIPE',
        'ENOTFOUND',
        'ENETUNREACH',
        'EAI_AGAIN'
      ],
      calculateDelay: ({computedValue}) => computedValue
    }

    //status code to be asserted if given
    let statusCode=null;
    if(URL.assert!=null && URL.assert.statusCode!=null && URL.assert.statusCode!=0) statusCode=URL.assert.statusCode;

    //Determine the time between each request , it can't be less than 12 sec
    if(URL.interval>=0.2) URL.interval=URL.interval*60*1000
    else URL.interval=12*1000;

    //Excute the request every interval
    DoTheRequest(constructedUrl,options,statusCode,URL._id);
    setInterval(function() { DoTheRequest(constructedUrl,options,statusCode,URL._id); },URL.interval); 
}

//Excute the request 
async function DoTheRequest(constructedUrl,options,statusCode,urlId){
  let responeTime=-1;
  let beforerequest=Date.now();
  let status=false;
  try{
    //Excute the request
    const data = await got(constructedUrl, options);
    //Get the status code of the response to the request
    const statusCode=data.statusCode;
    responeTime=Date.now()-beforerequest;
    //Handle status code assertion

    //If status code wasn't assereted, 1xx,2xx,3xx are considered successfull requests
    const scFirstDigit=Math.floor(statusCode/100);
    if(scFirstDigit==1 || scFirstDigit==2 || scFirstDigit==3){
      console.log("Success");
      status=true;
    } 
    //4xx,5xx failed requests
    else console.log("Request Failed : bad status code");
  }
  catch(err){
    console.log("Request Failed : Error on request");
  }
  
  //time of request in ms
  var currentdate = new Date();

  //timestamp for request
  var datetime = currentdate.getDay() + "/" + currentdate.getMonth() + "/" + currentdate.getFullYear() + " @ "+
  currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();

  //UpdateDatabase
  await updateDatabase(status,datetime,currentdate,responeTime,urlId,constructedUrl)
}


//Update the Database for Url based on status,timestamp of the request
async function updateDatabase(status,timeStamp,LasttimeStampMS,responsetime,urlId,constructedURL){
  const urlCheck= await UrlCheck.findById(urlId).populate('user');

  //the Updates to the database
  let updates={
    status: status,
    outages: urlCheck.outages,
    upTime: urlCheck.upTime,
    downtime: urlCheck.downtime,
    totalPings: urlCheck.totalPings+1,
    avgResponseTime: urlCheck.avgResponseTime,
    $push: { history: timeStamp } ,
    lastTimeStampMs: LasttimeStampMS
  }
  let totalResponsTime=urlCheck.avgResponseTime*urlCheck.totalPings;

  //Time between this request and last request
  var time=(LasttimeStampMS-urlCheck.lastTimeStampMs)/1000;

  //If status switched either from up to down or vice versa
  //Assume that the time between the 2 requests are 50/50 up and down
  //If status went from up to down then this is considered outage
  if(urlCheck.status!=status){
    updates.upTime+=(time/2);
    updates.downtime+=(time/2);
    if(!status) updates.outages++;
    //Notify the user with the URL check
    await sendNotification(urlCheck.user.email,status,urlCheck.name,constructedURL);
  }

  //URL up, calcualte new avgResponsetime and updateUptime
  if(status){
    updates.upTime+=time;
    updates.avgResponseTime=(totalResponsTime+responsetime)/updates.totalPings;
  }

  //URL down,updateDownTime
  else  updates.downtime+=time;

  //Excute the pending updates
  await UrlCheck.findOneAndUpdate({_id:urlId},updates);
}

export {
    makeARequest
}