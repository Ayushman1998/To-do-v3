const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const path = require('path');
// We are using package 'express-session' for token/session based authentication
// There is also another package 'jsonwebtoken' for token/session based authentication
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);

const UserSchema = require('./UserSchema');
const TodoSchema = require('./TodoSchema');

const app = express();

// tutorial is database name in both commands

// for local db
// const mongoURI = `mongodb://127.0.0.1:27017/tutorial`;

// for serverside db
const mongoURI = ``;

const store = new mongoDBSession({
    uri: mongoURI,
    collection: 'sessions'
});

// Middleware -> After request before api call
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'learn tutorial',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: store
}));

mongoose.connect(mongoURI)
    .then(res => {
        console.log('Connected to database successfully');
    }).catch(err => {
        console.log(err);
    });

// Middleware for AUTH
function checkAuth(req, res, next) {
    if (req.session.isAuth) {
        next();
    } else {
        return res.send({
            status: 400,
            message: "You are not logged in. Please log in"
        });
    }
}

const accessStore = {};

const rateLimiting = (req, res, next) => {

    const sessionId = req.session.id;

    if(!sessionId){
        return res.send({
            status: 404,
            message: "Bad Request"
        });
    }

    // If lastAccessTime is undefined user accessing api for the first time
    const lastAccessTime = accessStore[sessionId];

    if(!lastAccessTime){
        accessStore[sessionId] = Date.now();
        next();
        return;
    }

    const currentTime = Date.now();
    const diff = currentTime - lastAccessTime;

    if(diff < 1000){
        return res.send({
            status: 400,
            message: "Too many request. Please try after some time."
        });
    }

    console.log(accessStore);

    accessStore[sessionId] = Date.now();
    next();

}

// let users = [
//     {
//         userId: 1,
//         name: "Karl"
//     }
// ];

// let nextUserId = 2;

app.get('/', rateLimiting, (req, res) => {
    res.send("Welcome to our app");
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err

        res.send(`You are successfully logged out`);

    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/profile', (req, res) => {
    if (req.session.isAuth) {
        res.send(`Welcome ${req.session.user.username} to profile`);
    }
    else {
        res.send("You are not logged in. Please log in");
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.isAuth) {
        res.send("You are not logged in. Please log in");
    }
    else {
        res.render('dashboard');
    }
});

// app.get('/checkout/:id', (req, res) => {
//     console.log(req.params.id);
//     res.send("welcome to checkout");
// });

// app.get('/order', (req, res) => {
//     console.log(req.query);
//     res.send("welcome to query");
// });

// app.post('/payment', (req, res) => {
//     console.log(req, res);
//     res.send("welcome to payment");
// });

// app.post('/profile', (req, res) => {
//     const name = req.body.name;
//     const user = {
//         userId: nextUserId,
//         name: name
//     }
//     nextUserId++;

//     users.push(user);

//     res.send("User registered successfully");
// });

// app.patch('/profile', (req, res) => {
//     const { name, userId } = req.body; // we can destructure data in any order

//     users.map(user => {
//         if(user.userId == userId){
//             user.name = name;
//         }
//         return user;
//     });

//     res.send("Update done successfully");
// });

// app.put('/profile', (req, res) => {
//     const { name, userId } = req.body;
//     let recordUpdated = false;

//     users.map(user => {
//         if(user.userId == userId){
//             user.name = name;
//             recordUpdated = true;
//         }
//         return user;
//     });

//     if(recordUpdated) {
//         return res.send("User updated successfully");
//     }

//     // let user = {
//     //     userId : userId,
//     //     name : name
//     // }

//     // Using shorthand notation works same as above if field name are same

//     let user = {
//         userId,
//         name
//     }

//     users.push(user);

//     res.send("User added successfully");
// });

// app.delete('/profile', (req, res) => {
//      const { userId } = req.body;

//      users = users.filter(user => user.userId !== userId);

//      res.send("User deleted successfully");
// });

// passing values as object in js we dont need to remember the order of data
function cleanUpAndValidate({ uname, username, email, password, phone }) {
    // we return a promise if data is valid

    return new Promise((resolve, reject) => {

        if (typeof (email) !== 'string')
            reject('Invalid Email');
        if (typeof (username) !== 'string')
            reject('Invalid Username');
        if (typeof (uname) !== 'string')
            reject('Invalid Name');
        if (typeof (password) !== 'string')
            reject('Invalid Password');

        // Empty strings evaluate to false
        if (!username || !password || !uname || !email) {
            reject('Invalid Data');

            if (username.length < 3 || username.length > 100)
                reject('Username should be 3 to 100 characters in length');

            if (password.length < 8 || password.length > 100)
                reject('Password should be 8 to 100 characters in length');
        }

        if (!validator.isEmail(email)) {
            reject('Invalid Email');
        }

        if (phone !== undefined && typeof (phone) !== 'string')
            if (phone.length !== 10)
                reject('Invalid Phone');

        resolve('Valid Data');
    });
}

app.post('/register', async (req, res) => {
    const { uname, username, password, phone, email } = req.body;

    // Validating data

    // passing values as object in js we dont need to remember the order of data
    try {
        const msg = await cleanUpAndValidate({ uname, username, password, phone, email });
    } catch (error) {
        return res.send({
            status: 400, // for failed
            message: error
        });
    }

    // checking if already user exists
    let userExists;
    try {
        userExists = await UserSchema.findOne({ email });
    } catch (error) {
        res.send({
            status: 400, // for failed
            message: "Internal Server Error. Please try again",
            error: error
        });
    }

    if (userExists) {
        return res.send({
            status: 400,
            message: "User with email already exists"
        });
    }

    try {
        userExists = await UserSchema.findOne({ username });
    } catch (error) {
        res.send({
            status: 400, // for failed
            message: "Internal Server Error. Please try again",
            error: error
        });
    }

    if (userExists) {
        return res.send({
            status: 400,
            message: "Username already taken"
        });
    }

    // Hash the password -> we using 'bcrypt' package can also use 'md5'
    // Plain to hash possible but vice versa is not possible
    const hashedPassword = await bcrypt.hash(password, 12);

    let user = new UserSchema({
        name: uname,
        username,
        password: hashedPassword,
        email,
        phone
    });

    try {
        const userDb = await user.save();
        res.send({
            status: 200,
            message: "Registration Successful",
            data: {
                _id: userDb._id,
                username: userDb.username,
                email: userDb.email
            }
        });
    } catch (error) {
        res.send({
            status: 400, // for failed
            message: "Internal Server Error. Please try again",
            error: error
        });
    }

})

app.post('/login', async (req, res) => {
    // loginId can be username or email
    const { loginId, password } = req.body;

    if (typeof (loginId) !== 'string' || typeof (password) !== 'string' || !loginId || !password) {
        return res.send({
            status: 400,
            message: "Invalid Data"
        });
    }

    // find() - May return multiple objects, returns empty array if nothing matches, returns an array of objects
    // findOne() - One object, returns null if nothing matches, returns an object

    let userDb;

    try {
        if (validator.isEmail(loginId)) {
            userDb = await UserSchema.findOne({ email: loginId }); // if directly loginId is send it checks with all keys
        } else {
            userDb = await UserSchema.findOne({ username: loginId });
        }
    } catch (error) {
        return res.send({
            status: 400,
            message: "Internal server error. Please try again"
        });
    }

    // console.log(userDb);

    if (!userDb) {
        return res.send({
            status: 400,
            message: "User not found",
            data: req.body
        });
    }

    const isMatch = await bcrypt.compare(password, userDb.password);

    if (!isMatch) {
        return res.send({
            status: 400,
            message: "Invalid Password",
            data: req.body
        });
    }

    req.session.isAuth = true;
    req.session.user = { username: userDb.username, email: userDb.email, userId: userDb._id };

    res.send({
        status: 200,
        message: "Logged in successfully"
    });
});

// create, read, update, delete (CRUD) operations
app.get('/read-todo', checkAuth, async (req, res) => {

    const userId = req.session.user.userId;
    let todos = [];

    // Limit is numbers of todos in each api call
    const LIMIT = 5;
    // skip is the numbers of todos we wish to skip
    const skip = req.query.skip || 0;
    // Aggregate - Doing multiple database operation simultaneously and it takes array
    // skip in SQL known as offset
    // Select * from todos where userId=${userId} LIMIT 5 OFFSET ${skip}

    try {
        // todos = await TodoSchema.find({ userId });
        todos = await TodoSchema.aggregate([
            { $match: { userId: userId.toString() } },
            // { $sort: { todo: 1 } }, // to sort the data according to the fields provided and 1 for ascending and -1 for descending
            {
                $facet: {
                    data: [{ $skip: parseInt(skip) }, { $limit: parseInt(LIMIT) }]
                }
            }
        ]);
    } catch (error) {
        return res.send({
            status: 400,
            message: "Internal server error. Please try again"
        });
    }

    return res.send({
        status: 200,
        message: "Read Successful",
        // data: todos
        data: todos[0].data // because aggregation adds additional field 'data' in the data
    });
});

app.post('/create-todo', checkAuth, async (req, res) => {

    const { todo } = req.body;

    if (typeof (todo) !== 'string' || !todo) {
        return res.send({
            status: 400,
            message: "Invalid Data"
        });
    }

    if (todo.length > 200) {
        return res.send({
            status: 400,
            message: "Todo text too long. Todo can be max 200 characters in length"
        });
    }

    const userId = req.session.user.userId;
    const creationDate = new Date();

    const todoCount = await TodoSchema.count({ userId });

    // const yesterDate = new Date(Date.now() - (24 * 60 * 60 * 1000));
    // const todoCount = await TodoSchema.count({ userId, creationDate: { $gt: yesterDate } });

    if (todoCount >= 1000) {
        return res.send({
            status: 400,
            message: "You have already created 1000 todos. Please delete old todos to create new ones"
        });
    }

    let todoData = new TodoSchema({
        todo,
        userId,
        creationDate
    });

    try {
        const todoDb = await todoData.save();
        res.send({
            status: 200,
            message: "Successful",
        });
    } catch (error) {
        res.send({
            status: 400, // for failed
            message: "Internal Server Error. Please try again",
            error: error
        });
    }

});

app.patch('/edit-todo', checkAuth, async (req, res) => {

    const { todoId, todoText } = req.body;

    if (typeof (todoText) !== 'string' || !todoText) {
        return res.send({
            status: 400,
            message: "Invalid Data"
        });
    }

    if (todoText.length > 200) {
        return res.send({
            status: 400,
            message: "Todo text too long. Todo can be max 200 characters in length"
        });
    }

    let updatedTodo = '';

    try {
        updatedTodo = await TodoSchema.findByIdAndUpdate(todoId, { todo: todoText, creationDate: new Date() });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Internal server error. Please try again"
        });
    }

    return res.send({
        status: 200,
        message: "Update Successful",
        data: updatedTodo
    });

});

app.delete('/delete-todo', checkAuth, async (req, res) => {

    const { todoId } = req.body;

    try {
        deletedTodo = await TodoSchema.findByIdAndDelete(todoId);
    } catch (error) {
        return res.send({
            status: 400,
            message: "Internal server error. Please try again"
        });
    }

    return res.send({
        status: 200,
        message: "Delete Successful",
        data: deletedTodo
    });

});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
