// JS Express CodeFlow Übung lev3_2: Nodemailer

const title = 'NodeMailer'

const users = require('./data/users.json');

let currentUser = {};
let loggedIn = false;
let loginFailed = false;

const port = process.env.PORT || 3000;

const express = require('express');

const fs = require('fs');

const { v4: uuidv4 } = require('uuid');
//console.log(uuidv4());

const nodemailer = require('nodemailer');
const Mail = require('nodemailer/lib/mailer');


require('dotenv').config();

const bcrypt = require('bcrypt');
const { debug } = require('console');
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
app.listen(port, () =>
    console.log(`Server listening to localhost:${port}`));

//****************************************************************************
// the routing...

app.get('/', (req, res) => {

    if (!loggedIn) {
        res.redirect('/login');
        return;
    }
    // res.render('secret', { title: title, user: currentUser });
    res.redirect('/secret');
});

//============================================================================

app.get('/login', (req, res) => {
    res.render('login', { title: title, loginFailed: false, loggedIn: loggedIn, user: currentUser ? currentUser.firstName : "" })
});
//----------------------------------------------------------------------------
app.post('/login', (req, res, next) => {

    // Check if the email adress already exists. If it doesn't exist redirect the user to the register page
    if (users.filter(user => user.email.equals(req.body.emailAddress)).length == 0) {
        res.redirect('/register');
        return;
    }

    // Compare email address and password with users from 'database'
    // loggedIn = (users.filter(user => user.email.equals(req.body.emailAddress) && user.password.equals(req.body.password)).length > 0);
    loggedIn = (users.filter(user =>
        user.email.equals(req.body.emailAddress) &&
        bcrypt.compareSync(req.body.password, user.password)).length > 0);


    // If username and password don't match redirect to login page.
    if (!loggedIn) {
        res.redirect('/login');
        return;
    }

    // Ff the user data are valid check if the acount is already confirmed. If not redirect to confirm page...
    if (users.filter(user => user.status.equals('pending')).length > 0) {
        res.redirect('/confirm');
        return;
    }

    // user has successfully logged in 
    currentUser = users.filter(user => user.email.equals(req.body.emailAddress))[0];
    res.redirect('/secret');
});

//============================================================================

app.get('/logout', (req, res) => {
    loggedIn = false;
    currentUser = {};
    res.render('logout', { title: title, loginFailed: false, loggedIn: loggedIn, user: currentUser ? currentUser.firstName : "" })
});

//============================================================================

app.get('/register', (req, res) => {
    res.render('register', { title: title })
});
//----------------------------------------------------------------------------
app.post('/register', (req, res, next) => {

    const baseUrl = req.protocol + '://' + req.get('host');

    // check if the email adress already exists...
    // if it already exists send the user to the login page
    if (users.filter(user => user.email.equals(req.body.emailAddress)).length > 0) {
        res.redirect('/login');
        return;
    }

    // the user does not exist so add a new user to user database with status confirmation pending
    const newUser = {
        id: uuidv4(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.emailAddress,
        password: bcrypt.hashSync(req.body.password, saltRounds),
        confirmationCode: uuidv4(),
        status: 'pending'
    };
    users.push(newUser);

    // write database, send confirmation mail
    fs.writeFile('./data/users.json', JSON.stringify(users, null, 4), "utf-8", (err) => {
        if (err) throw err;

        sendConfirmationMail(baseUrl, newUser.email, newUser.confirmationCode);
        res.render('confirm', { title: title, email: newUser.email, confirmationCode: newUser.confirmationCode });
    });
});

//============================================================================

app.get('/confirm/:code', (req, res) => {

    let index = users.findIndex(user => user.confirmationCode.equals(req.params.code));
    if (index > -1) {
        users[index].status = 'active';

        fs.writeFile('./data/users.json', JSON.stringify(users, null, 4), "utf-8", (err) => {
            if (err) throw err;
            currentUser = users[index];
            res.render('confirmed', { title: title },);
        });
    }
});
//----------------------------------------------------------------------------
app.post('/resend', (req, res) => {

    const baseUrl = req.protocol + '://' + req.get('host');

    sendConfirmationMail(baseUrl, req.body.emailAddress, req.body.confirmationCode);
    res.render('confirm', { title: title, email: req.body.emailAddress, confirmationCode: req.body.confirmationCode });
});

//============================================================================

app.get('/secret', (req, res) => {
    res.render('secret', { title: title, loggedIn: loggedIn, user: currentUser.firstName });
});


//****************************************************************************
function sendConfirmationMail(baseUrl, emailAddress, confirmationCode) {

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
        ${baseUrl}/confirm/${confirmationCode}`
    }

    transporter.sendMail(message, (err, info) => {
        if (err) throw err;
        // console.log(`Message sent to ${emailAddress}...`);
        // console.log(info);
    });
}

//****************************************************************************
Object.defineProperty(String.prototype, 'equals', {
    value(str) {
        return (this.toLowerCase() == str.toLowerCase());
    }
});
