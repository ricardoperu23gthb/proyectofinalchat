const db = require("../models");
const { validationResult, param, body } = require('express-validator');
const Conversation = db.conversation;
const UserInConversation = db.userInConversation;
const UserChat = db.userChat;
const Message = db.message;
const Op = db.Sequelize.Op;

exports.createCouple = async (req, res, next) => {
  try {
    const rules = [
      param('createdBy').notEmpty().isInt().withMessage('Invalid createdBy parameter'),
      param('toConversation').notEmpty().isInt().withMessage('Invalid toConversation parameter'),
      body('title').notEmpty().withMessage('Title is required'),
    ];

    await Promise.all(rules.map(rule => rule.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const conversation = { ...req.body };
    conversation['createdBy'] = req.params.createdBy;
    conversation['type'] = "PAREJA";

    const resConversation = await Conversation.create(conversation);

    if (resConversation) {
      const resUsrConOne = await UserInConversation.create({ UserChatId: req.params.createdBy, ConversationId: resConversation.id });
      const resUsrConTwo = await UserInConversation.create({ UserChatId: req.params.toConversation, ConversationId: resConversation.id });
      
      if (resUsrConOne && resUsrConTwo) {
        res.status(200).send({ userOne: resUsrConOne, userTwo: resUsrConTwo });
      } else {
        throw new Error('Error while the connection users of Conversation');
      }
    } else {
      throw new Error('Error while the creation of Conversation');
    }
  } catch (error) {
    next(error);
  }
};

exports.createGroup = async (req, res, next) => {
  try {
    const rules = [
      param('createdBy').notEmpty().isInt().withMessage('Invalid createdBy parameter'),
      body('title').notEmpty().withMessage('Title is required'),
      body('listUsers').isArray().withMessage('listUsers must be an array').notEmpty().withMessage('listUsers is required'),
    ];

    await Promise.all(rules.map(rule => rule.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const conversation = { ...req.body };
    conversation['createdBy'] = req.params.createdBy;
    conversation['type'] = "CONVERSACION_GRUPAL";

    const resConversation = await Conversation.create(conversation);

    if (resConversation) {
      try {
        let successUsersList = [];
        const insertUsers = conversation.listUsers.map(async (userChat) => {
          const resCreateUser = await UserInConversation.create({
            UserChatId: userChat,
            ConversationId: resConversation.id,
          });
          if (resCreateUser) {
            successUsersList.push(resCreateUser);
          }
        });
        await Promise.all(insertUsers);
        res.status(200).send({ message: "Create Conversation Successfully", log: successUsersList });
      } catch (err) {
        throw new Error('Internal Server Error');
      }
    } else {
      throw new Error('Error while the creation of Conversation');
    }
  } catch (error) {
    next(error);
  }
};

exports.findByUser = async (req, res, next) => {
  try {
    await param('idUser').notEmpty().isInt().withMessage('Invalid idUser parameter').run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userConversations = await UserInConversation.findAll({
        where: { UserChatId: req.params.idUser },
        include: {
          model: Conversation,
          as: 'Conversation',
        }
      });

      if (userConversations) {
        res.status(200).send(userConversations);
      } else {
        throw new Error('Empty list conversations');
      }
    } catch (error) {
      throw new Error('Internal Server Error');
    }
  } catch (error) {
    next(error);
  }
};

exports.findInfo = async (req, res, next) => {
  try {
    await param('idConversation').notEmpty().isInt().withMessage('Invalid idConversation parameter').run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const conversations = await Conversation.findByPk(req.params.idConversation, {
        include: [
          {
            model: UserChat
          },
          {
            model: Message,
            as: "messages"
          }
        ],
      });

      if (conversations) {
        res.status(200).send(conversations);
      } else {
        throw new Error('Empty list Conversations');
      }
    } catch (error) {
      throw new Error('Internal Server Error');
    }
  } catch (error) {
    next(error);
  }
};