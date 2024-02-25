const Sequelize = require("sequelize");
const db = require("../startup/db");
const User = require("./user");
const Department = require("./department");
const MeetingMember = require("./MeetingMember");

const Meeting = db.define(
  "Meeting",
  {
    name: Sequelize.STRING,
    duration: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    link: Sequelize.STRING,
    description: Sequelize.TEXT,
    department_id: Sequelize.INTEGER,
    startingOn: Sequelize.DATE,
    endingOn: Sequelize.DATE,
  },
  {
    timestamps: true,
  }
);

Department.hasMany(Meeting, {
  as: "meeetings",
  foreignKey: "department_id",
});

Meeting.belongsTo(Department, {
  as: "MeetingDepartment",
  foreignKey: "department_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Meeting.belongsToMany(User, {
  as: "Participants",
  through: MeetingMember,
  foreignKey: "meeting_id",
  otherKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.belongsToMany(Meeting, {
  as: "Meeting",
  through: MeetingMember,
  foreignKey: "user_id",
  otherKey: "meeting_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

MeetingMember.belongsTo(User, {
  foreignKey: "user_id",
  as: "MeetingMemberUser",
});

MeetingMember.belongsTo(Meeting, {
  foreignKey: "meeting_id",
  as: "MeetingMemberMeeting",
});

module.exports = Meeting;
