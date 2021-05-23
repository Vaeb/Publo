/* eslint-disable implicit-arrow-linebreak */

import { Context, GenericResult, ResultType } from '../types';
// import { formatErrors } from '../utils/formatErrors';
import { parseLookup } from '../utils/parseLookup';
import { escapeRegex } from '../utils/escapeRegex';

const normalizeText = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/ig, '');

const parseBigVal = (num: number, level: number) => BigInt(Math.floor(parseFloat(Math.min(num, 0.9999).toFixed(4)) * level));

// Factors: Includes simple term > Includes full term > Stand-alone term > % relative offset from start > % filled > % matching caps
const calcResultStrength = (searchLookup: string, searchTextRaw: string, result: GenericResult, cachedData: any): bigint => {
    // *Must* limit all factor increments to 0.9999 * mult (w/ x10000 diff per)
    // 0 is acceptable min: 0.9999 / 0.??? has a max-scale of just below x10000
    // Max JS num that can safely do accurate multiplication is 1e14
    let strength = BigInt(0);
    if (searchLookup === '') return strength;

    const searchLookupLower = cachedData.searchLookupLower || (cachedData.searchLookupLower = searchLookup.toLowerCase());
    const searchLookupSafe = cachedData.searchLookupSafe || (cachedData.searchLookupSafe = escapeRegex(searchLookupLower));
    const resultLookup = result.lookup;
    const resultTextRaw = normalizeText(result.text);
    const resultLookupLower = resultLookup.toLowerCase();
    const matchPos = resultLookupLower.indexOf(searchLookupLower);

    if (matchPos > -1) {
        strength += cachedData.BigInt24 || (cachedData.BigInt24 = BigInt(0.9999e12) * BigInt(1e12)); // Result text includes search term

        const searchLookupLen = searchLookup.length;
        const resultLookupLen = resultLookup.length;

        const matchPosRaw = resultTextRaw.toLowerCase().indexOf(searchTextRaw.toLowerCase());
        if (matchPosRaw > -1) {
            strength += cachedData.BigInt20 || (cachedData.BigInt20 = BigInt(0.9999e12) * BigInt(1e8)); // Result lookup includes search lookup
        }

        const fullTerm = new RegExp(`\\b${searchLookupSafe}\\b`).test(resultLookupLower) ? 1 : 0;
        strength += parseBigVal(fullTerm, 1e12) * BigInt(1e4); // Percentage offset from start

        // const totalPosition = resultLookupLen - searchLookupLen;
        // const positionOff = totalPosition === 0 ? 1 : (totalPosition - matchPos) / totalPosition;
        const positionOff = (1e4 - matchPos - 1) / 1e4; // Max title length is 1e4 characters
        strength += parseBigVal(positionOff, 1e12); // Percentage relative offset from the start

        const filledPerc = searchLookupLen / resultLookupLen;
        strength += parseBigVal(filledPerc, 1e8); // Percentage of result text that search term fills

        let numCaps = 0;
        for (let i = 0; i < searchLookupLen; i++) {
            if (searchLookup[i] === resultLookup[matchPos + i]) numCaps++;
        }
        const capsPerc = numCaps / searchLookupLen;
        strength += parseBigVal(capsPerc, 1e4); // Percentage of possible caps that match
    }

    return strength;
};

const sortResults = (genResults: GenericResult[], text: string) => {
    const resultStrength: { [key: string]: bigint } = {};
    const searchLookup = parseLookup(text, true) as string;
    const searchTextRaw = normalizeText(text);
    const cachedData = {};
    return genResults
        .sort((a: GenericResult, b: GenericResult) => {
            let aStrength = resultStrength[a.anyId];
            let bStrength = resultStrength[b.anyId];
            if (!aStrength) {
                aStrength = calcResultStrength(searchLookup, searchTextRaw, a, cachedData);
                resultStrength[a.anyId] = aStrength;
            }
            if (!bStrength) {
                bStrength = calcResultStrength(searchLookup, searchTextRaw, b, cachedData);
                resultStrength[b.anyId] = bStrength;
            }
            if (bStrength > aStrength) return 1;
            if (aStrength > bStrength) return -1;
            return 0;
        });
};

const propToText: any = {
    publication: 'title',
    author: 'fullName',
    venue: 'title',
};

interface GenericResultBuild extends Omit<GenericResult, 'subText2'> {
    subText2: string | string[];
}

const addToGeneric = <Type>(genResults: GenericResult[], results: Type[], resultType: ResultType, includeDetails?: boolean) => {
    let lastResult = { id: -1, subText2: [''] } as GenericResultBuild;

    results.forEach((result: any) => {
        if (result.id == lastResult.id) {
            if (includeDetails && resultType === 'publication' && result.fullName) {
                (lastResult.subText2 as string[]).push(result.fullName);
            }
        } else {
            const genResult = {} as GenericResultBuild;
            genResult.id = result.id;
            genResult.anyId = `${resultType}-${result.id}`;
            genResult.resultType = resultType;
            genResult.text = result[propToText[resultType]];
            genResult.lookup = result.lookup;
            if (includeDetails && resultType === 'publication') {
                lastResult.subText2 = (lastResult.subText2 as string[]).join(' • ');
                genResult.subText1 = result.venueTitle;
                genResult.subText2 = result.fullName ? [result.fullName] : [];
                genResult.rightText1 = String(result.year);
            }
            lastResult = genResult;
            genResults.push(genResult as GenericResult);
        }
    });

    if (includeDetails && resultType === 'publication') {
        lastResult.subText2 = (lastResult.subText2 as string[]).join(' • ');
    }

    return genResults;
};

interface findResultsParams { text: string, resultType: ResultType, includeDetails: boolean, fetchLimit: number, lookupLimit: number | null }

export default {
    Query: {
        findResults: async (_parent: any, { text, resultType, includeDetails, fetchLimit, lookupLimit }: findResultsParams, { prisma }: Context): Promise<any> => {
            console.log(`Received request for findResults (${resultType}):`, text);

            if (resultType === undefined) resultType = 'any';

            if (!text.length) return [];

            let genResults = [] as GenericResult[];

            const fetchAny = resultType === 'any';
            if (typeof lookupLimit === 'number' && lookupLimit > -1) {
                lookupLimit = Math.max(fetchLimit, lookupLimit);
                if (fetchAny) lookupLimit = Math.floor(lookupLimit / 3);
            } else {
                lookupLimit = null;
            }

            const textLookup = parseLookup(text) as string;
            const textIns = `%${textLookup}%`;
            console.log('Fetching data...');

            if (fetchAny || resultType === 'publication') {
                const results = includeDetails
                    ? await prisma.$queryRaw`
                        SELECT p.id, p.title, p.lookup, p.year, a."fullName", v.title as "venueTitle"
                        FROM publications p
                        LEFT JOIN venues v
                            ON p."venueId" = v.id
                        LEFT JOIN "_AuthorToPublication" ap
                            ON ap."B" = p.id
                        LEFT JOIN authors a
                            ON ap."A" = a.id
                        WHERE p.source = 'merged' AND p.lookup LIKE ${textIns}
                        LIMIT ${lookupLimit};
                    `
                    : await prisma.$queryRaw`
                        SELECT p.id, p.title, p.lookup, p.year
                        FROM publications p
                        WHERE p.source = 'merged' AND p.lookup LIKE ${textIns}
                        LIMIT ${lookupLimit};
                    `;

                console.log('Fetched publications, adding to generic');

                addToGeneric<typeof results[0]>(genResults, results, 'publication', includeDetails);
            }

            if (fetchAny || resultType === 'author') {
                const results = await prisma.$queryRaw`
                    SELECT a.id, a."fullName", a.lookup
                    FROM authors a
                    WHERE a.lookup LIKE ${textIns}
                    LIMIT ${lookupLimit};
                `;

                addToGeneric(genResults, results, 'author');
            }

            if (fetchAny || resultType === 'venue') {
                const results = await prisma.$queryRaw`
                    SELECT v.id, v.title, v.lookup
                    FROM venues v
                    WHERE v.lookup LIKE ${textIns}
                    LIMIT ${lookupLimit};
                `;

                addToGeneric(genResults, results, 'venue');
            }

            console.log('Sorting results...');

            genResults = sortResults(genResults, text).slice(0, fetchLimit);

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
