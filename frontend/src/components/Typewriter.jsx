import { TypewriterEffect } from "../ui/typewriter-effect";

export default function Typewriter({ avgTime }) {
  const words = [
    {
      text: "The",
    },
    {
      text: "average",
    },
    {
      text: "time",
    },
    {
      text: "taken",
    },
    {
      text: "to",
    },
    {
      text: "complete ",
    },
    {
      text: "a ",
    },
    {
      text: "ticket ",
    },
    {
      text: "is",
    },
    {
      text: `${avgTime}`,
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-[40rem] ">
      <p className="text-neutral-600 dark:text-neutral-200 text-base  mb-10">
        Welcome to the ultimate issue tracker - Trace
      </p>
      <TypewriterEffect words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-10">
        <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
          New Issue
        </button>
        {!localStorage.getItem("token") && (
          <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
            Signup
          </button>
        )}
      </div>
    </div>
  );
}
