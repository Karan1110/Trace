const Sequelize = require("sequelize")

module.exports = async (Chat, channel, chat_id) => {
  await Chat.update(
    {
      channels: Sequelize.literal(`array_append(channels, '${channel}')`),
    },
    {
      where: { id: chat_id },
    }
  )
}
