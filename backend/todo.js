//   READ, ADD and REMOVE - Reviews*
//   UPDATE and DELETE users
//   login  - frontend
//   UPDATE and DELETE meetings*

//   READ statistics
//   task dependencies
//   reminders
//   github Integration
//   time tracking
// improve scoring system and leaderboard..

/* 
features - 
chat - done
video call - done
meeting management - done
ticket filtering and sorting - done
user login/signup - done
notifications - done
Colleagues - done
save post - done
comment - done
block user
Review
leaderboards
statistics
mardkdown edtior
*/
;(async function run() {
  await producer.send({
    topic: "message",
    messages: [{ value: "Hello KafkaJS user!" }],
  })
  await producer.disconnect()

  const consumer = kafka.consumer({ groupId: "test-group" })

  await consumer.connect()
  await consumer.subscribe({ topic: "message", fromBeginning: true })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
      })
    },
  })
})()
