import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { WeirdModeProvider } from './context/WeirdModeContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <WeirdModeProvider>
            <App />
        </WeirdModeProvider>
    </React.StrictMode>,
)