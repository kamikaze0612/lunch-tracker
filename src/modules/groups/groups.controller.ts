import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import {
  CreateGroupDto,
  UpdateGroupDto,
  AddUserToGroupDto,
  CreateGroupSchema,
  UpdateGroupSchema,
  AddUserToGroupSchema,
} from '@/modules/groups/dto/group.dto';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { GroupsService } from './groups.service';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiBody({
    description: 'Group creation data',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
          example: 'Office Lunch Group',
        },
        description: {
          type: 'string',
          nullable: true,
          example: 'Weekly lunch group for the development team',
        },
        createdBy: {
          type: 'number',
          example: 1,
          description: 'User ID of the group creator',
        },
      },
      required: ['name', 'createdBy'],
    },
  })
  @ApiResponse({ status: 201, description: 'Group successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(
    @Body(new ZodValidationPipe(CreateGroupSchema))
    createGroupDto: CreateGroupDto,
  ) {
    return this.groupsService.createGroup(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  @ApiResponse({
    status: 200,
    description: 'List of all groups',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Office Lunch Group' },
          description: {
            type: 'string',
            nullable: true,
            example: 'Weekly lunch group for the development team',
          },
          createdBy: { type: 'number', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  findAll() {
    return this.groupsService.findAllGroups();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get groups for a specific user' })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of groups the user belongs to',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Office Lunch Group' },
          description: {
            type: 'string',
            nullable: true,
            example: 'Weekly lunch group for the development team',
          },
          createdBy: { type: 'number', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserGroups(@Param('userId', ParseIntPipe) userId: number) {
    return this.groupsService.getUserGroups(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Group ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Group found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Office Lunch Group' },
        description: {
          type: 'string',
          nullable: true,
          example: 'Weekly lunch group for the development team',
        },
        createdBy: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findGroupById(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get group with its members' })
  @ApiParam({ name: 'id', type: 'number', description: 'Group ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Group with members',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Office Lunch Group' },
        description: {
          type: 'string',
          nullable: true,
          example: 'Weekly lunch group for the development team',
        },
        createdBy: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        members: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john.doe@example.com' },
              joinedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findGroupWithMembers(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findGroupWithMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add users to group' })
  @ApiParam({ name: 'id', type: 'number', description: 'Group ID', example: 1 })
  @ApiBody({
    description: 'User IDs to add to the group',
    schema: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'number' },
          minItems: 1,
          example: [2, 3, 4],
          description: 'Array of user IDs to add to the group',
        },
      },
      required: ['userIds'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Users successfully added to group',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or users already in group',
  })
  @ApiResponse({
    status: 404,
    description: 'Group not found or some users not found',
  })
  addUsers(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(AddUserToGroupSchema))
    addUserToGroupDto: AddUserToGroupDto,
  ) {
    return this.groupsService.addUsersToGroup(id, addUserToGroupDto);
  }

  @Delete(':groupId/members/:userId')
  @ApiOperation({ summary: 'Remove user from group' })
  @ApiParam({
    name: 'groupId',
    type: 'number',
    description: 'Group ID',
    example: 1,
  })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'User ID',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully removed from group',
  })
  @ApiResponse({
    status: 404,
    description: 'Group or user not found, or user not in group',
  })
  removeUser(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.groupsService.removeUserFromGroup(groupId, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Group ID', example: 1 })
  @ApiBody({
    description: 'Group update data',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
          example: 'Updated Office Lunch Group',
        },
        description: {
          type: 'string',
          nullable: true,
          example: 'Updated description for the lunch group',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Group successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateGroupSchema))
    updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.updateGroup(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete group by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Group ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Group successfully deleted' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.deleteGroup(id);
  }
}
