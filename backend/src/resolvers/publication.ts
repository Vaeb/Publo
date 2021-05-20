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

export default {
    Query: {
        getPublications: async (_parent: any, { id }: any, { prisma }: Context): Promise<any> => {
            console.log('Received request for getPublications:', id);

            const { publicationRoot } = (await prisma.publication.findUnique({
                where: { id },
                select: {
                    publicationRoot: {
                        select: {
                            publications: {
                                include: { authors: true, venue: true },
                            },
                        },
                    },
                },
            }) || {});

            if (!publicationRoot?.publications) return undefined;

            let { publications } = publicationRoot;
            let mergedPubl = publications[0];
            publications = publications.filter((publ) => {
                if (publ.source === 'merged') {
                    mergedPubl = publ;
                    return false;
                }
                return true;
            });
            publications.unshift(mergedPubl);

            return publications;
        },
        getPublication: async (_parent: any, { id }: any, { prisma }: Context): Promise<any> => {
            console.log('Received request for getPublication:', id);
            return prisma.publication.findUnique({
                where: { id },
                include: { authors: true, venue: true },
            });
        },
        getMergedPublication: async (_parent: any, { rootId }: any, { prisma }: Context): Promise<any> => {
            console.log('Received request for getMergedPublication:', rootId);
            return prisma.publication.findFirst({
                where: { publicationRootId: rootId, source: 'merged' },
                include: { authors: true, venue: true },
            });
        },
        getAllPublications: async (_parent: any, { limit }: any, { prisma }: Context): Promise<any> => {
            const results = await prisma.publicationRoot.findMany({
                select: {
                    publications: {
                        where: { source: 'merged' },
                    },
                },
                orderBy: { title: 'asc' },
                take: limit,
            });

            // console.dir(results, { depth: Infinity });

            return results.map(result => result.publications[0]);
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
    },
    Publication: {
        venue: async ({ id: recordId }: any, args: any, { prisma }: Context): Promise<any> =>
            (await prisma.publication.findUnique({
                where: { id: recordId },
                select: {
                    venue: true,
                },
            }))?.venue,
        authors: async ({ id: recordId }: any, args: any, { prisma }: Context): Promise<any> =>
            (await prisma.publication.findUnique({
                where: { id: recordId },
                select: {
                    authors: {
                        orderBy: {
                            fullName: 'asc',
                        },
                    },
                },
            }))?.authors,
    },
};
