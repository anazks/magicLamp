import BottomBar from '../Component/Bars/BottomBar'
import NavBar from '../Component/Bars/NavBar'
import Footer from '../Component/Footer/Footer'

export default function Home() {
  return (
    <>
      {/* Desktop / Laptop Navbar */}
      <div className="hidden md:block">
        <NavBar />
      </div>

      {/* Main Content */}
      {/* <Service /> */}

      {/* Footer → ONLY Desktop */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Bottom Bar */}
      <div className="block md:hidden">
        <BottomBar />
      </div>
    </>
  )
}
