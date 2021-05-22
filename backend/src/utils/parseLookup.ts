export const parseLookup = (text?: string): typeof text => (text != null
    ? text.normalize('NFD').replace(/[\u0300-\u036f]/ig, '').replace(/^\W+|\W+$|[^\w\s]+/g, ' ').replace(/\s+/g, ' ')
        .toLowerCase()
        .trim()
    : text);
