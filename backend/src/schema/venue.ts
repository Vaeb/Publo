export default `
    type Venue {
        id: ID!
        resultType: String!
        title: String!
        type: String!
        issn: String
        publications: [Publication]!
    }
`;
