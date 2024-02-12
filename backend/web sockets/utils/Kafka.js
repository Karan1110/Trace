const { Kafka } = require("kafkajs")
const fs = require("fs")
const path = require("path")

const kafka = new Kafka({
  brokers: ["kafka-329a4bd9-karan-7208.a.aivencloud.com:10658"],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    mechanism: "plain",
    username: "avnadmin",
    password: "AVNS_aENUHTmChXDosAD1p2X",
  },
})
let producer = null

export async function createProducer() {
  if (producer) return producer
  const _producer = kafka.producer()
  await _producer.connect()
  producer = _producer
  return producer
}

export async function produceMessage(Chats, message, ws, req) {
  const producer = await createProducer()
  const msg = {
    key: `${Date.now()}-message`,
    value: JSON.stringify(message),
    isRead: false,
    channel: req.params.channel,
    chat_id: req.params.chat,
    user_id: req.user.id,
  }

  const chatKey = `${req.params.chat}_${req.params.channel}`
  const otherClients = Chats[chatKey].filter((connection) => connection !== ws)

  if (otherClients.length > 0) {
    m.isRead = true
  }

  await producer.send({
    messages: [msg],
    topic: "message",
  })
  return true
}

export async function startConsumingMessages(Chats, req) {
  try {
    // Consume messages from Kafka
    console.log("Consumer is running..")
    const consumer = kafka.consumer({ groupId: "default" })
    await consumer.connect()
    await consumer.subscribe({ topic: "message", fromBeginning: true })

    await consumer.run({
      eachMessage: async ({ message, pause }) => {
        try {
          const msg = JSON.parse(message)
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
          // Assuming 'm' is defined somewhere in your code
          await Message.create(msg)
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
