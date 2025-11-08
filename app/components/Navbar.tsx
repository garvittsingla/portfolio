"use client"
import {  IBM } from "../fonts/IBM"
import AnimatedIcon from "./AnimatedIcon"
import useMobile from "../hooks/useMobile"
import { useState } from "react"

 const links = [
        {name:"archive",link:"/archive"},
        {name:"blogs",link:"/blogs"},
        {name:"nerd",link:"/nerd"},
    ]

const Mobilenav = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer px-3 py-2 text-zinc-200 hover:bg-zinc-800/60 rounded-md transition"
      >
        ☰
      </button>

      {open && (
        <div className="
          fixed top-20
          left-1/2 -translate-x-1/2
          w-[90vw]
          max-w-2xl
          max-h-[calc(100vh-100px)]
          overflow-y-auto
          bg-[#181818]/70 
          backdrop-blur-xl 
          rounded-2xl 
          border border-white/10 
          shadow-[0px_0px_35px_-8px_rgba(0,0,0,0.6)] 
          px-6 py-8 
          flex flex-col gap-6
          animate-in fade-in-0 slide-in-from-top-4 duration-300
          z-50
        ">
          

         { (links.map((item, index) => {
                return (
                    <a href={item.link} key={index} className=" px-3 py-1 rounded-xl hover:underline transition cursor-pointer font-normal">
                        {item.name}
                    </a>
                )
            }))}
          <hr className="opacity-40" />

          
          <div className="flex justify-between items-center">
            <button className="text-zinc-300 hover:text-white transition">⏸︎</button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:bg-white/10 transition">
              {/* <Moon size={18} className="text-zinc-200" /> */}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const Navbar = () => {
   
    const {ismobile} = useMobile();
   
  return (
    <nav className=" w-4/5 h-16 mx-auto bg--900 flex flex-col justify-center">
        <div className={`h-3/4 border-t border-t-1 border-b-1 border-zinc-800 rounded-md bg--500 flex justify-between items-center text-white  sm:px-6 ${IBM.className} font-normal`}>
        <div className=" font-normal flex items-center">
           <span className="hover:underline cursor-pointer">Garvit Singla</span>
            <span className="text-xs ml-1 text-zinc-400 font-sans"><AnimatedIcon/></span>
            </div>
        <div className="flex gap-3 ">
            {ismobile ? (
                <Mobilenav/>
            ) :
            (links.map((item, index) => {
                return (
                    <a href={item.link} key={index} className=" px-3 py-1 rounded-xl hover:underline transition cursor-pointer font-normal">
                        {item.name}
                    </a>
                )
            }))}
            
        </div>
    </div>
    </nav>
  )
}

export default Navbar