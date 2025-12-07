import { Injectable, CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "src/auth/decorators/permissions.decorator";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}
  private readonly logger = new Logger();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get(PERMISSION_KEY, context.getHandler());
    if (!permissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = await this.prisma.user.findUnique({
      where: { clerkId: request.user.clerkId },
      include: {
        role: {
          include: { 
            rolePermissions: { include: { permission: true } } 
          },
        },
      },
    });

    if (!user || !user.enabled) return false;

    const userPerms = new Set(
      user.role.rolePermissions.map(rp => rp.permission.name)
    );

    for (const p of permissions) {
      if(!userPerms.has(p)) return false;
    }

    return true;
  }
}