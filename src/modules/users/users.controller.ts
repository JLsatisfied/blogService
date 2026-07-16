import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryUserDto, DeleteUserDto } from './dto/query-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('getUserList')
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query.page, query.pageSize, query.name);
  }

  @Post('deleteUsers')
  remove(@Body() dto: DeleteUserDto) {
    return this.usersService.remove(dto.id);
  }

  @Get('getPcUserList')
  findAllPcUsers(@Query() query: PaginationDto) {
    return this.usersService.findAllPcUsers(query.page, query.pageSize);
  }

  @Post('deletePcUsers')
  removePcUser(@Body() dto: DeleteUserDto) {
    return this.usersService.removePcUser(dto.id);
  }
}
