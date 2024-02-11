const request = require("supertest")
const server = require("../index")
const User = require("../models/user")

describe("Test the application routes.", () => {
  let test_user
  let user_id
  let user

  beforeEach(async () => {
    test_user = {
      name: "test_user",
      email: "test@gmail.com",
      password: "test_password",
      isadmin: true,
    }
    user = await User.create({
      name: test_user.name,
      email: test_user.email,
      password: test_user.password,
      isadmin: test_user.isadmin,
    })
    user_id = user.dataValues.id
  })
  afterEach(async () => {
    await User.destroy({ where: {} })
    await server.close()
  })
  describe("POST:/users", () => {
    it("POST : Should return a 400 if a user already exists.", async () => {
      const res = await request(server).post("/users").send({
        email: test_user.email,
      })

      expect(res.text).toBe("USER ALREADY EXISTS...")
      expect(res.status).toBe(400)
    })

    it("POST : Should return a 200 and a auth-token with user rows.", async () => {
      const res = await request(server).post("/users").send({
        name: test_user.name,
        email: "test_2@gmail",
        password: test_user.password,
        isadmin: test_user.isadmin,
      })

      expect(res.text).toContain("token", "User")
      expect(res.statusCode).toBe(201)
      console.log(res)
    })

    it("PUT : Should return a 200 and a auth-token with user rows.", async () => {
      const test_name = "test_name_2"

      const res = await request(server).put(`/users/${user_id}`).send({
        name: test_name,
        email: "test_2@gmail",
        password: test_user.password,
        isadmin: test_user.isadmin,
      })

      expect(res.text).toContain("User")
      expect(res.text.User).toBe(test_name)
      expect(res.statusCode).toBe(200)
    })

    it("PUT : Should return a 200 and a auth-token with user rows.", async () => {
      const test_name = "test_name_2"

      const res = await request(server).put("/users/").send({
        name: test_name,
        email: "test_2@gmail",
        password: test_user.password,
        isadmin: test_user.isadmin,
      })

      expect(res.text).toContain("User")
      expect(res.text.User).toBe(test_name)
      expect(res.statusCode).toBe(200)
    })
  })
})
