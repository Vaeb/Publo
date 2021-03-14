import React, { ReactElement } from 'react';
import NextDocument, { Html, Head, Main, NextScript } from 'next/document';

export default class Document extends NextDocument {
    // eslint-disable-next-line class-methods-use-this
    render(): ReactElement {
        return (
            <Html>
                <Head>
                    <link rel="shortcut icon" href="/search3.png" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
