/* eslint-disable implicit-arrow-linebreak */

import he from 'he';

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
        publications: async ({ id: recordId }: any, { limit }: any, { prisma }: Context): Promise<any> => {
            const venuePubs = await prisma.venue.findUnique({
                where: { id: recordId },
                select: {
                    publications: {
                        where: { source: 'merged' },
                        take: limit,
                    },
                },
            });

            if (venuePubs) {
                venuePubs.publications.forEach((publ) => {
                    publ.title = he.decode(publ.title);
                });
            }

            return venuePubs?.publications;
        },
    },
};
