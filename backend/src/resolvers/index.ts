import { GraphQLScalarType } from 'graphql';
import merge from 'lodash/merge';

import publication from './publication';

const objScalar = new GraphQLScalarType({
    name: 'Obj',
    description: 'Object custom scalar type',
    serialize(value) {
        return JSON.stringify(value); // Convert outgoing Date to integer for JSON
    },
    parseValue(value) {
        return JSON.parse(value); // Convert incoming integer to Date
    },
    parseLiteral(ast) {
        try {
            if ('value' in ast) {
                const obj = JSON.parse(String(ast.value)); // Convert hard-coded AST string to integer and then to Date
                return obj;
            }
            console.log('Failed ParseLiteral (no .value):', ast);
            return null;
        } catch (err) {
            return null;
        }
    },
});

export default merge(publication, { Obj: objScalar });
