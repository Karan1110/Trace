const Sequelize = require("sequelize")

module.exports = async (ChatRoom, channel, chatRoom_id) => {
  await ChatRoom.update(
    {
      channels: Sequelize.literal(
        `array_append(channels, '${channel || "general"}')`
      ),
    },
    {
      where: { id: chatRoom_id },
    }
  )
}
