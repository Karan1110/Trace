import { useUser } from "../contexts/userContext";
import Tooltip from "../ui/tool-tip";

const SideBar = ({ setId }) => {
  let user = useUser();

  return (
    <div className="fixed top-0 border-r  left-0 z-40 w-48 h-screen p-4 overflow-y-auto transition-transform bg-white dark:bg-gray-800">
      <div className="py-4 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center">
        {user.chats.length > 0 && (
          <Tooltip
            items={user.chats.map((c) => {
              return {
                id: c.chat_id,
                name: c.name,
                designation: "not decided",
                image:
                  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
              };
            })}
            setId={setId}
          />
        )}
      </div>
    </div>
  );
};

export default SideBar;
