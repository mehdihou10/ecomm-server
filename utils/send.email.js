const nodemailer = require('nodemailer');

module.exports = (html,email,subject)=>{

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD
        }
    })

    const mailOptions = {

        from: process.env.USER_EMAIL,
        to: email,
        subject,
        html
    }

      transporter.sendMail(mailOptions,(err,success)=>{

        if(err){

            console.log(err)

        }
      });

}