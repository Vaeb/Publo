import react from 'React';
import Head from 'next/head';

import Header from '../header/Header';

const Layout = ({ children }: any) => {
    return (
        <div className="layout">
            <Head>
                <title>Publo</title>
            </Head>
            <Header />
            {children}
        </div>
    );
};

export default Layout;
