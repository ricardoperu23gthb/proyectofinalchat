module.exports = (sequelize, Sequelize) => {
    const Conversation = sequelize.define("Conversation", {
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        type: {
            type: Sequelize.ENUM,
            values: ['CONVERSACION_GRUPAL','PAREJA']
        }
    });

    return Conversation;
};
