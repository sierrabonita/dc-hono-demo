import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import { Client, cacheExchange, fetchExchange, Provider as UrqlProvider } from 'urql';
import App from '@/App.tsx';
import { Provider as ChakraProvider } from '@/libs/chakra';

// urqlクライアントの初期化
const client = new Client({
  url: 'http://localhost:3001/graphql', // HonoバックエンドのURL
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: {
    credentials: 'include', // HttpOnly Cookieを自動的にサーバーに送信する
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UrqlProvider value={client}>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </UrqlProvider>
  </StrictMode>,
);
