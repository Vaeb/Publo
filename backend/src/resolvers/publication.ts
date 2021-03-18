import { EntityManager } from '@mikro-orm/core';

import formatErrors from '../utils/formatErrors';

interface Context {
    em: EntityManager;
}

export default {
    Query: {
        getPublication: (_parent: any, { id }: any, { em }: Context): Promise<any> => em.Publication.findOne({ where: { id } }),
        getAllPublications: (_parent: any, { limit }: any, { em }: Context): Promise<any> => em.Publication.findAll({ order: [['title', 'ASC']], limit, raw: true }),
        findPublications: (_parent: any, { text, limit }: any, { em }: Context): Promise<any> => {
            console.log('Received request for findPublications:', text);

            return (text.length ? em.Publication.findAll({
                where: {
                    [em.op.or]: {
                        title: { [em.Sequelize.Op.iLike]: text },
                    },
                },
                limit,
                raw: true,
            }) : []) as any;
        },
    },
    Mutation: {
        addPublication: async (_parent: any, { title, type, volume, year }: any, { em }: Context): Promise<any> => {
            try {
                const publication = await em.Publication.create({ title, type, volume, year });
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
        runTest: async (_parent: any, { model, method, data }: any, { em }: Context): Promise<any> => {
            try {
                console.log('> Running:', `em.${model}.${method}(${data})`);

                let result;
                if (Array.isArray(data)) {
                    result = await em[model][method](...data);
                } else {
                    result = await em[model][method](data);
                }

                console.log('> Result:', result);
                return result;
            } catch (err) {
                console.log('++++++++++++++++++++++++++++++++');
                console.log('> RUNTEST ERROR:', err);
                console.log('--------------------------------');

                return null;
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
