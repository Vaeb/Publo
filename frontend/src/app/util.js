export const isScrollbar = () => window.innerWidth - document.documentElement.clientWidth > 0;

export const scrollMargin = () => {
    if (!isScrollbar()) {
        return { mr: 'var(--scroll-width)' };
    }

    return {};
};
