export default `
    type Venue {
        id: ID!
        resultType: String
        title: String!
        type: String!
        issn: String
        publications(limit: Int): [Publication]!
    }

    type Query {
        getVenue(id: Int!): Venue
    }
`;
