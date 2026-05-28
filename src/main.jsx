import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import App from './App.jsx';
import './index.css';
import { UserProvider } from "./context/UserContext.jsx"; 
import { Toaster } from "react-hot-toast";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <BrowserRouter>
    <UserProvider>
      <App />
      <Toaster position="top-right" />
    </UserProvider>
   </BrowserRouter>
  </React.StrictMode>
);

