export default `
    type Publication {
        id: ID!
        title: String!
        doi: String!
        type: String!
        year: Int!
        volume: String
        link: String
        authors: [Author!]!
        venue: Venue
    }

    type Author {
        id: ID!
        firstName: String!
        lastName: String!
        orcid: String
        publications: [Publication]
    }

    type Venue {
        id: ID!
        title: String!
        type: String!
        publications: [Publication]
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
        runCode(code: String!): Obj
    }
`;
