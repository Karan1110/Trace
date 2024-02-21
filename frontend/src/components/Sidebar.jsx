import { BsPlus, BsFillLightningFill, BsGearFill } from "react-icons/bs"
import { FaFire, FaPoo } from "react-icons/fa"

import { useUser } from "../contexts/userContext"

const SideBar = ({ setId }) => {
  const user = useUser()
  return (
    <div
      className="fixed top-0 left-0 h-screen w-16 flex flex-col
                  bg-white dark:bg-gray-900 shadow-lg"
    >
      <SideBarIcon icon={<FaFire size="28" />} />
      <Divider />
      {user.Chats.map((chat) => (
        <SideBarIcon
          icon={<BsFillLightningFill size="20" />}
          onClick={() => setId(chat.id)}
        />
      ))}
      <SideBarIcon icon={<BsPlus size="32" />} />
      <Divider />
      <SideBarIcon icon={<BsGearFill size="22" />} />
    </div>
  )
}

const SideBarIcon = ({ icon, text = "tooltip 💡" }) => (
  <div className="sidebar-icon group">
    {icon}
    <span class="sidebar-tooltip group-hover:scale-100">{text}</span>
  </div>
)

const Divider = () => <hr className="sidebar-hr" />

export default SideBar
