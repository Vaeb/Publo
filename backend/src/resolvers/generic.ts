/* eslint-disable implicit-arrow-linebreak */

import { Context, GenericResult, ResultType } from '../types';
// import formatErrors from '../utils/formatErrors';

const normalizeResultText = (str: string) => str.normalize('NFD').replace(/^\W+|\W+$|[\u0300-\u036f]/ig, '');

const calcResultStrength = (searchText: string, result: GenericResult): number[] => { // Includes term, Offset from start, % filled, % matching caps
    const strength = new Array(4).fill(0);

    searchText = normalizeResultText(searchText);
    const searchTextLower = searchText.toLowerCase();
    const resultText = normalizeResultText(result.text);
    const resultTextLower = resultText.toLowerCase();
    const matchPos = resultTextLower.indexOf(searchTextLower);

    if (matchPos >= 0) {
        strength[0] = 1; // Result text includes search term

        const totalPosition = resultText.length - searchText.length;
        const positionOff = 1 - (totalPosition * (matchPos === 0 ? 0.001 : matchPos / totalPosition));
        strength[1] = positionOff; // Offset from the start

        const filledPerc = Math.min(searchText.length / resultText.length);
        strength[2] = filledPerc; // Percentage of result text that search term fills

        const iterLen = Math.min(searchText.length, resultText.length);
        let numCaps = 0;
        for (let i = 0; i < iterLen; i++) {
            if (searchText[i] === resultText[matchPos + i]) numCaps++;
        }
        const capsPerc = Math.min(numCaps / iterLen, 0.999);
        strength[3] = capsPerc; // Percentage of possible caps that match
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
                    include: { authors: true, venue: true },
                    take: 100000,
                });

                addToGeneric<typeof results[0]>(genResults, results, 'publication');
            }

            if (resultType === 'any' || resultType === 'author') {
                const results = await prisma.author.findMany({
                    where: {
                        fullName: { contains: text, mode: 'insensitive' },
                    },
                    take: 100000,
                });

                addToGeneric(genResults, results, 'author');
            }

            if (resultType === 'any' || resultType === 'venue') {
                const results = await prisma.venue.findMany({
                    where: {
                        title: { contains: text, mode: 'insensitive' },
                    },
                    take: 100000,
                });

                addToGeneric(genResults, results, 'venue');
            }

            console.log('Sorting results...');

            const resultStrength: { [key: string]: number[] } = {};
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
                    let bStronger = 0;
                    for (let i = 0; i < aStrength.length; i++) {
                        if (bStrength[i] > aStrength[i]) {
                            bStronger = 1;
                            break;
                        } else if (bStrength[i] < aStrength[i]) {
                            bStronger = -1;
                            break;
                        }
                    }
                    return bStronger;
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
