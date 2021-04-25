import { mergeTypeDefs } from '@graphql-tools/merge';

import publication from './publication';
import author from './author';
import venue from './venue';
import generic from './generic';

// const objScalar = `
//     scalar Obj
// `;

export default mergeTypeDefs([publication, author, venue, generic]);
