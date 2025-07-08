// src/environment.js

const IS_PROD = true;

const server = IS_PROD
    ? "https://synccall-backend.onrender.com" 
    : "http://localhost:3000";

export default server;
