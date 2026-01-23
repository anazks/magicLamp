import { Routes, Route } from "react-router-dom"
import Banner from './Component/Banner/Banner'
import './App.css'
import Home from "./Pages/Home"
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={ <Banner/> } />
        <Route path="/home" element={ <Home/> } />
      </Routes>
    </>
  )
}
