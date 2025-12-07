import { Module } from "@nestjs/common";
import { PermissionsGuard } from "./permissions.guard";
import { AuthGuard } from "./auth.guard";
import { Reflector } from "@nestjs/core";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [Reflector, AuthGuard, PermissionsGuard],
  exports: [AuthGuard, PermissionsGuard],
})
export class GuardsModule {}