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
        findResults(text: String!, resultType: String, limit: Int): [Result]!
    }

    type Mutation {
        runCode(code: String!): String
    }
`;
