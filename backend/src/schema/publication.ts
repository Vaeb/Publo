export default `
    type Publication {
        id: ID!
        resultType: String
        title: String!
        doi: String!
        type: String!
        year: Int!
        stampCreated: String
        volume: String
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
        getPublication(id: Int!): Publication
        getAllPublications(limit: Int): [Publication]!
        findPublications(text: String!, type: String, limit: Int): [Publication]!
    }

    type Mutation {
        addPublication(title: String!, type: String, volume: String, year: Int): AddPublicationResponse!
    }
`;
