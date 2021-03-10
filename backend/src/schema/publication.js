export default `
    type Publication {
        id: Int!
        title: String!
        type: String
        volume: String
        year: Int
    }

    type Error {
        path: String!
        message: String
    }

    type AddPublicationResponse {
        ok: Boolean!
        errors: [Error!]
        publication: Publication
    }

    type Query {
        getPublication(id: Int!): Publication!
        getAllPublications(limit: Int): [Publication!]!
        findPublications(text: String!, type: String, limit: Int): [Publication]!
    }

    type Mutation {
        addPublication(title: String!, type: String, volume: String, year: Int): AddPublicationResponse!
    }
`;
