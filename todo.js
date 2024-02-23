// suggest accounts to follow in frontend
// direct messages
// upload PDFs
// make the juice out of departments route
// make the juice out of meetings route
// make the juice out of notifications api
// starting in and ended ago values in the meeting cards in the frontend

const currentTime = moment();
const targetTime = moment(meeting.from);
const isPast = currentTime.isAfter(targetTime);

if (!isPast) {
  return res.status(400).json({
    message: "meeting has not yet been started...",
  });
}
