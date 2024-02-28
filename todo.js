// suggest accounts to follow in frontend
// direct messages
// upload PDFs
// make the juice out of meetings route
// make the juice out of notifications api
// starting in and ended ago values in the meeting cards in the frontend
// show all the assigned member for a meeting...

/* 
 <div className="flex items-center justify-center space-x-5 space-y-5">
              {meetings.map((meeting) => (
                <div className=" max-w-md  p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {meeting.name}
                  </h5>
                  <p className="mb-3 text-sm max-w-sm  text-gray-700 dark:text-gray-400">
                    {meeting.description ||
                      "Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order."}
                  </p>
                  <p className="mb-3 space-x-3">
                    <Badge color="red">
                      {Math.abs(
                        moment(meeting.startingOn).diff(
                          moment(meeting.endingOn),
                          "hours"
                        )
                      )}
                    </Badge>

                    <Badge
                      color={
                        moment().isAfter(moment(meeting.startingOn))
                          ? "red"
                          : "green"
                      }
                    >
                      {moment().isAfter(meeting.startingOn)
                        ? moment(meeting.startingOn).fromNow()
                        : moment(meeting.startingOn).calendar()}
                    </Badge>
                  </p>
                  <div className="space-x-3">
                    {user.Meeting.some((m) => m.id == meeting.id) == true ||
                    moment().isBefore(moment(meeting.endingOn)) ==
                      true ? null : (
                      <Button
                        onClick={() =>
                          addMeetingToSchedule(meeting.id, meeting)
                        }
                      >
                        Add
                        <ArrowRightIcon />
                      </Button>
                    )}
                    <Button href={meeting.link}>Join</Button>
                  </div>
                </div>
              ))}
            </div>

*/
