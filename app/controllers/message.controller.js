const db = require("../models");
const { validationResult, body, param } = require('express-validator');
const Message = db.message;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
  try {
    const rules = [
      param('createdBy').notEmpty().isInt().withMessage('Invalid createdBy parameter'),
      body('content').notEmpty().withMessage('Content is required'),
      body('conversationId').notEmpty().isInt().withMessage('Invalid conversationId'),
    ];

    await Promise.all(rules.map(rule => rule.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let message = { ...req.body };
    message['createdBy'] = req.params.createdBy;

    const resMessage = await Message.create(message);

    if (resMessage) {
      res.status(200).send(resMessage);
    } else {
      throw new Error('Error while message create');
    }
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await param('messageId').notEmpty().isInt().withMessage('Invalid messageId parameter').run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resMessage = await Message.destroy({ where: { id: req.params.messageId } });

    if (resMessage) {
      res.status(200).send({ message: "Message removed successfully" });
    } else {
      throw new Error('Invalid Conversation Id');
    }
  } catch (error) {
    next(error);
  }
};