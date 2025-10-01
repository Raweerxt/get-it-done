import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ต้องเรียกใช้ <App /> ซึ่งเป็น Root Component ที่มี <BrowserRouter> อยู่ภายใน */}
    <App />
  </React.StrictMode>
);

