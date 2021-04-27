/* eslint-disable implicit-arrow-linebreak */

import { Context } from '../types';

export default {
    Query: {
        getAuthor: (_parent: any, { id }: any, { prisma }: Context): Promise<any> => {
            console.log('Received request for getAuthor:', id);
            return prisma.author.findUnique({
                where: { id },
                include: { publications: true },
            });
        },
    },
    Author: {
        publications: async ({ id: recordId }: any, { limit, merged }: any, { prisma }: Context): Promise<any> =>
            (await prisma.author.findUnique({
                where: { id: recordId },
                select: {
                    publications: {
                        where: { source: merged ? 'merged' : undefined },
                        take: limit,
                    },
                },
            }))?.publications,
    },
};
