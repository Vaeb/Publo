export default `
    type Publication {
        id: ID!
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
        runTest(model: String!, method: String!, data: Obj): Obj
        runCode(code: String!): Obj
    }
`;
