import Head from 'next/head';

export default function App({Component, pageProps}) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <Component {...pageProps} />
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        * {
          box-sizing: border-box;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        a:hover {
          text-decoration: none;
        }
      `}</style>
    </>
  );
}