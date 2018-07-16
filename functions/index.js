// Send Emails upon user registration

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const admin = require("firebase-admin");
admin.initializeApp();

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

exports.firestoreEmail = functions.firestore
  .document("users/{uid}")
  .onCreate(event => {
    const userId = event._fieldsProto.uid.stringValue;
    const db = admin.firestore();
    return db
      .collection("users")
      .doc(userId)
      .get()
      .then(doc => {
        const user = doc.data();
        const mailOptions = {
          subject: `New user added to ${user.campus} LEAD App ${user.email}`,
          from: '"Lead App" <development@student.kent.edu.au>',
          to: "lead@kent.edu.au",
          bcc: "renan.sigolo@gmail.com"
        };

        // Building Email message.
        mailOptions.html = `
					<h1>You have a new registered user on the LEADERBOARD App, please update their LEAD points as soon as possible!</h1>
					<p><b>Email Address: </b>${user.email}</p>
					<p><b>Name: </b>${user.displayName}</p>
					<p><b>Campus: </b>${user.campus}</p>
					`;
        mailOptions.text = `Email Address: ${user.email}
				Name: ${user.displayName}
				Campus: ${user.campus}`;

        return mailTransport
          .sendMail(mailOptions)
          .then(() => console.log(`Email has been sent`))
          .catch(error =>
            console.error("There was an error while sending the email:", error)
          );
      });
  });
