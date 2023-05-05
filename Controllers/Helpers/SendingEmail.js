const nodemailer = require("nodemailer");
var handlebars = require('handlebars');
var fs = require('fs');

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
        var template = handlebars.compile(html);
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

module.exports = {
    sendMail
};