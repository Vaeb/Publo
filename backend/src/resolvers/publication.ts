/* eslint-disable implicit-arrow-linebreak */

import { QueryOrder } from '@mikro-orm/core';

import { Context } from '../types';
import { Publication } from '../entities';
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
        getPublication: (_parent: any, { id }: any, { em }: Context): Promise<any> =>
            em.findOne(
                Publication,
                { id }
            ),
        getAllPublications: (_parent: any, { limit }: any, { em }: Context): Promise<any> =>
            em.find(
                Publication,
                {},
                {
                    orderBy: { title: QueryOrder.ASC },
                    limit,
                }
            ),
        findPublications: (_parent: any, { text, limit }: any, { em, conn }: Context): any => {
            console.log('Received request for findPublications:', text);

            if (!text.length) return [];

            return em.find(
                Publication,
                {
                    $or: [
                        { title: { $ilike: `%${text}%` } },
                    ],
                },
                {
                    limit,
                }
            );
        },
    },
    Mutation: {
        addPublication: async (_parent: any, { title, type, year, volume }: any, { em }: Context): Promise<any> => {
            try {
                const publication = new Publication(title, type, year, volume);

                await em.persistAndFlush(publication);

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
                    errors: formatErrors(err, em),
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
