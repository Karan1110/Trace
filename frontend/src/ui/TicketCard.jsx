import {
  Avatar,
  HoverCard,
  Flex,
  Text,
  Box,
  Heading,
  Badge,
} from "@radix-ui/themes";
import moment from "moment";
import { useNavigate, Link } from "react-router-dom";

export default function FollowingPointerDemo({ ticket }) {
  const navigate = useNavigate();

  return (
    <div className="relative  m-4 overflow-hidden h-full rounded-2xl transition duration-200 group bg-white hover:shadow-xl border w-96 border-zinc-100">
      <div className="w-full aspect-w-16 aspect-h-10 bg-gray-100 rounded-tr-lg rounded-tl-lg overflow-hidden xl:aspect-w-16 xl:aspect-h-10 relative">
        <img
          src={
            ticket.imageUrl ||
            "https://ui.aceternity.com/_next/image?url=%2Fdemo%2Fthumbnail.png&w=1920&q=75"
          }
          alt="thumbnail"
          layout="fill"
          objectFit="cover"
          className={`group-hover:scale-95 group-hover:rounded-2xl transform object-cover transition duration-200 w-full h-64 `}
        />
      </div>
      <div className=" p-4 text-left">
        <h2 className="font-bold my-4 text-lg text-zinc-700">{ticket.name}</h2>
        <Badge color={ticket.status !== "closed" ? "green" : "red"}>
          {ticket.status}{" "}
        </Badge>
        <HoverCard.Root>
          <HoverCard.Trigger>
            <Link
              href={`https://localhost:5173/users/${ticket.user.id}`}
              target="_blank"
              className="text-blue-600 font-medium"
            >
              {" "}
              @{ticket.user.name}
            </Link>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Flex gap="4">
              <Avatar size="3" fallback="R" radius="full" />
              <Box>
                <Heading size="3" as="h3">
                  {ticket.user.name}
                </Heading>
                <Text as="div" size="3" color="gray">
                  {ticket.user.email}
                </Text>
                <Text as="div" size="2" mt="3">
                  {ticket.user.department.name}
                </Text>
              </Box>
            </Flex>
          </HoverCard.Content>
        </HoverCard.Root>
        <h2 className="font-normal my-4 text-sm text-zinc-500">
          {ticket.description}
        </h2>
        <div className="flex flex-row justify-between items-center mt-5">
          <Badge>{ticket.department.name} </Badge>
          {ticket.timeTakenToCompleteInHours ? (
            <span className="text-sm text-gray-500 flex flex-row">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
              {ticket.timeTakenToCompleteInHours.toString()} hours
            </span>
          ) : (
            <span className="text-sm text-gray-500 flex flex-row">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.49998 0.5C5.49998 0.223858 5.72383 0 5.99998 0H7.49998H8.99998C9.27612 0 9.49998 0.223858 9.49998 0.5C9.49998 0.776142 9.27612 1 8.99998 1H7.99998V2.11922C9.09832 2.20409 10.119 2.56622 10.992 3.13572C11.0116 3.10851 11.0336 3.08252 11.058 3.05806L12.058 2.05806C12.3021 1.81398 12.6978 1.81398 12.9419 2.05806C13.186 2.30214 13.186 2.69786 12.9419 2.94194L11.967 3.91682C13.1595 5.07925 13.9 6.70314 13.9 8.49998C13.9 12.0346 11.0346 14.9 7.49998 14.9C3.96535 14.9 1.09998 12.0346 1.09998 8.49998C1.09998 5.13361 3.69904 2.3743 6.99998 2.11922V1H5.99998C5.72383 1 5.49998 0.776142 5.49998 0.5ZM2.09998 8.49998C2.09998 5.51764 4.51764 3.09998 7.49998 3.09998C10.4823 3.09998 12.9 5.51764 12.9 8.49998C12.9 11.4823 10.4823 13.9 7.49998 13.9C4.51764 13.9 2.09998 11.4823 2.09998 8.49998ZM7.49998 8.49998V4.09998C5.06992 4.09998 3.09998 6.06992 3.09998 8.49998C3.09998 10.93 5.06992 12.9 7.49998 12.9C8.715 12.9 9.815 12.4075 10.6112 11.6112L7.49998 8.49998Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
              {moment(ticket.deadline).fromNow()}
            </span>
          )}
          <div
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            className="relative  cursor-pointer z-10 px-6 py-2 bg-black text-white font-bold rounded-xl block text-xs"
          >
            Read More
          </div>
        </div>
      </div>
    </div>
  );
}
