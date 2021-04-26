import { Author, GenericResult, Publication, ResultType, Venue } from '../types';

export const toGeneric = (results: any[], resultTypeAll: ResultType = 'any'): GenericResult[] => {
    if (!results) return [];

    return results.map((result: Publication | Author | Venue) => {
        const resultType = result.resultType || resultTypeAll;

        const genResult = {
            id: result.id,
            resultType,
        } as GenericResult;

        if (resultType === 'publication') {
            result = result as Publication;
            genResult.text = result.title;
            genResult.subText1 = result.venue?.title;
            genResult.subText2 = result.authors.map((author: any) => author.fullName).join(' • ');
            genResult.rightText1 = String(result.year);
        }

        return genResult;
    });
};
