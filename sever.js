'use strict';

const { name } = require('ejs');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const port = 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


const db = {
    users: [
        {
            id: 1,
            email: "nguyenvana@gmail.com",
            password: "123123",
            name: "nguyenvana"
        },
    ],
};

const sessions = {};

// [GET]
app.get('/', (req, res) => {
    res.render("pages/index");
});
app.get('/login', (req, res) => {
    res.render("pages/login");
});
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if(user) {
        const sessionId = new Date().getTime().toString();
        sessions[sessionId] = {
            userId: user.id
        };
        res.setHeader('Set-Cookie', `sessionId=${sessionId}; max-age=3600; httpOnly;`).redirect('/dashboard'); //Secure
        return;
    }
    res.json({ error: "Invalid username or password" });

});

app.use((req, res, next) => {
    const sessionId = req.cookies.sessionId;
    if(sessionId) {
        const session = sessions[sessionId];
        if(session) {
            const user = db.users.find(u => u.id === session.userId);
            if(user) {
                req.user = user;
                next();
                return;
            }
        }
    }
    res.redirect('/login');
})
app.get('/dashboard', (req, res) => {
    const user = req.user;
    res.render("pages/dashboard", {user});
});

app.get('/logout', (req, res) => {
    delete sessions[req.cookies.sessionId];
    res.setHeader('Set-Cookie', `sessionId=; max-age=0; httpOnly;`).redirect('/login');
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})