import { Main } from "next/document";
import Banner from "./components/Banner";
import Navbar from "./components/Navbar";
import MainPage from "./components/MainPage";

export default function Home() {
 return(
  <div className="bg-black h-screen w-full">
     <Navbar/>
      <MainPage/>
  </div>
 )
}
