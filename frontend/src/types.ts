export type ResultType = 'any' | 'publication' | 'author' | 'venue';

export interface GenericResult {
    id: number;
    resultType: ResultType;
    text: string;
    subText1?: string;
    subText2?: string;
    rightText1?: string;
}
