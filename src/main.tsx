import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {Toaster} from "react-hot-toast"
import './index.css'
import './i18n/config'
import { BrowserRouter } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position='top-left' />
    </BrowserRouter>
  </React.StrictMode>,
)
