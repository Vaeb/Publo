/* eslint-disable implicit-arrow-linebreak */

import { Context, GenericResult, ResultType } from '../types';
// import formatErrors from '../utils/formatErrors';

const normalizeResultText = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/ig, '');

const calcResultStrength = (searchText: string, result: GenericResult): number => { // Includes term, Offset from start, % filled, % matching caps
    // *Must* limit all factor increments to 0.999 * mult (w/ x1000 diff per)
    // 0 is acceptable min: 0.999 / 0.??? has a max-scale of just below x1000
    let strength = 0;

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
        const positionOff = totalPosition === 0 ? 0.999 : (totalPosition - matchPos) / totalPosition;
        // const positionOff = 1 - (totalPosition * (matchPos === 0 ? 0.001 : matchPos / totalPosition));
        strength += Math.min(positionOff, 0.999) * 1e6; // Offset from the start

        const filledPerc = searchTextLen / resultTextLen;
        strength += Math.min(filledPerc, 0.999) * 1e3; // Percentage of result text that search term fills

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
        genResult.anyId = `${resultType}-${result.id}`;
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

            const fetchAny = resultType === 'any';
            const numFetch = 450;
            const takeNum = Math.max(limit, (fetchAny ? Math.floor(numFetch / 3) : numFetch));

            if (fetchAny || resultType === 'publication') {
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
                    take: takeNum,
                });

                addToGeneric<typeof results[0]>(genResults, results, 'publication');
            }

            if (fetchAny || resultType === 'author') {
                const results = await prisma.author.findMany({
                    where: {
                        fullName: { contains: text, mode: 'insensitive' },
                    },
                    select: {
                        id: true,
                        fullName: true,
                    },
                    take: takeNum,
                });

                addToGeneric(genResults, results, 'author');
            }

            if (fetchAny || resultType === 'venue') {
                const results = await prisma.venue.findMany({
                    where: {
                        title: { contains: text, mode: 'insensitive' },
                    },
                    select: {
                        id: true,
                        title: true,
                    },
                    take: takeNum,
                });

                addToGeneric(genResults, results, 'venue');
            }

            console.log('Sorting results...');

            const resultStrength: { [key: string]: number } = {};
            genResults = genResults
                .sort((a: GenericResult, b: GenericResult) => {
                    let aStrength = resultStrength[a.anyId];
                    let bStrength = resultStrength[b.anyId];
                    if (!aStrength) {
                        aStrength = calcResultStrength(text, a);
                        resultStrength[a.anyId] = aStrength;
                    }
                    if (!bStrength) {
                        bStrength = calcResultStrength(text, b);
                        resultStrength[b.anyId] = bStrength;
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
