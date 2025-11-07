"use client";
import { useEffect, useState } from "react";

export default function useMobile(){
    const [ismobile, setIsMobile] = useState(false);
    function checkMobile(){
        if(window.innerWidth <= 768){
            setIsMobile(true);
        }else{
            setIsMobile(false);
        }
    }

    useEffect(()=>{
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return ()=>{
            window.removeEventListener("resize", checkMobile);
        }
    },[])
    return {ismobile}
}