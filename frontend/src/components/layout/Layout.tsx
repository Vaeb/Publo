import react from 'React';

import Header from '../header/Header';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            {children}
        </div>
    );
};

export default Layout;
