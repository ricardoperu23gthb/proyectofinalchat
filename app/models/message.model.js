module.exports = (sequelize, Sequelize) => {
    const Message = sequelize.define("Message", {
        content: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    return Message;
};
