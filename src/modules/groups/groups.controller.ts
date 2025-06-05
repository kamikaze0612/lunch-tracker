import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UsePipes,
  Query,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import {
  CreateGroupDto,
  UpdateGroupDto,
  AddUserToGroupDto,
  CreateGroupSchema,
  UpdateGroupSchema,
  AddUserToGroupSchema,
} from '@/common/dto/group.dto';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateGroupSchema))
  create(
    @Body() createGroupDto: CreateGroupDto,
    @Query('createdBy', ParseIntPipe) createdBy: number,
  ) {
    return this.groupsService.createGroup(createGroupDto, createdBy);
  }

  @Get()
  findAll() {
    return this.groupsService.findAllGroups();
  }

  @Get('user/:userId')
  getUserGroups(@Param('userId', ParseIntPipe) userId: number) {
    return this.groupsService.getUserGroups(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findGroupById(id);
  }

  @Get(':id/members')
  findGroupWithMembers(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findGroupWithMembers(id);
  }

  @Post(':id/members')
  @UsePipes(new ZodValidationPipe(AddUserToGroupSchema))
  addUsers(
    @Param('id', ParseIntPipe) id: number,
    @Body() addUserToGroupDto: AddUserToGroupDto,
  ) {
    return this.groupsService.addUsersToGroup(id, addUserToGroupDto);
  }

  @Delete(':groupId/members/:userId')
  removeUser(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.groupsService.removeUserFromGroup(groupId, userId);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateGroupSchema))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.updateGroup(id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.deleteGroup(id);
  }
}
