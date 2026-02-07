import React from "react"
import "leaflet/dist/leaflet.css"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "./context/ThemeContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
      <Toaster position="top-center" />
    </ThemeProvider>
  </BrowserRouter>
)
