/* eslint-disable implicit-arrow-linebreak */

import { Context } from '../types';

export default {
    Query: {
        getVenue: (_parent: any, { id }: any, { prisma }: Context): Promise<any> => {
            console.log('Received request for getVenue:', id);
            return prisma.venue.findUnique({
                where: { id },
                include: { publications: true },
            });
        },
    },
    Venue: {
        publications: async ({ id: recordId }: any, { limit }: any, { prisma }: Context): Promise<any> =>
            (await prisma.venue.findUnique({
                where: { id: recordId },
                select: {
                    publications: {
                        take: limit,
                    },
                },
            }))?.publications,
    },
};