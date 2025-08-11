import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '../lib/authContext';

export default function App({Component, pageProps}) {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}