import { Injectable } from '@nestjs/common';
import { ClerkService } from './clerk/clerk.service';

@Injectable()
export class AppService {
  constructor(private clerk: ClerkService) {}

  async getUsers() {
    return this.clerk.client.users.getUserList();
  }
}
