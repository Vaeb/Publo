import { Author, GenericResult, Publication, ResultType, Venue } from '../types';

export const toGeneric = (results: any[] | undefined, resultTypeAll: ResultType = 'any', boldAuthors: any = {}): GenericResult[] => {
    if (!results) return [];

    return results.map((result: any) => {
        const resultType = result.resultType || resultTypeAll;

        const genResult = {
            id: resultType === 'publication' ? result.publicationRootId : result.id,
            resultType,
        } as GenericResult;

        if (resultType === 'publication') {
            result = result as Publication;
            genResult.text = result.title;
            genResult.subText1 = result.venue?.title;
            genResult.subText2 = result.authors.map((author: any) => (boldAuthors[author.id] ? `**${author.fullName}**` : `${author.fullName}`)).join(' • ');
            genResult.rightText1 = String(result.year);
        }

        return genResult;
    });
};
