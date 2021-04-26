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
};
