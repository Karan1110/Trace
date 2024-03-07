import { FollowerPointerCard } from "./following-pointer";
import { Avatar } from "@radix-ui/themes";

export function FollowingPointerDemo({ ticket }) {
  return (
    <div className="w-80 mx-auto">
      <FollowerPointerCard
        title={
          <TitleComponent
            title={ticket.dataValues.User.name}
            avatar={ticket.dataValues.User.name[0]}
          />
        }
      >
        <div className="relative overflow-hidden h-full rounded-2xl transition duration-200 group bg-white hover:shadow-xl border border-zinc-100">
          <div className="w-full aspect-w-16 aspect-h-10 bg-gray-100 rounded-tr-lg rounded-tl-lg overflow-hidden xl:aspect-w-16 xl:aspect-h-10 relative">
            <img
              src={ticket.imageUrl}
              alt="thumbnail"
              layout="fill"
              objectFit="cover"
              className={`group-hover:scale-95 group-hover:rounded-2xl transform object-cover transition duration-200 `}
            />
          </div>
          <div className=" p-4">
            <h2 className="font-bold my-4 text-lg text-zinc-700">
              {ticket.name}
            </h2>
            <h2 className="font-normal my-4 text-sm text-zinc-500">
              {ticket.description}
            </h2>
            <div className="flex flex-row justify-between items-center mt-10">
              <span className="text-sm text-gray-500">
                {moment(ticket.createdAt).fromNow()}
              </span>
              <div className="relative z-10 px-6 py-2 bg-black text-white font-bold rounded-xl block text-xs">
                Read More
              </div>
            </div>
          </div>
        </div>
      </FollowerPointerCard>
    </div>
  );
}

const TitleComponent = ({ title, avatar }) => (
  <div className="flex space-x-2 items-center">
    <Avatar fallback={avatar} rounded={true} />
    <p>{title}</p>
  </div>
);
