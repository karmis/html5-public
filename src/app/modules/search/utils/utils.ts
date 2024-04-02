export abstract class BaseSearchUtil {
    protected initializeData(context, filed) {
        if(!context.config.options[filed]) {
            context.config.options[filed] = context[filed];
        } else {
            context[filed] = context.config.options[filed];
        }
    }

    protected passConfigToProvider(context) {
        context.provider.config = context.config;
    }
}
