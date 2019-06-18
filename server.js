require('dotenv').config();
const restricted = require('./restricted-middleware.js');
const bcrypt = require('bcryptjs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const session = require('express-session')
const knexSessionStore = require('connect-session-knex')(session);
const Users = require('./users/users-model.js')


const server = express();


const sessionConfig = {
  name: 'monkey', 
  secret: 'banana, foobar, hello world', 
  cookie: {
    maxAge: 1000 * 60 * 60, 
    secure: false,
    httpOnly: true 
  },
  resave: false, 
  saveUninitialized: true, 

  // 
  store: new knexSessionStore({
    knex: require('./data/dbConfig'),
    tableName: 'sessions', 
    sidfieldname: 'sid', 
    createTable: true, 
    clearInterval: 1000 * 60 * 60 
  })
};


server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig))


server.get('/', (req, res) => {
  res.json({ api: 'up' });
});

server.post('/api/register', (req, res) => {
    let user = req.body;
  
    const hash = bcrypt.hashSync(user.password, 10)
  
  user.password = hash;
  
    Users.add(user)
      .then(saved => {
        res.status(201).json(saved);
      })
      .catch(error => {
        console.log(error);
        res.status(500).json(error);
      });
  });
  
  server.post('/api/login', (req, res) => {
    let { username, password } = req.body;
  
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          res.status(200).json({ message: `Welcome ${user.username}!` });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        console.log(error);
        res.status(500).json(error);
      });
  });
  
  server.get('/api/users', restricted, (req, res) => {
    Users.find()
      .then(users => {
        res.json(users);
      })
      .catch(error => res.send(error));
  });
  
  server.get('/logout', (req, res) => {
    if(req.session) {
      req.session.destroy(error => {
        if(error) {
          res.send('you can checkout anytime you like, but you can never leave.')
        } else {
          res.send('bye, thanks for playing')
        }
      })
      } else {
        res.end()
    }
  })
  
  
module.exports = server;
