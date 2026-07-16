import { Module } from '@nestjs/common';
import { PcUsersService } from './pc-users.service';

@Module({
  providers: [PcUsersService],
  exports: [PcUsersService],
})
export class PcUsersModule {}
