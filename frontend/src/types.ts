export type ResultType = 'any' | 'publication' | 'author' | 'venue';

export interface GenericResult {
    id: number;
    resultType: ResultType;
    text: string;
}
