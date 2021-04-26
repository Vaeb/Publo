/* eslint-disable implicit-arrow-linebreak */

export const arrayToObj = (arr: any[], key?: any): { [key: string]: true } =>
    Object.assign({}, ...arr.map(val =>
        (key ? { [val[key]]: true } : { [val]: true })));
