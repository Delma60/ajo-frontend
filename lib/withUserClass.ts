import { Auth } from "./auth";
import type { Guard } from "./guard";
import type { GuardConfig } from "./auth.types";
import { User, RawUser } from "./user";

export function withUserClass<TRaw extends RawUser = RawUser>(
    guardName: string,
    config: GuardConfig<User<TRaw>>
): Guard<User<TRaw>> {
    const wrappedConfig: GuardConfig<User<TRaw>> = {
        ...config,
        events: {
            ...config.events,
            onUserRefreshed(rawUser) {
                const user = rawUser instanceof User ? rawUser : new User<TRaw>(rawUser as TRaw);
                config.events?.onUserRefreshed?.(user);
            },
        },
    };
    return Auth.extend<User<TRaw>>(guardName, wrappedConfig);
}
