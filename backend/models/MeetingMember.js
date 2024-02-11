const db = require("../startup/db")
const Sequelize = require("sequelize")

const MeetingMember = db.define(
  " MeetingMember",
  {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    meeting_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "MeetingMember",
  }
)

module.exports = MeetingMember
