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
    readHTMLFile('./HTMLFiles/VerifyEmailTemplate.html', function(err, html) {
        if (err) {
           console.log('error reading file', err);
           return;
        }
        var template = compile(html);
        var replacements = {
             link: fullUrl
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: process.env.SENDEREMAIL, // sender address
            to: email, // list of receivers
            subject: "URLMonitor Email Verification", // Subject line
            text: "Confirm your email", 
            html : htmlToSend
         };
        transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
            }
        });
    });

  }
  async function  sendNotification(email,status,urlCheckName,constructedURL){
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service : "Mail.ru",
      auth: {
        user: process.env.SENDEREMAIL, 
        pass: process.env.SENDERPASS, 
      },
    });
    let fileLink="Red";
    console.log(status);
    if(status) fileLink="Green";
    console.log(fileLink);
    await readHTMLFile('./HTMLFiles/UrlStatus'+fileLink+'.html', async function(err, html) {
        if (err) {
           console.log('error reading file', err);
           return;
        }
        const curStatus = status ? "up" : "down"
        console.log(curStatus);
        var template = compile(html);
        var replacements = {
          checkName: urlCheckName,
          status: curStatus,
          url: constructedURL,
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
          from: process.env.SENDEREMAIL, // sender address
          to: email, // list of receivers
          subject: "Update about your Url Check "+ urlCheckName, // Subject line
          text: "Your Url '"+constructedURL+ "' Went"+status
          , html : htmlToSend
       };
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