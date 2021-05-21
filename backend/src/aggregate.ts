/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-loop-func */

import axios from 'axios';

import { Author, Publication } from '.prisma/client';
import { prisma } from './server';

// const resetDatabase = true;

const dblpUrl = 'https://dblp.org/search/publ/api';
const crossRefWorksUrl = 'https://api.crossref.org/works';

/*
    dblp
    total: >5,400,000

    and:         3,653,860
    conf:        2,788,693
    conference:  2,771,551
    a:           2,648,355
    journal:     2,108,201
    of:          1,940,033
    the:         1,254,772
    on:            781,725
    0:             737,582
    with:          615,970
    2020:          361,483
    publication:   353,232
    from:          177,665
*/

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

console.log('Aggregating publications...');

// interface Record {
//     title: string
//     type: string
//     year: number
//     volume?: string
//     venue?: string
//     pdfUrl?: string
// }

const cleanStringField = (str?: string) => (str != null ? str.replace(/^\W+|\W+$/g, '') : undefined);

const parseVenueTypeFromField = (fieldVal: string | null, source: string) => {
    let venueType = 'Unknown';
    if (!fieldVal) return venueType;

    fieldVal = fieldVal.toLowerCase();

    if (source === 'crossref') {
        if (fieldVal.startsWith('journal')) {
            venueType = 'Journal';
        } else if (fieldVal.startsWith('proceedings')) {
            venueType = 'Conference';
        }
    } else if (source === 'dblp') {
        if (fieldVal.startsWith('journal')) {
            venueType = 'Journal';
        } else if (fieldVal.startsWith('conf')) {
            venueType = 'Conference';
        }
    }

    return venueType;
};

const parsePublicationType = (value: string | null) => {
    let newValue = 'Unknown';
    if (!value) return newValue;

    value = value.toLowerCase();

    if (/journal\W*article/.test(value)) {
        newValue = 'Journal Article';
    } else if (/\b(?:proceedings|conference)\b/.test(value)) {
        newValue = 'Proceedings Article';
    }

    return newValue;
};

const simplifyForComparison = (str: string) => str.replace(/^\W+|\W+$|[^\w\s]+/g, '').replace(/\s+/g, ' ').toLowerCase();

// normalize decomposes accents into separate character, then the regex removes the character for smart comparison
const parseAuthorName = (name?: string) => (name != null ? name.normalize('NFD').replace(/^[^a-z]+|[^a-z]+$|[^a-z\- .,']+/ig, '') : undefined);

const parsePureName = (name?: string) => (name != null ? name.normalize('NFD').replace(/^\W+|\W+$|[\u0300-\u036f]/ig, '') : undefined);

const getSimpleName = (fullName: string) => { // esquire|esq|jr|sr
    fullName = fullName.toLowerCase();
    const nameParts = fullName.replace(/[^ a-zA-Z.,-]+/g, '').split(/[ .,-]+/); // John Park-Wave; C.W.Park
    if (/\b(?:mr|mrs|miss|ms|dr|doctor|sir|lady|professor|prof)\b/i.test(nameParts[0])) {
        nameParts.splice(0, 1);
    }
    if (nameParts.length === 0) return fullName;
    if (nameParts.length === 1) return nameParts[0];
    return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
};

const mergeAuthorData = (authorSources: Author[][]) => {
    if (authorSources.length === 1) return;

    const authorKeys = [...new Set([...authorSources.map(authorsSource => Object.keys(authorsSource[0] || [])).flat(1)])] as (keyof Author)[];

    for (const authorSource1 of authorSources[0]) {
        const authorMatcher = getSimpleName(authorSource1.fullName);
        for (let i = 1; i < authorSources.length; i++) {
            const authorSourceNextObj = Object.assign({}, ...authorSources[i].map((author: any) => ({ [getSimpleName(author.fullName)]: author })));
            const authorSourceNext = authorSourceNextObj[authorMatcher];
            if (authorSourceNext) {
                for (const key of authorKeys) {
                    if (authorSourceNext[key] === undefined) {
                        authorSourceNext[key] = authorSource1[key];
                    } else if (authorSource1[key] === undefined) {
                        (authorSource1[key] as any) = authorSourceNext[key];
                    }
                }
            }
        }
    }
};

const getMergedPublData = (publicationSources: Publication[]) => {
    if (publicationSources.length === 1) return { ...publicationSources[0], source: 'merged' };

    const mergedData: any = {};
    const publKeys = [...new Set([...publicationSources.map(publication => Object.keys(publication)).flat(1)])] as (keyof Publication)[];

    for (const key of publKeys) {
        let bestValue;
        for (const publication of publicationSources) {
            const publValue = publication[key];
            if (publValue != null) {
                const valueType = typeof publValue;
                if (bestValue === undefined) {
                    bestValue = publValue;
                } else if (valueType === 'string') { // Heuristically, longer text is more likely to imply detail
                    bestValue = (publValue as string).length > (bestValue as string).length ? publValue : bestValue;
                }

                // Assume publicationSources are ordered by most reliable source first, hence if value is not a string then use the first real value
                if (valueType !== 'string') break;
            }
        }
        if (bestValue !== undefined) {
            mergedData[key] = bestValue;
        }
    }

    mergedData.source = 'merged';
    return mergedData;
};

const levenshteinDistance = (str1: string, str2: string) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: { [key: number]: { [key: number]: number } } = []; // len1+1, len2+1

    if (len1 == 0) {
        return len2;
    } if (len2 == 0) {
        return len1;
    } if (str1 == str2) {
        return 0;
    }

    for (let i = 0; i <= len1; i++) {
        matrix[i] = {};
        matrix[i][0] = i;
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            let cost = 1;

            if (str1[i - 1] == str2[j - 1]) {
                cost = 0;
            }

            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }

    return matrix[len1][len2];
};

const filterAsync = async (arr: any[], callback: (arg1: any) => any) => {
    // eslint-disable-next-line symbol-description
    const fail = Symbol();
    return (await Promise.all(
        arr.map(async item => ((await callback(item)) ? item : fail))
    )).filter(i => i !== fail);
};

const fetchDblp = async () => {
    let enabled = true;

    // let startAt;
    let startAt: any = [1997, 480];

    // const dblpSize = 1000;
    const dblpSize = 20;
    // const dblpSize = 2;
    const minYear = 1936; // 1936
    const maxYear = new Date().getFullYear();
    // const dblpYear = new Array(maxYear - minYear + 1).fill(minYear).map((v, i) => v + i).join('|');
    const queryOptions = new Array(maxYear - minYear + 1).fill(minYear).map((v, i) => [v + i, -dblpSize]);
    // const queryOptions = new Array(maxYear - 1998 + 1).fill(1998).map((v, i) => [v + i, -dblpSize + 20]);
    let numOptions = queryOptions.length;
    let queryIndex = -1;
    let batchNum = 0;
    const defaultSleep = 1500;
    const shortSleep = 500;
    let nextSleep = defaultSleep;

    while (enabled && numOptions) {
        const batchNumNow = ++batchNum;

        queryIndex = (queryIndex + 1) % numOptions;
        const queryIndexNow = queryIndex;
        queryOptions[queryIndexNow][1] += dblpSize;
        const [dblpYear, dblpOffset] = queryOptions[queryIndexNow];
        console.log('------------------------------------------------------------------------------------------------------------------');
        console.log(queryIndexNow, '/', numOptions, dblpYear, dblpOffset);

        if (startAt) {
            if (dblpYear < startAt[0] || dblpOffset < startAt[1]) {
                continue;
            } else {
                startAt = null;
            }
        }

        await sleep(nextSleep);
        nextSleep = shortSleep;

        try {
            console.log('Fetching DBLP...');
            const dblpUrlNow = `${dblpUrl}?q=${dblpYear}&format=json&h=${dblpSize}&f=${dblpOffset}`;
            const { data, ...response } = await axios.get(dblpUrlNow);
            console.log('fetchDblp response', dblpSize, dblpOffset, 'status', response.status, 'statusText', response.statusText, `(${dblpUrlNow})`);

            let results = data?.result?.hits?.hit;

            results = (results || [])
                // .filter(({ info: dblpData }: any) => dblpData.doi != undefined)
                .map(({ info: dblpData }: any) => {
                    dblpData.title = cleanStringField(dblpData.title);
                    if (dblpData.doi) dblpData.doi = dblpData.doi.toUpperCase();
                    return dblpData;
                })
                .filter((dblpData: any) => dblpData.title);

            results = await filterAsync(results, async (dblpData: any) => {
                const existingRow = await prisma.publication.findFirst({
                    where: {
                        OR: [
                            { title: dblpData.title },
                            ...(dblpData.doi ? [{ doi: dblpData.doi }] : []),
                        ],
                        // source: 'dblp',
                    },
                });
                if (existingRow != null) {
                    console.log('Data already exists, filtering out...');
                    return false;
                }
                return true;
            });

            if (results.length === 0) {
                console.log('No results for query!');
                queryOptions.splice(queryIndex, 1);
                numOptions--;
                queryIndex--;
                continue;
            } else {
                console.log('Fetching crossref data...');
            }

            // const lastResultInDb = await prisma.publication.findFirst({
            //     where: {
            //         OR: [
            //             { title: results[results.length - 1].title },
            //             ...(results[results.length - 1].doi ? [{ doi: results[results.length - 1].doi }] : []),
            //         ],
            //         // source: 'dblp',
            //     },
            // });

            // if (lastResultInDb != null) {
            //     console.log('Data already exists, skipping...');
            //     continue;
            // }

            const crDataAll: any = (await Promise.all(results.map(async (dblpData: any) => { // Waits for all promises (running simultaneously) to finish executing
                let crData: any;

                try {
                    // console.log('Fetching CrossRef...');
                    if (dblpData.doi) {
                        const crResult: any = await axios.get(`${crossRefWorksUrl}/${dblpData.doi}`); // Waits for network request to return data
                        const { data: { message: crResultItem } } = crResult;
                        if (crResultItem?.title?.[0]) {
                            crData = crResultItem;
                        }
                    } else {
                        const crResult = await axios.get(`${crossRefWorksUrl}?query=${encodeURIComponent(parsePureName(dblpData.title) as string)}`);
                        const { data: { message: { items: [crResultItem] } } } = crResult;
                        // console.log('crResultItem', crResultItem);
                        if (crResultItem?.title?.[0] && simplifyForComparison(dblpData.title) === simplifyForComparison(crResultItem.title[0])) {
                            crData = crResultItem;
                        }
                    }
                } catch (err) {
                    console.log(`${err.response?.status} CrossRef request yielded no data:`, err);
                    // nextSleep = 1000 * 60;
                    nextSleep = defaultSleep * 1.5;
                    if (!err.response) {
                        console.log('Something went wrong (no CrossRef HTTP response)...');
                    }
                }

                return { dblpData, crData };
            })));

            let numCreated = 0;
            let numUpdated = 0;

            for (const { dblpData, crData } of crDataAll) {
                // if (enabled === false) return undefined;
                console.log(new Date(), '|', batchNumNow, '|', dblpData.doi, '|', dblpData.title);

                const crAuthorList = (crData?.author || [])
                    .filter((author: any) => author.given != undefined && author.family != undefined)
                    .map((author: any) => {
                        const firstName = parseAuthorName(author.given);
                        const lastName = parseAuthorName(author.family);
                        return { firstName, lastName, fullName: `${firstName} ${lastName}`, orcid: author.ORCID };
                    });

                let dblpAuthorList = (dblpData.authors?.author || []);
                dblpAuthorList = (Array.isArray(dblpAuthorList) ? dblpAuthorList : [dblpAuthorList])
                    .map((author: any) => {
                        const fullName = parseAuthorName(author.text);
                        if (!fullName) return undefined;
                        const nameParts = fullName.split(' ');
                        return { firstName: nameParts[0], lastName: nameParts.slice(1).join(' '), fullName, sourceId: author['@pid'] };
                    })
                    .filter((author: any) => author.firstName && author.lastName && author.fullName);

                mergeAuthorData([dblpAuthorList, ...(crData ? [crAuthorList] : [])]);

                crAuthorList.forEach((author: any) => { // Add sourceIds to the CR authors that didn't have a matching DBLP author
                    if (author.sourceId === undefined) {
                        author.sourceId = `CR/${author.fullName}`;
                    }
                });

                const crVenueList = (crData?.['container-title'] || [])
                    .map((venue: string) => parsePureName(venue));

                const dblpVenueList = (Array.isArray(dblpData.venue) ? dblpData.venue : [dblpData.venue])
                    .filter((venue: any) => venue != null)
                    .map((venue: string) => parsePureName(venue));

                const crDataUse: any = crData ? {
                    source: 'crossref',
                    title: cleanStringField(crData.title[0]),
                    doi: crData.DOI?.toUpperCase(),
                    type: parsePublicationType(crData.type),
                    year: crData.created?.['date-parts']?.[0]?.[0],
                    stampCreated: crData.created?.timestamp ? new Date(crData.created.timestamp) : null,
                    volume: crData.volume,
                    pdfUrl: crData.link?.[0]?.URL,
                    pageUrl: crData.URL,
                    authors: {
                        connectOrCreate: crAuthorList
                            .map((author: any) => (
                                {
                                    create: author,
                                    where: { sourceId: author.sourceId },
                                }
                            )),
                    },
                    venue: crVenueList.length ? {
                        connectOrCreate: {
                            create: { title: crVenueList[0], type: parseVenueTypeFromField(crData.type, 'crossref'), issn: crData.ISSN?.[0] },
                            where: { title: crVenueList[0] },
                        },
                    } : undefined,
                } : undefined;

                const dblpDataUse: any = {
                    source: 'dblp',
                    title: dblpData.title,
                    doi: dblpData.doi,
                    type: parsePublicationType(dblpData.type),
                    year: dblpData.year ? Number(dblpData.year) : null,
                    volume: dblpData.volume,
                    number: dblpData.number,
                    pages: dblpData.pages,
                    pageUrl: dblpData.ee,
                    authors: {
                        connectOrCreate: dblpAuthorList
                            .map((author: any) => (
                                {
                                    create: author,
                                    where: { sourceId: author.sourceId },
                                }
                            )),
                    },
                    venue: dblpVenueList.length ? {
                        connectOrCreate: {
                            create: { title: dblpVenueList[0], type: parseVenueTypeFromField(dblpData.key, 'dblp') },
                            where: { title: dblpVenueList[0] },
                        },
                    } : undefined,
                };

                if (!crDataUse) console.log('Not creating CrossRef publ; no data');

                let meetsRequired = true;
                const requiredFields = ['title', 'type', 'year'];

                for (const field of requiredFields) {
                    if (!dblpDataUse[field] || (crDataUse && !crDataUse[field])) {
                        console.log(`Missing ${field} (${!dblpDataUse[field] ? 'DBLP' : 'CrossRef'}), skipping...`);
                        meetsRequired = false;
                        break;
                    }
                }

                if (!meetsRequired) continue;

                const mergedDataUse = getMergedPublData([dblpDataUse, ...(crDataUse ? [crDataUse] : [])]);

                // const publicationRootConnect = {
                //     connect: {
                //         id: publRootId,
                //     },
                // };

                // console.dir({
                //     nowStamp: new Date(),
                //     batch: batchNumNow,
                //     idx,
                //     doi: publDoiCr,
                //     publicationTitle: crData.title.length > 1 ? crData.title : publTitleCr,
                //     connectOrCreateAuthor: authorConnectsCr,
                //     connectOrCreateVenue: venueConnectCr,
                // }, { depth: Infinity });

                // console.dir({ data: mergedDataUse }, { depth: Infinity });

                // const crPubl = await prisma.publication.create({
                //     data: crDataUse,
                // });
                // console.log(crPubl);

                // const dblpPubl = await prisma.publication.create({
                //     data: dblpDataUse,
                // });
                // console.log(dblpPubl);

                // return;

                const createPublications = {
                    create: [
                        mergedDataUse,
                        dblpDataUse,
                        ...(crDataUse ? [crDataUse] : []),
                    ],
                };

                const { id: publRootId } = (await prisma.publicationRoot.findFirst({
                    where: {
                        OR: [
                            { doi: dblpData.doi },
                            { title: dblpData.title },
                            ...(crDataUse ? [{ title: crDataUse.title }] : []),
                        ],
                    },
                }) || {});

                try {
                    if (publRootId) {
                        const { id: publId } = (await prisma.publication.findFirst({
                            where: {
                                publicationRootId: publRootId,
                                source: 'merged',
                            },
                        }) || {});
                        if (!publId) {
                            console.log(`(U) Updating publication_root ${publRootId} to include newly created publications`);
                            numUpdated++;
                            await prisma.publicationRoot.update({
                                where: { id: publRootId },
                                data: {
                                    publications: createPublications, // Make sure it isn't overriding the existing ones
                                },
                            });
                        } else {
                            console.log(`(X) Publication (${publId}) already exists under publication_root ${publRootId}, skipping...`);
                        }
                    } else {
                        console.log('(C) Creating new publication_root and publications');
                        numCreated++;
                        await prisma.publicationRoot.create({
                            data: {
                                doi: dblpData.doi,
                                title: dblpData.title,
                                publications: createPublications,
                            },
                        });
                    }
                } catch (err) {
                    console.log('>>> Prisma call failed:', err);
                }

                // await prisma.publication.create({
                //     data: {
                //         publicationRoot: publicationRootConnect,
                //         source: 'crossref',
                //         title: publTitleCr,
                //         doi: publDoiCr,
                //         type: publTypeCr,
                //         year: publYearCr,
                //         stampCreated: publStampCreatedCr,
                //         volume: publVolumeCr,
                //         pdfUrl: publPdfUrlCr,
                //         pageUrl: publPageUrlCr,
                //         authors: {
                //             connectOrCreate: authorConnectsCr,
                //         },
                //         venue: venueConnectCr,
                //     },
                // });
                // await prisma.publication.create({
                //     data: {
                //         publicationRoot: publicationRootConnect,
                //         source: 'crossref',
                //         title: publTitleCr,
                //         doi: publDoiCr,
                //         type: publTypeCr,
                //         year: publYearCr,
                //         stampCreated: publStampCreatedCr,
                //         volume: publVolumeCr,
                //         pdfUrl: publPdfUrlCr,
                //         pageUrl: publPageUrlCr,
                //         authors: {
                //             connectOrCreate: authorConnectsCr,
                //         },
                //         venue: venueConnectCr,
                //     },
                // });
            }

            console.log(`Done, ran ${numCreated + numUpdated} queries (${numCreated} created; ${numUpdated} updated)`);
            // return;
        } catch (err) {
            // enabled = false;
            console.log('[Aggregation failed]:');
            console.error(err);
            // break;
        }

        if (nextSleep === shortSleep) nextSleep = defaultSleep;

        // return;
    }

    console.log('Finished fetching!', numOptions, 'remaining');

    return () => {
        enabled = false;
    };
};

fetchDblp();
