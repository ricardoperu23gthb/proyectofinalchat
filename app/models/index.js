'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.conversation = require("./conversation.model.js")(sequelize, Sequelize);
db.userChat = require("./userChat.model.js")(sequelize, Sequelize);
db.message = require("./message.model.js")(sequelize, Sequelize);
db.userInConversation = require("./userInConversation.model.js")(sequelize, Sequelize);

const UserChat = db.userChat;
const Conversation = db.conversation;
const Message = db.message;
const UserInConversation = db.userInConversation;

UserChat.hasMany(Conversation, { foreignKey: "createdBy", as: "conversations" });
Conversation.belongsTo(UserChat, {
  foreignKey: "createdBy",
  as: "user"
});

UserChat.hasMany(Message, { foreignKey: "createdBy", as: "messages" });
Message.belongsTo(UserChat, {
  foreignKey: "createdBy",
  as: "user"
});

Conversation.hasMany(Message, { foreignKey: "conversationId", as: "messages" });
Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation"
});

UserChat.belongsToMany(Conversation, {
  through: UserInConversation
});

Conversation.belongsToMany(UserChat, {
  through: UserInConversation
});

UserInConversation.belongsTo(UserChat, { foreignKey: 'UserChatId'});
UserInConversation.belongsTo(Conversation, { foreignKey: 'ConversationId'});



module.exports = db;
