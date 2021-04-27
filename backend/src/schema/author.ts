export default `
    type Author {
        id: ID!
        sourceId: String!
        resultType: String
        firstName: String!
        lastName: String!
        fullName: String!
        orcid: String
        publications(limit: Int, merged: Boolean = true): [Publication]!
    }

    type Query {
        getAuthor(id: Int!): Author
    }
`;
