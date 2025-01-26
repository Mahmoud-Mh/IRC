import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateNicknameDto, AddChannelDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.userService.getAllUsers(search);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto.nickname);
  }

  @Patch(':nickname')
  async updateNickname(
    @Param('nickname') oldNickname: string,
    @Body() updateNicknameDto: UpdateNicknameDto,
  ) {
    const user = await this.userService.updateUserNickname(
      oldNickname,
      updateNicknameDto.newNickname,
    );
    if (!user) {
      throw new NotFoundException(
        `User with nickname ${oldNickname} not found.`,
      );
    }
    return user;
  }

  @Patch(':nickname/channels')
  async addChannel(
    @Param('nickname') nickname: string,
    @Body() addChannelDto: AddChannelDto,
  ) {
    const user = await this.userService.updateUserChannels(
      nickname,
      addChannelDto.channel,
    );
    if (!user) {
      throw new NotFoundException(`User with nickname ${nickname} not found.`);
    }
    return user;
  }

  @Get('channels/:channel/users')
  async getUsersInChannel(@Param('channel') channel: string) {
    return this.userService.getUsersInChannel(channel);
  }

  @Get(':nickname')
  async findOne(@Param('nickname') nickname: string) {
    const user = await this.userService.getUserByNickname(nickname);
    if (!user) {
      throw new NotFoundException(`User with nickname ${nickname} not found.`);
    }
    return user;
  }

  @Patch(':nickname/channels/leave')
  async leaveChannel(
    @Param('nickname') nickname: string,
    @Body() addChannelDto: AddChannelDto,
  ) {
    const user = await this.userService.removeUserFromChannel(
      nickname,
      addChannelDto.channel,
    );
    if (!user) {
      throw new NotFoundException(`User with nickname ${nickname} not found.`);
    }
    return user;
  }
}
