/*

    - GraphQL API schema for Publications only (see other schema files for authors, venues, etc.)

*/

export default `
    type Publication {
        id: ID!
        source: String
        publicationRootId: Int
        resultType: String
        title: String!
        doi: String
        type: String!
        year: Int!
        stampCreated: String
        volume: String
        number: String
        pages: String
        pdfUrl: String
        pageUrl: String
        authors: [Author!]!
        venue: Venue
    }

    type AddPublicationResponse {
        ok: Boolean!
        errors: [Error!]
        publication: Publication
    }

    type Query {
        getPublications(rootId: Int!): [Publication]
        getPublication(rootId: Int!): Publication
        getMergedPublication(id: Int!): Publication
        getAllPublications(limit: Int): [Publication]!
    }

    type Mutation {
        addPublication(title: String!, type: String, volume: String, year: Int): AddPublicationResponse!
    }
`;
