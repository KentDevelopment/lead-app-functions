// Send Emails with form data
const functions = require('firebase-functions')
const nodemailer = require('nodemailer')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true })

admin.initializeApp()

const gmailEmail = functions.config().gmail.email
const gmailPassword = functions.config().gmail.password
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
})

exports.sendEmail = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    const db = admin.firestore()
    return db
      .collection('users')
      .doc(req.body.uid)
      .get()
      .then(doc => {
        const user = doc.data()
        const formData = {
          email: user.email,
          displayName: user.displayName,
          campus: user.campus
        }

        const mailOptions = {
          subject: `New user added to ${user.campus} LEAD App ${user.email}`,
          from: '"Lead App" <development@student.kent.edu.au>',
          to: 'lead@kent.edu.au',
          bcc: 'renan.sigolo@gmail.com'
        }

        // Build Email message.
        mailOptions.html = `
      <h1>You have a new registered user on the LEADERBOARD App, please update their LEAD points as soon as possible!</h1>
      <p><b>Email: </b>${formData.email}</p>
      <p><b>Name: </b>${formData.displayName}</p>
      <p><b>Campus: </b>${formData.campus}</p>`

        mailOptions.text = `Email: ${formData.email}
      Name: ${formData.displayName}
      Campus: ${formData.campus}`

        return mailTransport
          .sendMail(mailOptions)
          .then(() => {
            return res.status(200).end()
          })
          .catch(error => {
            return res.status(500)
          })
      })
  })
})
