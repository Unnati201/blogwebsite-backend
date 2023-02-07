const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connection } = require('../connection');
const verify = require('../middleware/verify');
const { ObjectId } = require('mongodb');

const router = express.Router();

//Get all the users route
router.get('/all', verify, async (req, res) => {
  const { db } = await connection();

  const users = await db
    .collection('users')
    .find({}, { projection: { password: false } })
    .toArray();

  if (!users) {
    return res.send({ message: 'No users found!' });
  }

  return res.send({ message: 'Successfully got users', users });
});

//Get a specific user
router.get('/single/:userId', verify, async (req, res) => {
  try {
    const { db } = await connection();

    const userId = req.params.userId;

    const user = await db
      .collection('users')
      .findOne({ _id: ObjectId(userId) }, { projection: { password: false } });

    if (!user) {
      return res.send({
        message: `User with this email ${email} does not exists`,
      });
    }

    return res.send({ message: 'Successfully got users', user });
  } catch (err) {
    res.send({ err });
  }
});

//Register a new user route
router.post('/register', async (req, res) => {
  const { db } = await connection();
  const { name, email, password } = req.body;

  //Checking for empty values
  if (!name || !email || !password) {
    return res
      .status(400)
      .send({ error: 'Body is missing some of the required properties' });
  }

  //Checking if mail exists
  const mailExist = await db.collection('users').findOne({ email: email });
  if (mailExist) {
    return res
      .status(500)
      .json({ message: 'User Already Exists', isSuccess: false });
  }

  //hashing/encrypting password
  const hashedPassword = await bcrypt.hash(password, 10);

  //saving a single user
  const user = await db.collection('users').insertOne({
    name,
    email,
    password: hashedPassword,
  });

  return res.status(201).json({
    message: 'Successfully Registered a user',
    user,
    isSuccess: true,
  });
});

//Login a user route
router.post('/login', async (req, res) => {
  const { db } = await connection();
  const { email, password } = req.body;

  //Checking for empty values
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Body is missing some of the required properties' });
  }

  //Checking if user is registered or not
  const user = await db.collection('users').findOne({ email });
  if (!user) {
    return res.send({ message: 'User does not exist!', isSuccess: false });
  }

  //Comparing the passwords
  const passwordIsTrue = await bcrypt.compare(password, user?.password);

  //Generating token
  const secretkey = 'someprivatekey';
  const token = jwt.sign({ _id: user?._id, name: user?.name }, secretkey, {
    expiresIn: 200000,
  });

  if (passwordIsTrue) {
    return res.status(201).json({
      message: 'User logged in successfully',
      email,
      token,
      isSuccess: true,
    });
  } else {
    return res.status(201).json({
      message: 'Password is wrong!',
      isSuccess: false,
    });
  }
});

//Update a user route
router.put('/update/:id', verify, async (req, res) => {
  try {
    const { db } = await connection();
    const { name } = req.body;
    const id = req.params.id;

    console.log('Route reached');

    await db
      .collection('users')
      .updateOne({ _id: ObjectId(id) }, { $set: { name } });

    return res.send({ message: 'Successfully updated a user' });
  } catch (err) {
    res.send({ err });
  }
});

router.delete('/deleteOne/:id', verify, async (req, res) => {
  try {
    const { db } = await connection();
    const id = req.params.id;

    const userExists = await db
      .collection('users')
      .findOne({ _id: ObjectId(id) });

    console.log({ userExists });

    if (userExists) {
      const deletedUser = await db
        .collection('users')
        .deleteOne({ _id: ObjectId(id) });

      return res.send({ message: 'Successfully deleted a user', deletedUser });
    } else {
      return res.send({ message: 'User does not exits!' });
    }
  } catch (err) {
    return res.send({ err });
  }
});

module.exports = router;
