import { Controller, Get, Post, Body, Param, Query, Patch, Delete, ParseIntPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post() create(@Body() dto: CreateUserDto) { return this.users.create(dto); }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number,
  ) { return this.users.findAll(skip, take); }

  @Get(':id') findOne(@Param('id') id: string) { return this.users.findOne(id); }

  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.users.update(id, dto); }

  @Delete(':id') remove(@Param('id') id: string) { return this.users.remove(id); }
}