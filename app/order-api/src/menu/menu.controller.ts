import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import * as express from 'express';
import { MenuService } from './menu.service';
import { Public } from 'src/auth/public.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMenuDto, MenuResponseDto, UpdateMenuDto } from './menu.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';

@ApiTags('Menu')
@Controller('menu')
@ApiBearerAuth()
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all menu' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All menus have been retrieved successfully',
    type: MenuResponseDto,
    isArray: true,
  })
  async getAllMenus(@Query() query: any) {
    const result = await this.menuService.getAllMenus(query);
    return {
      message: 'All menus have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<MenuResponseDto[]>;
  }

  @Get(':slug')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve menu by slug' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The specific menu was retrieved successfully',
    type: MenuResponseDto,
  })
  async getMenu(@Request() req: express.Request, @Param('slug') slug: string) {
    const result = await this.menuService.getMenu(slug);
    return {
      message: 'The specific menu was retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<MenuResponseDto>;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new menu' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The new menu was created successfully',
    type: MenuResponseDto,
  })
  async createMenu(@Body(ValidationPipe) requestData: CreateMenuDto) {
    const result = await this.menuService.createMenu(requestData);
    return {
      message: 'The new menu was created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<MenuResponseDto>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update menu' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The menu was updated successfully',
    type: MenuResponseDto,
  })
  async updateMenu(
    @Param('slug') slug: string,
    @Body(ValidationPipe) requestData: UpdateMenuDto,
  ) {
    const result = await this.menuService.updateMenu(slug, requestData);
    return {
      message: 'The new menu was updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<MenuResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete menu' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The menu was deleted successfully',
    type: String,
  })
  async deleteMenu(@Param('slug') slug: string) {
    const result = await this.menuService.deleteMenu(slug);
    return {
      message: 'The new menu was deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} menu was deleted successfully`,
    } as AppResponseDto<string>;
  }

  @Patch(':slug/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore menu' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The menu was restored successfully',
    type: MenuResponseDto,
  })
  async restoreMenu(@Param('slug') slug: string) {
    const result = await this.menuService.restoreMenu(slug);
    return {
      message: 'The new menu was restored successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<MenuResponseDto>;
  }
}
