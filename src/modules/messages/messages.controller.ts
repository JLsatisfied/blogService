import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  ModerateMessageDto,
  ReplyMessageDto,
  DeleteMessageDto,
} from './dto/create-message.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('admin')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('searchMsg')
  findUnmoderated(@Query() query: PaginationDto) {
    return this.messagesService.findUnmoderated(query.page, query.pageSize);
  }

  @Get('searchMsgPass')
  findModerated(@Query() query: PaginationDto) {
    return this.messagesService.findModerated(query.page, query.pageSize);
  }

  @Post('setStateMsg')
  moderateState(@Body() dto: ModerateMessageDto) {
    return this.messagesService.moderateState(dto.id, dto.state);
  }

  @Post('searchMsgReply')
  reply(@Body() dto: ReplyMessageDto) {
    return this.messagesService.reply(dto.id, dto.adminmsg);
  }

  @Post('delateStateMsg')
  remove(@Body() dto: DeleteMessageDto) {
    return this.messagesService.remove(dto.id);
  }
}
