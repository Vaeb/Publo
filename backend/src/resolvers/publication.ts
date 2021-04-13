/* eslint-disable implicit-arrow-linebreak */

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
        getPublication: (_parent: any, { id }: any, { prisma }: Context): Promise<any> =>
            prisma.publication.findUnique({
                where: { id }
            }),
        getAllPublications: (_parent: any, { limit }: any, { prisma }: Context): Promise<any> =>
            prisma.publication.findMany({
                orderBy: { title: 'asc' },
                take: limit,
            }),
        findPublications: (_parent: any, { text, limit }: any, { prisma }: Context): any => {
            console.log('Received request for findPublications:', text);

            if (!text.length) return [];

            return prisma.publication.findMany({
                where: {
                    OR: [
                        { title: { contains: text, mode: 'insensitive' } },
                    ],
                },
                take: limit,
            });
        },
    },
    Mutation: {
        addPublication: async (_parent: any, { title, type, year, volume }: any, { prisma }: Context): Promise<any> => {
            try {
                const publication = await prisma.publication.create({ data: { title, type, year, volume } })

                return {
                    ok: true,
                    publication,
                };
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
