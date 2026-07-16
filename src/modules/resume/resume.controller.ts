import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { CreateResumeDto, DeleteResumeDto } from './dto/create-resume.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('admin')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('addResume')
  createOrUpdate(@Body() dto: CreateResumeDto) {
    return this.resumeService.createOrUpdate(dto);
  }

  @Get('searchResume')
  findAll(@Query() query: PaginationDto) {
    return this.resumeService.findAll(query.page, query.pageSize);
  }

  @Post('deleteResume')
  remove(@Body() dto: DeleteResumeDto) {
    return this.resumeService.remove(dto.id);
  }
}
