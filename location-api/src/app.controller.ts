import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { Permissions } from './auth/decorators/permissions.decorator';

@Controller()
@UseGuards(AuthGuard, PermissionsGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getAllUsers() {
    return this.appService.getUsers();
  }

  @Get('user')
  @Permissions('manage_user')
  async getUsers() {
    return this.appService.getUsers();
  }
}