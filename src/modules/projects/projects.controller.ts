import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, DeleteProjectDto } from './dto/create-project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('admin')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('addProject')
  createOrUpdate(@Body() dto: CreateProjectDto) {
    return this.projectsService.createOrUpdate(dto);
  }

  @Get('searchProject')
  findAll(@Query() query: PaginationDto) {
    return this.projectsService.findAll(query.page, query.pageSize);
  }

  @Post('deleteProject')
  remove(@Body() dto: DeleteProjectDto) {
    return this.projectsService.remove(dto.id);
  }
}
