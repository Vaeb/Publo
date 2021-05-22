export default `
    type Result {
        id: ID!
        resultType: String!
        text: String!
        subText1: String
        subText2: String
        rightText1: String
    }

    type Error {
        path: String!
        message: String
    }

    type Query {
        findResults(text: String!, resultType: String, includeDetails: Boolean, fetchLimit: Int, lookupLimit: Int = 1100): [Result]!
    }

    type Mutation {
        runCode(code: String!): String
    }
`;
