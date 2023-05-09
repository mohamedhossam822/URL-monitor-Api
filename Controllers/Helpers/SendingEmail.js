import * as  nodemailer from "nodemailer";
import pkg from 'handlebars';
const {compile} = pkg;
import * as fs from 'fs';

  /*Send Mail*/
  async function  sendMail(email,fullUrl){

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service : "Mail.ru",
      auth: {
        user: process.env.SENDEREMAIL, 
        pass: process.env.SENDERPASS, 
      },
    });
    //read html file to send
    readHTMLFile('./HTMLFiles/VerifyEmailTemplate.html', function(err, html) {
        if (err) {
           console.log('error reading file', err);
           return;
        }
        //replace variables in html -> link of verification
        var template = compile(html);
        var replacements = {
             link: fullUrl
        };
        var htmlToSend = template(replacements);

        //Add options of the pending email
        var mailOptions = {
            from: process.env.SENDEREMAIL, // sender address
            to: email, // list of receivers
            subject: "URLMonitor Email Verification", // Subject line
            text: "Confirm your email", 
            html : htmlToSend
         };

         //Send email
        transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
            }
        });
    });

  }
  //Send email to users notifying them about the change in status of one of their URLS
  async function  sendNotification(email,status,urlCheckName,constructedURL){
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service : "Mail.ru",
      auth: {
        user: process.env.SENDEREMAIL, 
        pass: process.env.SENDERPASS, 
      },
    });
    //Set up variables for html file to be sent based on status of URL
    let fileLink="Red";
    console.log(status);
    if(status) fileLink="Green";
    console.log(fileLink);

    await readHTMLFile('./HTMLFiles/UrlStatus'+fileLink+'.html', async function(err, html) {
        if (err) {
           console.log('error reading file', err);
           return;
        }
                //replace variables in html -> link of verification
        const curStatus = status ? "up" : "down"
        console.log(curStatus);
        var template = compile(html);
        var replacements = {
          checkName: urlCheckName,
          status: curStatus,
          url: constructedURL,
        };
        var htmlToSend = template(replacements);
        //Add options of the pending email
        var mailOptions = {
          from: process.env.SENDEREMAIL, // sender address
          to: email, // list of receivers
          subject: "Update about your Url Check "+ urlCheckName, // Subject line
          text: "Your Url '"+constructedURL+ "' Went"+status
          , html : htmlToSend
       };
       //Send email
      await transporter.sendMail(mailOptions, function (error, response) {
          if (error) {
              console.log(error);
          }
      });
    });

  }

  /** Read html*/
  var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
           callback(err);                 
        }
        else {
            callback(null, html);
        }
    });
};

 export { sendMail,sendNotification }