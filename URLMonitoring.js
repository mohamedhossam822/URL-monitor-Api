import got from 'got';
import mongoose from 'mongoose';
import { sendNotification } from "./Controllers/Helpers/SendingEmail.js";
const UrlCheck = mongoose.model("UrlCheck");
async function makeARequest(URL){

    var options = {};
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
    
    //Threshold
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


    let statusCode=null;
    if(URL.assert!=null && URL.assert.statusCode!=null && URL.assert.statusCode!=0) statusCode=URL.assert.statusCode;
    if(URL.interval>=0.2) URL.interval=URL.interval*60
    else URL.interval=10;
    DoTheRequest(constructedUrl,options,statusCode,URL._id);
    setInterval(function() { DoTheRequest(constructedUrl,options,statusCode,URL._id); },URL.interval*1000);
    
}

async function DoTheRequest(constructedUrl,options,statusCode,urlId){
  let responeTime=-1;
  let beforerequest=Date.now();
  let status=false;
  try{
    const data = await got(constructedUrl, options);
    const statucCode=data.statusCode;
    responeTime=Date.now()-beforerequest;
    //status  code FirstDigit
    const scFirstDigit=Math.floor(statucCode/100);
    if(scFirstDigit==1 || scFirstDigit==2 || scFirstDigit==3){
      console.log("Success");
      status=true;
    } 
    else console.log("Failed");
  }
  catch(err){
    console.log("Failed");
  }
  
  var currentdate = new Date();
  var datetime = currentdate.getDay() + "/" + currentdate.getMonth() + "/" + currentdate.getFullYear() + " @ "+
  currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
  //UpdateDatabase
  await updateDatabase(status,datetime,currentdate,responeTime,urlId,constructedUrl)
  console.log(datetime);
}

async function updateDatabase(status,timeStamp,LasttimeStampMS,responsetime,urlId,constructedURL){
  const urlCheck= await UrlCheck.findById(urlId).populate('user');
  //Update to the database
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

  //If switched
  if(urlCheck.status!=status){
    updates.upTime+=(time/2);
    updates.downtime+=(time/2);
    if(!status) updates.outages++;
    await sendNotification(urlCheck.user.email,status,urlCheck.name,constructedURL);
  }
  //URL up calcualte new avgResponsetime and updateUptime
  if(status){
    updates.upTime+=time;
    updates.avgResponseTime=(totalResponsTime+responsetime)/updates.totalPings;
  }
  //URL down and updateDownTime
  else  updates.downtime+=time;

  await UrlCheck.findOneAndUpdate({_id:urlId},updates);
}

export {
    makeARequest
}