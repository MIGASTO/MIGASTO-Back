import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entity/tag.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)

export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @Roles('admin', 'usuario')
  create(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    return this.tagService.create(createTagDto);
  }

  @Get()
  @Roles('admin', 'usuario')
  findAll(): Promise<Tag[]> {
    return this.tagService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'usuario')
  findOne(@Param('id') id: string): Promise<Tag> {
    return this.tagService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'usuario')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto): Promise<Tag> {
    return this.tagService.update(+id, updateTagDto);
  }

  @Delete(':id')
  @Roles('admin', 'usuario')
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
