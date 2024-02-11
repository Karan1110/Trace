const Sequelize = require("sequelize")

module.exports = async (ChatRoom, user_id, chatRoom_id) => {
  console.log(chatRoom_id)
  await ChatRoom.update(
    {
      user_id: Sequelize.literal(`array_append(user_id, '${user_id}')`),
    },
    {
      where: { id: chatRoom_id },
    }
  )
}
