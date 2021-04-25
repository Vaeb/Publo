/* eslint-disable implicit-arrow-linebreak */

// import { Author, Publication, Venue } from '.prisma/client';
import { Context } from '../types';
import formatErrors from '../utils/formatErrors';

declare global {
    interface RegExpConstructor {
        escape: (str: string) => string;
    }
}

RegExp.escape = str => (
    str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);

const resultTypes = ['publication', 'author', 'venue'] as const;

type ResultType = 'any' | typeof resultTypes[number];
// type Results = Publication[] | Author[] | Venue[];

interface GenericResult {
    id: number;
    resultType: ResultType;
    text: string;
}

const propToText: any = {
    publication: 'title',
    author: 'fullName',
    venue: 'title',
};

const addToGeneric = (genResults: GenericResult[], results: any, resultType: ResultType) => {
    results.forEach((result: any) => {
        const genResult = {} as GenericResult;
        genResult.id = result.id;
        genResult.resultType = resultType;
        genResult.text = result[propToText[resultType]];
        genResults.push(genResult);
    });

    return genResults;
};

export default {
    Query: {
        getPublication: (_parent: any, { id }: any, { prisma }: Context): Promise<any> => {
            console.log('Received request for getPublication:', id);
            return prisma.publication.findUnique({
                where: { id },
                include: { authors: true, venue: true },
            });
        },
        getAllPublications: (_parent: any, { limit }: any, { prisma }: Context): Promise<any> =>
            prisma.publication.findMany({
                orderBy: { title: 'asc' },
                take: limit,
            }),
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
                    take: limit,
                });

                addToGeneric(genResults, results, 'publication');
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
        findPublications: async (_parent: any, { text, limit }: any, { prisma }: Context): Promise<any> => {
            console.log('Received request for findPublications:', text);

            if (!text.length) return [];

            const results = await prisma.publication.findMany({
                where: {
                    OR: [
                        { title: { contains: text, mode: 'insensitive' } },
                    ],
                },
                take: limit,
            });

            results.sort((a, b) => {
                const aIndex = a.title.indexOf(text);
                const bIndex = b.title.indexOf(text);
                return aIndex - bIndex;
            });

            return results;
        },
    },
    Mutation: {
        addPublication: async (_parent: any, { title, type, year, volume }: any, { prisma }: Context): Promise<any> => {
            try {
                // const publication = await prisma.publication.create({ data: { title, type, year, volume } });

                // return {
                //     ok: true,
                //     publication,
                // };
            } catch (err) {
                console.log('++++++++++++++++++++++++++++++++');
                console.log('> ADD_PUBLICATION ERROR:', err);
                console.log('--------------------------------');
                return {
                    ok: false,
                    errors: formatErrors(err, prisma),
                };
            }
        },
        runCode: async (_parent: any, { code }: any): Promise<any> => {
            try {
                code = `(async function() {\n${code}\n})()`;
                console.log('> Running:', code);

                const result = await eval(code);

                console.log('> Result:', result);
                return result;
            } catch (err) {
                console.log('++++++++++++++++++++++++++++++++');
                console.log('> RUNCODE ERROR:', err);
                console.log('--------------------------------');

                return String(err);
            }
        },
    },
};
