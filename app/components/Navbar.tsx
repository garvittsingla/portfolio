import {  playfair } from "../layout"
import {Pickaxe} from "lucide-react"
import AnimatedIcon from "./AnimatedIcon"

const Navbar = () => {
    const links = [
        {name:"archive",link:"/archive"},
        {name:"blogs",link:"/blogs"},
        {name:"nerd",link:"/nerd"},
    ]
  return (
    <nav className="w-4/5 h-16 mx-auto bg--900 flex flex-col justify-center">
        <div className={`h-3/4 border-t border-t-1 border-b-1 border-zinc-800 rounded-md bg--500 flex justify-between items-center text-white  px-6 ${playfair.className} font-normal`}>
        <div className=" font-normal flex items-center">
           <span className="hover:underline cursor-pointer">Garvit Singla</span>
            <span className="text-xs ml-1 text-zinc-400 font-sans"><AnimatedIcon/></span>
            </div>
        <div className="flex gap-3">
            {links.map((item, index) => {
                return (
                    <a href={item.link} key={index} className=" px-3 py-1 rounded-xl hover:underline transition cursor-pointer font-normal">
                        {item.name}
                    </a>
                )
            })}
        </div>
    </div>
    </nav>
  )
}

export default Navbar