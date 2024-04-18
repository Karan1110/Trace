const { Kafka } = require("kafkajs");
const fs = require("fs");
const path = require("path");
const config = require("config");
const prisma = require("../../utils/prisma");

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
});

console.log(fs.readFileSync(path.resolve("./ca.pem"), "utf-8"));

let producer = null;

const createProducer = async () => {
  if (producer) return producer;
  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
};

exports.produceMessage = async function produceMessage(
  message,
  req,
  edit,
  msgId,
  url,
  deleted
) {
  const producer = await createProducer();
  const msg = {
    id: msgId,
    value: JSON.stringify(message),
    channel_id: req.channel.id,
    user_id: req.user.id,
    edit: edit,
    url: url,
    deleted: deleted,
  };

  await producer.send({
    messages: [{ value: JSON.stringify(msg) }],
    topic: "message",
  });
  console.log("message produced..........!!!!!!!!!");
  return true;
};

exports.startConsumingMessages = async function startConsumingMessages(
  channel
) {
  try {
    console.log("message consumed.............!!!!!!!!!");
    const consumer = kafka.consumer({ groupId: "default" });
    await consumer.connect();
    await consumer.subscribe({ topic: "message", fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message, pause }) => {
        try {
          const msg = JSON.parse(message.value.toString());
          const temp2 = msg.value.split("~");
          const value = temp2[0];

          if (msg.edit == true) {
            await prisma.messages.update({
              data: {
                value: value,
              },
              where: {
                id: msg.id,
              },
            });
          } else if (msg.deleted == true) {
            await prisma.messages.update({
              data: {
                deleted: true,
              },
              where: {
                id: msg.id,
              },
            });
          } else {
           const msg =  await prisma.messages.create({
              data: {
                id: msg.id,
                value: msg.value,
                channel_id: channel.id,
                user_id: parseInt(msg.user_id),
                url: msg.url,
              },
           });
            console.log("just created this msg",msg);
          }
        } catch (ex) {
          console.error("Error processing message:", ex.message, ex);
          pause();
          setTimeout(() => {
            consumer.resume([{ topic: "message" }]);
          }, 60 * 1000);
        }
      },
    });
  } catch (ex) {
    console.log("Error occurred while consuming messages:", ex.message);
  }
};
