import formatErrors from '../utils/formatErrors';

export default {
    Query: {
        getPublication: (_parent: any, { id }: any, { models }: any): Promise<any> => models.Publication.findOne({ where: { id } }),
        getAllPublications: (_parent: any, { limit }: any, { models }: any): Promise<any> => models.Publication.findAll({ order: [['title', 'ASC']], limit, raw: true }),
        findPublications: (_parent: any, { text, limit }: any, { models }: any): Promise<any> => {
            console.log('Received request for findPublications:', text);

            return (text.length ? models.Publication.findAll({
                where: {
                    [models.op.or]: {
                        title: { [models.op.substring]: text },
                    },
                },
                limit,
                raw: true,
            }) : []);
        },
    },
    Mutation: {
        addPublication: async (_parent: any, { title, type, volume, year }: any, { models }: any): Promise<any> => {
            try {
                const publication = await models.Publication.create({ title, type, volume, year });
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
                    errors: formatErrors(err, models),
                };
            }
        },
        runTest: async (_parent: any, { model, method, data }: any, { models }: any): Promise<any> => {
            try {
                console.log('> Running:', `models.${model}.${method}(${data})`);

                let result;
                if (Array.isArray(data)) {
                    result = await models[model][method](...data);
                } else {
                    result = await models[model][method](data);
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
