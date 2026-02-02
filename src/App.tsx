import { Routes, Route } from "react-router-dom"
import Banner from './Component/Banner/Banner'
import './App.css'
import Home from "./Pages/Home"
import LoginPage from "./Pages/LoginPage"
import Register from "./Pages/Register"
import AuthProvider from "./Context/userContext"
import AdminLayout from "./Admin/AdminLayout"
export default function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={ <Banner/> } />
          <Route path="/home" element={ <Home/> } />
          <Route path="/login" element={ <LoginPage/> } />
          <Route path="/register" element={ <Register/> } />
          {
            /* Admin Routes */
          }
          <Route path="/admin" element={ <AdminLayout/> } />
        </Routes>
      </AuthProvider>
    </>
  )
}
