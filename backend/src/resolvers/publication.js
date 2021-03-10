import formatErrors from '../formatErrors';

export default {
    Query: {
        getPublication: (parent, { id }, { models }) => models.Publication.findOne({ where: { id } }),
        getAllPublications: (parent, { limit }, { models }) => models.Publication.findAll({ order: [['title', 'ASC']], limit, raw: true }),
        findPublications: (parent, { text, limit }, { models }) => (text.length ? models.Publication.findAll({
            where: {
                [models.op.or]: {
                    title: { [models.op.substring]: text },
                },
            },
            limit,
            raw: true,
        }) : []),
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
                console.log(err);
                return {
                    ok: false,
                    errors: formatErrors(err, models),
                };
            }
        },
    },
};
