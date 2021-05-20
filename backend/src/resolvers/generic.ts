/* eslint-disable implicit-arrow-linebreak */

import { Context, GenericResult, ResultType } from '../types';
// import formatErrors from '../utils/formatErrors';

const normalizeResultText = (str: string) => str.normalize('NFD').replace(/^\W+|\W+$|[\u0300-\u036f]/ig, '');

const calcResultStrength = (searchText: string, result: GenericResult): number => { // Includes term, Offset from start, % filled, % matching caps
    let strength = 0; // *Must* limit all factor increments to 0.999 * mult (w/ x1000 diff per)

    searchText = normalizeResultText(searchText);
    const searchTextLower = searchText.toLowerCase();
    const resultText = normalizeResultText(result.text);
    const resultTextLower = resultText.toLowerCase();
    const matchPos = resultTextLower.indexOf(searchTextLower);

    if (searchText === '') {
        strength = (9e5 - resultText.length) / 9e5; // Assume result title/name will not be over 9e5 characters
    } else if (matchPos >= 0) {
        strength += 0.999 * 1e9; // Result text includes search term

        const searchTextLen = searchText.length;
        const resultTextLen = resultText.length;

        const totalPosition = resultTextLen - searchTextLen;
        const positionOff = (totalPosition - matchPos) / totalPosition;
        // const positionOff = 1 - (totalPosition * (matchPos === 0 ? 0.001 : matchPos / totalPosition));
        strength += Math.min(positionOff * 1e6, 0.999); // Offset from the start

        const filledPerc = searchTextLen / resultTextLen;
        strength += Math.min(filledPerc * 1e3, 0.999); // Percentage of result text that search term fills

        let numCaps = 0;
        for (let i = 0; i < searchTextLen; i++) {
            if (searchText[i] === resultText[matchPos + i]) numCaps++;
        }
        const capsPerc = numCaps / searchTextLen;
        strength += Math.min(capsPerc, 0.999); // Percentage of possible caps that match
    }

    return strength;
};

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
                        source: 'merged',
                    },
                    select: {
                        id: true,
                        title: true,
                        year: true,
                        authors: { select: { fullName: true } },
                        venue: { select: { title: true } },
                    },
                    take: 30000,
                });

                addToGeneric<typeof results[0]>(genResults, results, 'publication');
            }

            if (resultType === 'any' || resultType === 'author') {
                const results = await prisma.author.findMany({
                    where: {
                        fullName: { contains: text, mode: 'insensitive' },
                    },
                    select: {
                        id: true,
                        fullName: true,
                    },
                    take: 30000,
                });

                addToGeneric(genResults, results, 'author');
            }

            if (resultType === 'any' || resultType === 'venue') {
                const results = await prisma.venue.findMany({
                    where: {
                        title: { contains: text, mode: 'insensitive' },
                    },
                    select: {
                        id: true,
                        title: true,
                    },
                    take: 30000,
                });

                addToGeneric(genResults, results, 'venue');
            }

            console.log('Sorting results...');

            const resultStrength: { [key: string]: number } = {};
            genResults = genResults
                .sort((a: GenericResult, b: GenericResult) => {
                    let aStrength = resultStrength[a.id];
                    let bStrength = resultStrength[b.id];
                    if (!aStrength) {
                        aStrength = calcResultStrength(text, a);
                        resultStrength[a.id] = aStrength;
                    }
                    if (!bStrength) {
                        bStrength = calcResultStrength(text, b);
                        resultStrength[b.id] = bStrength;
                    }
                    return bStrength - aStrength;
                })
                .slice(0, limit);

            console.log('Done, returning...');

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
