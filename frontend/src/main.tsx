import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Client, Provider, cacheExchange, fetchExchange } from 'urql';

// urqlクライアントの初期化
const client = new Client({
  url: 'http://localhost:3001/graphql', // HonoバックエンドのURL
  exchanges: [cacheExchange, fetchExchange],
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </StrictMode>,
);