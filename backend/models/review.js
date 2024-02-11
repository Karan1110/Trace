// review.js

const Sequelize = require("sequelize")
const db = require("../startup/db")
const User = require("./user") // Import the User model

const Review = db.define(
  "Review",
  {
    title: Sequelize.STRING,
    content: Sequelize.TEXT,
    rating: Sequelize.INTEGER,
  },
  {
    timestamps: true,
  }
)

// Establishing the association
Review.belongsTo(User, {
  as: "User", // Alias for the association
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

User.hasMany(Review, {
  as: "Reviews",
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

module.exports = Review
