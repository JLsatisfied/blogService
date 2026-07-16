import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { CreateLabelDto, ToggleLabelDto, DeleteLabelDto } from './dto/create-label.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('admin')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get('searchLabel')
  findAll(@Query() query: PaginationDto) {
    return this.labelsService.findAll(query.page, query.pageSize);
  }

  @Get('searchAllLabel')
  findAllNoPagination() {
    return this.labelsService.findAllNoPagination();
  }

  @Post('addlabel')
  createOrUpdate(@Body() dto: CreateLabelDto) {
    return this.labelsService.createOrUpdate(dto.name, dto.id);
  }

  @Post('target')
  toggleShow(@Body() dto: ToggleLabelDto) {
    return this.labelsService.toggleShow(dto.id);
  }

  @Post('deleteLabel')
  remove(@Body() dto: DeleteLabelDto) {
    return this.labelsService.remove(dto.id);
  }
}
