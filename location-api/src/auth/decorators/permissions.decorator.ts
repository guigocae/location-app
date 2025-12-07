import { SetMetadata } from "@nestjs/common";

export const PERMISSION_KEY = 'permissions';
export const Permissions = (...perms: string[]) => SetMetadata(PERMISSION_KEY, perms);