// import pick from 'lodash/pick';
import nodeUtils from 'util';

import { PrismaClient } from '../types';

export default (e: any, prisma: PrismaClient): any[] => {
    // if (e instanceof models.sequelize.ValidationError) {
    //     return e.errors.map((x: any) => pick(x, ['path', 'message']));
    // }

    // prisma.publication.create({ data: {  } });

    if (e instanceof Error) {
        return [{ path: 'general', message: `${e.name}: ${e.message}` }];
    }

    return [{ path: 'general', message: `Unknown error: ${nodeUtils.format(e)}` }];
};
