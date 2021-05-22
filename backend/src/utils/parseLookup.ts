export const parseLookup = (text?: string, retainCase?: boolean): typeof text => {
    if (text == null) return text;
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/ig, '').replace(/^\W+|\W+$|[^\w\s]+/g, ' ').replace(/\s+/g, ' ')
    if (!retainCase) text = text.toLowerCase();
    return text.trim();
};
