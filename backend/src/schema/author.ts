export default `
    type Author {
        id: ID!
        resultType: String
        firstName: String!
        lastName: String!
        fullName: String!
        orcid: String
        publications(limit: Int): [Publication]!
    }

    type Query {
        getAuthor(id: Int!): Author
    }
`;
