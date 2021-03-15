import formatErrors from '../utils/formatErrors';

export default {
    Query: {
        getPublication: (parent, { id }, { models }) => models.Publication.findOne({ where: { id } }),
        getAllPublications: (parent, { limit }, { models }) => models.Publication.findAll({ order: [['title', 'ASC']], limit, raw: true }),
        findPublications: (parent, { text, limit }, { models }) => {
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
        addPublication: async (parent, { title, type, volume, year }, { models }) => {
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
        runTest: async (parent, { model, method, data }, { models }) => {
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
        runCode: async (parent, { code }, { models }) => {
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
