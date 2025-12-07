import { Injectable } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';

@Injectable()
export class AppService {
  async getUsers() {
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
    return clerkClient.users.getUserList();
  }
}