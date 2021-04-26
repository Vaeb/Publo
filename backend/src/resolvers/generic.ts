/* eslint-disable implicit-arrow-linebreak */

import { Context, GenericResult, ResultType } from '../types';
// import formatErrors from '../utils/formatErrors';

const propToText: any = {
    publication: 'title',
    author: 'fullName',
    venue: 'title',
};

const addToGeneric = <Type>(genResults: GenericResult[], results: Type[], resultType: ResultType) => {
    results.forEach((result: any) => {
        const genResult = {} as GenericResult;
        genResult.id = result.id;
        genResult.resultType = resultType;
        genResult.text = result[propToText[resultType]];
        if (resultType === 'publication') {
            genResult.subText1 = result.venue?.title;
            genResult.subText2 = result.authors.map((author: any) => author.fullName).join(' • ');
            genResult.rightText1 = String(result.year);
        }
        genResults.push(genResult);
    });

    return genResults;
};

export default {
    Query: {
        findResults: async (_parent: any, { text, resultType, limit }: { text: string, resultType: ResultType, limit: number }, { prisma }: Context): Promise<any> => {
            console.log(`Received request for findResults (${resultType}):`, text);

            if (resultType === undefined) resultType = 'any';

            if (!text.length) return [];

            let genResults = [] as GenericResult[];

            if (resultType === 'any' || resultType === 'publication') {
                const results = await prisma.publication.findMany({
                    where: {
                        OR: [
                            { title: { contains: text, mode: 'insensitive' } },
                        ],
                    },
                    include: { authors: true, venue: true },
                    take: limit,
                });

                addToGeneric<typeof results[0]>(genResults, results, 'publication');
            }

            if (resultType === 'any' || resultType === 'author') {
                const results = await prisma.author.findMany({
                    where: {
                        fullName: { contains: text, mode: 'insensitive' },
                    },
                    take: limit,
                });

                addToGeneric(genResults, results, 'author');
            }

            if (resultType === 'any' || resultType === 'venue') {
                const results = await prisma.venue.findMany({
                    where: {
                        title: { contains: text, mode: 'insensitive' },
                    },
                    take: limit,
                });

                addToGeneric(genResults, results, 'venue');
            }

            genResults = genResults
                .sort((a: GenericResult, b: GenericResult) => {
                    const aIndex = a.text.indexOf(text);
                    const bIndex = b.text.indexOf(text);
                    return aIndex - bIndex;
                })
                .slice(0, limit);

            return genResults;
        },
    },
    Mutation: {
        runCode: async (_parent: any, { code }: any): Promise<any> => {
            try {
                code = `(async function() {\n${code}\n})()`;
                console.log('> Running:', code);

                const result = await eval(code);

                console.log('> Result:', result);

                return JSON.stringify(result);
            } catch (err) {
                console.log('++++++++++++++++++++++++++++++++');
                console.log('> RUNCODE ERROR:', err);
                console.log('--------------------------------');

                return String(err);
            }
        },
    },
};
