// JS Express CodeFlow Übung lev3_2: Nodemailer

const title = 'NodeMailer'

const users = require('./data/users.json')
let loggedIn = false;

const port = process.env.PORT || 80;

const express = require('express');

const fs = require('fs');

const { v4: uuidv4 } = require('uuid');
//console.log(uuidv4());

const nodemailer = require('nodemailer');


require('dotenv').config();

const bcrypt = require('bcrypt');
const Mail = require('nodemailer/lib/mailer');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// static files (built-in middleware)
app.use(express.static('public'));


//****************************************************************************
// start the server
app.listen(port, () => console.log(`Server listening to localhost:${port}`));


//****************************************************************************
// the routing...

app.get('/', (req, res) => {
    if (!loggedIn) {
        res.redirect('/login');
        return;
    }
    res.render('index', { title: title })
});

//============================================================================

app.get('/login', (req, res) => {
    res.render('login', { title: title, loginFailed: false })
});
//----------------------------------------------------------------------------
app.post('/login', (req, res, next) => {

    // check if the email adress already exists...
    // if it doesn't exist send the user to the register page
    if (users.filter(user => user.email.equals(req.body.emailAddress)).length == 0) {
        res.redirect('/register');
        return;
    }

    // compare email address and password with users from 'database'
    loggedIn = (users.filter(user => user.email.equals(req.body.emailAddress) && user.password.equals(req.body.password)).length > 0);

    if (!loggedIn) {
        res.redirect('/login', { loginFailed: true });
        return;
    }

    // if the user data are valid check if the acount is already confirmed
    if (users.filter(user => user.status.equals('pending')).length > 0) {
        res.redirect('/confirm');
        return;
    }

    res.send(req.body);
});

//============================================================================

app.get('/register', (req, res) => {
    res.render('register', { title: title })
});
//----------------------------------------------------------------------------
app.post('/register', (req, res, next) => {

    // check if the email adress already exists...
    // if it already exists send the user to the login page
    if (users.filter(user => user.email.equals(req.body.emailAddress)).length > 0) {
        res.redirect('/login', {});
        return;
    }

    // the user does not exist so add a new user to user database with status confirmation pending
    const newUser = {
        id: uuidv4(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.emailAddress,
        password: req.body.password,
        confirmationCode: uuidv4(),
        status: 'pending'
    };
    users.push(newUser);

    // write database, send confirmation mail
    fs.writeFile('./data/users.json', JSON.stringify(users, null, 4), "utf-8", (err) => {
        if (err) throw err;

        sendConfirmationMail(newUser.email, newUser.confirmationCode);
        res.render('confirm', { title: title, email: newUser.email, confirmationCode: newUser.confirmationCode });
    });
});

//============================================================================

app.get('/confirm', (req, res) => {

});
//----------------------------------------------------------------------------
app.get('/confirm/:code', (req, res) => {

    let index = users.findIndex(user => user.confirmationCode.equals(req.params.code));
    if (index > -1) {
        users[index].status = 'active';

        fs.writeFile('./data/users.json', JSON.stringify(users, null, 4), "utf-8", (err) => {
            if (err) throw err;

            res.render('confirmed', { title: title });
        });
    }
});
//----------------------------------------------------------------------------
app.get('/confirmed', (req, res) => {

});



function writeUserList() {

    fs.writeFile('./data/users.json', JSON.stringify(users, null, 4), "utf-8", (err, next) => {
        if (err) throw err;

        next();
    });
}

//****************************************************************************
function sendConfirmationMail(emailAddress, confirmationCode) {

    const transporter = nodemailer.createTransport({
        service: 'gmail', // no need to set host or port etc.
        auth: {
            user: process.env.CLIENT_EMAIL,
            pass: process.env.CLIENT_PASS
        }
    });

    let message = {
        from: `NoReply <${process.env.CLIENT_EMAIL}>`,
        to: emailAddress,
        subject: 'NodeMailer: confirm your email address',
        text: `
        Confirm your email-address:\n
        http://localhost/confirm/${confirmationCode}`
    }

    transporter.sendMail(message, (err, info) => {
        if (err) throw err;
        console.log(`Message sent to ${emailAddress}...`);
        console.log(info);
    });
}

//****************************************************************************
Object.defineProperty(String.prototype, 'equals', {
    value(str) {
        return (this.toLowerCase() == str.toLowerCase());
    }
});
