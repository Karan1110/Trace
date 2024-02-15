const { Kafka } = require("kafkajs")
const fs = require("fs")
const Message = require("../../models/message")
const path = require("path")
const config = require("config")

const kafka = new Kafka({
  brokers: [config.get("kafka_broker")],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    mechanism: "plain",
    username: config.get("kafka_username"),
    password: config.get("kafka_password"),
  },
})

let producer = null

const createProducer = async () => {
  if (producer) return producer
  const _producer = kafka.producer()
  await _producer.connect()
  producer = _producer
  return producer
}

exports.produceMessage = async function produceMessage(
  Chats,
  message,
  ws,
  req,
  edit = false,
  msgId = null
) {
  const producer = await createProducer()
  const msg = {
    key: `${Date.now()}-message`,
    value: JSON.stringify(message),
    isRead: false,
    channel: req.params.channel,
    chat_id: req.params.chat,
    user_id: req.user.id,
    edit: edit,
    msgId: msgId,
  }

  const chatKey = `${req.params.chat}_${req.params.channel}`
  const otherClients = Chats[chatKey].filter((connection) => connection !== ws)

  if (otherClients.length > 0) {
    m.isRead = true
  }

  await producer.send({
    messages: [{ value: JSON.stringify(msg) }],
    topic: "message",
  })
  return true
}

exports.startConsumingMessages = async function startConsumingMessages(
  Chats,
  req
) {
  try {
    // Consume messages from Kafka
    console.log("Consumer is running..")
    const consumer = kafka.consumer({ groupId: "default" })
    await consumer.connect()
    await consumer.subscribe({ topic: "message", fromBeginning: true })

    await consumer.run({
      eachMessage: async ({ message, pause }) => {
        try {
          const msg = JSON.parse(message.value.toString())
          if (msg.edit == true) {
            Chats[`${req.params.chat}_${req.params.channel}`].forEach(
              (connection) => {
                connection.send(
                  JSON.stringify({
                    id: msg.msgId,
                    value: msg.value,
                    edited: true,
                  })
                )
              }
            )

            await Message.update(
              {
                value: msg.value,
              },
              {
                where: {
                  id: msg.msgId,
                },
              }
            )
          } else {
            Chats[`${req.params.chat}_${req.params.channel}`].forEach(
              (connection) => {
                connection.send(
                  JSON.stringify({
                    key: msg.key,
                    value: msg.value,
                    user_id: msg.user_id,
                    isRead: msg.isRead,
                    channel: msg.channel,
                  })
                )
              }
            )

            const createdMessage = await Message.create({
              value: msg.value,
              isRead: JSON.parse(msg.isRead),
              channel: msg.channel,
              chat_id: parseInt(msg.chat_id),
              user_id: parseInt(msg.user_id),
            })
            console.log(createdMessage)
          }
        } catch (ex) {
          console.log("Error processing message:", ex.message)
          // Pause the consumer and resume after a delay
          pause()
          setTimeout(() => {
            consumer.resume([{ topic: "message" }])
          }, 60 * 1000)
        }
      },
    })
  } catch (ex) {
    console.log("Error occurred while consuming messages:", ex.message)
  }
}
