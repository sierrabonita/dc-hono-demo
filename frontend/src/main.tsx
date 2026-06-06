import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import App from '@/App.tsx';
import { Client, Provider as UrqlProvider, cacheExchange, fetchExchange } from 'urql';
import { Provider as ChakraProvider } from '@/components/ui/provider';

// urqlクライアントの初期化
const client = new Client({
  url: 'http://localhost:3001/graphql', // HonoバックエンドのURL
  exchanges: [cacheExchange, fetchExchange],
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
