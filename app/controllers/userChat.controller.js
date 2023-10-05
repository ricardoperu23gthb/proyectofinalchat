const db = require("../models");
const bcrypt = require('bcrypt');
const UserChat = db.userChat;
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        const rules = [
            body('username').notEmpty().withMessage('Username is required'),
            body('email').isEmail().withMessage('Invalid email address').notEmpty().withMessage('Email is required'),
            body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').notEmpty().withMessage('Password is required'),
            body('firstname').notEmpty().withMessage('First name is required'),
            body('lastname').notEmpty().withMessage('Last name is required'),
        ];

        await Promise.all(rules.map(rule => rule.run(req)));

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        if (!hashedPassword) {
            return res.status(400).json({ message: 'Error encrypting the password' });
        }

        const userChat = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            firstname: req.body.firstname,
            lastname: req.body.lastname
        };

        const data = await UserChat.create(userChat);

        res.send(data);
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        await body('email').isEmail().notEmpty().run(req);
        await body('password').isLength({ min: 6 }).notEmpty().run(req);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userFound = await UserChat.findOne({ where: { email: req.body.email } });

        if (!userFound) {
            return res.status(404).json({ message: 'User not found' });
        }

        const matchPass = await bcrypt.compare(req.body.password, userFound.password);

        if (!matchPass) {
            return res.status(404).json({ message: 'Invalid Credentials' });
        }

        res.json({ token: generateAuthToken(userFound) });
    } catch (error) {
        next(error);
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const userList = await UserChat.findAll();

        if (userList) {
            res.status(200).send(userList);
        } else {
            throw new Error('Users list empty!');
        }
    } catch (error) {
        next(error);
    }
};


const generateAuthToken = (userData) => {
    const secretKey = '#PR0T3CT0_F1N4l_RIC4RD0%';
    const expiresIn = '1h';

    const payload = {
        id: userData.id,
        firstname: userData.firstname,
        lastname: userData.lastname,
        username: userData.username,
        email: userData.email
    };

    const token = jwt.sign({ payload }, secretKey, { expiresIn });
    return token;
};