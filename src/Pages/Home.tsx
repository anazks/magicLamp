import React from 'react'
import Service from '../Component/Services/Service'
import BottomBar from '../Component/Bars/BottomBar'
import NavBar from '../Component/Bars/NavBar'

export default function Home() {
  return (
    <>
      {/* Desktop / Laptop Navbar */}
      <div className="hidden md:block">
        <NavBar />
      </div>

      {/* Main Content */}
      <Service />

      {/* Mobile Bottom Bar */}
      <div className="block md:hidden">
        <BottomBar />
      </div>
    </>
  )
}
