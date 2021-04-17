import React, { ReactElement } from 'react';
import NextDocument, { Html, Head, Main, NextScript } from 'next/document';

export default class Document extends NextDocument {
    // eslint-disable-next-line class-methods-use-this
    render(): ReactElement {
        return (
            <Html>
                <Head>
                    <link rel="shortcut icon" href="/search3.png" />
                    {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/> */}
                    {/* <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" /> */}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
