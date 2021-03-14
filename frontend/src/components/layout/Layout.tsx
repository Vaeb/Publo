import React, { FC, ReactElement } from 'react';
import Head from 'next/head';

import Header from '../header/Header';

const Layout: FC = ({ children }): ReactElement => (
    <div className="layout">
        <Head>
            <title>Publo</title>
        </Head>
        <Header />
        {children}
    </div>
);

export default Layout;
