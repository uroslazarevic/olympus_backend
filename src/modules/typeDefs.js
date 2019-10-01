import { rootSchema } from './rootSchema';
import { userSchema } from './user/schema';
import { chatSchema } from './chat/schema';
import { profileSchema } from './profile/schema';

export const typeDefs = [rootSchema, userSchema, chatSchema, profileSchema];
