import pick from 'lodash/pick';
import nodeUtils from 'util';

export default (e: any, models: any): any[] => {
    if (e instanceof models.sequelize.ValidationError) {
        return e.errors.map((x: any) => pick(x, ['path', 'message']));
    }

    if (e instanceof Error) {
        return [{ path: 'general', message: `${e.name}: ${e.message}` }];
    }

    return [{ path: 'general', message: `Unknown error: ${nodeUtils.format(e)}` }];
};
