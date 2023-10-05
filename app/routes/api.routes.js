const express = require('express');
const { body, validationResult } = require('express-validator');
const userChat = require('../controllers/userChat.controller');
const conversation = require('../controllers/conversation.controller');
const message = require('../controllers/message.controller');

const router = express.Router();

// Rutas para UserChat
router.post('/api/userChat', userChat.create);
router.get('/api/userChat', userChat.findAll);
router.post('/api/userChat/login', userChat.login);

// Rutas para Conversation
router.post('/api/conversationC/:createdBy/:toConversation', conversation.createCouple);
router.post('/api/conversationG/:createdBy', conversation.createGroup);
router.get('/api/conversation/userChat/:idUser', conversation.findByUser);
router.get('/api/conversation/info/:idConversation', conversation.findInfo);

// Rutas para Message
router.post('/api/message/:createdBy', message.create);
router.delete('/api/message/:messageId', message.delete);

module.exports = router;
