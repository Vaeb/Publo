import formatErrors from '../formatErrors';

export default {
    Query: {
        publications: (parent, args, { models }) => models.Publication.findAll({ raw: true }),
        publication: (parent, { id }, { models }) => models.Publication.findOne({ where: { id } }),
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
