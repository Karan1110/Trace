const Sequelize = require("sequelize")

module.exports = async (Chat, user_id, chat_id) => {
  console.log(chat_id)
  await Chat.update(
    {
      user_id: Sequelize.literal(`array_append(user_id, '${user_id}')`),
    },
    {
      where: { id: chat_id },
    }
  )
}
