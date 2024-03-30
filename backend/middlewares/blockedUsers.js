const prisma = require("../utils/prisma");

module.exports = async (req, res, next) => {
  const user = await prisma.users.findUnique({
    where : {
      id : req.user.id
    },
    select: {
      blockedUsers : true
    }
  });

  req.blockedUsers = user.blockedUsers;

  next();
};
