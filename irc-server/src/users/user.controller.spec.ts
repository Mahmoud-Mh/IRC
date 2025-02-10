import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
    let controller: UserController;
    let userService: UserService;

    const mockUserService = {
        getAllUsers: jest.fn(),
        createUser: jest.fn(),
        updateUserNickname: jest.fn(),
        updateUserChannels: jest.fn(),
        getUsersInChannel: jest.fn(),
        getUserByNickname: jest.fn(),
        removeUserFromChannel: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [{ provide: UserService, useValue: mockUserService }],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const users = [{ nickname: 'Alice' }, { nickname: 'Bob' }];
            mockUserService.getAllUsers.mockResolvedValue(users);

            const result = await controller.findAll();

            expect(result).toEqual(users);
            expect(mockUserService.getAllUsers).toHaveBeenCalledWith(undefined);
        });

        it('should return filtered users when search query is provided', async () => {
            const users = [{ nickname: 'Alice' }];
            mockUserService.getAllUsers.mockResolvedValue(users);

            const result = await controller.findAll('Alice');

            expect(result).toEqual(users);
            expect(mockUserService.getAllUsers).toHaveBeenCalledWith('Alice');
        });
    });

    describe('create', () => {
        it('should create and return a new user', async () => {
            const newUser = { nickname: 'Charlie' };
            mockUserService.createUser.mockResolvedValue(newUser);

            const result = await controller.create({ nickname: 'Charlie' });

            expect(result).toEqual(newUser);
            expect(mockUserService.createUser).toHaveBeenCalledWith('Charlie');
        });
    });

    describe('updateNickname', () => {
        it('should update the user nickname', async () => {
            const updatedUser = { nickname: 'Charlie' };
            mockUserService.updateUserNickname.mockResolvedValue(updatedUser);

            const result = await controller.updateNickname('Alice', {
                newNickname: 'Charlie',
            });

            expect(result).toEqual(updatedUser);
            expect(mockUserService.updateUserNickname).toHaveBeenCalledWith(
                'Alice',
                'Charlie',
            );
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockUserService.updateUserNickname.mockResolvedValue(null);

            await expect(
                controller.updateNickname('UnknownUser', { newNickname: 'Charlie' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('addChannel', () => {
        it('should add a channel to a user', async () => {
            const updatedUser = { nickname: 'Alice', channels: ['general'] };
            mockUserService.updateUserChannels.mockResolvedValue(updatedUser);

            const result = await controller.addChannel('Alice', { channel: 'general' });

            expect(result).toEqual(updatedUser);
            expect(mockUserService.updateUserChannels).toHaveBeenCalledWith(
                'Alice',
                'general',
            );
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockUserService.updateUserChannels.mockResolvedValue(null);

            await expect(
                controller.addChannel('UnknownUser', { channel: 'general' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getUsersInChannel', () => {
        it('should return users in a channel', async () => {
            const users = [{ nickname: 'Alice' }, { nickname: 'Bob' }];
            mockUserService.getUsersInChannel.mockResolvedValue(users);

            const result = await controller.getUsersInChannel('general');

            expect(result).toEqual(users);
            expect(mockUserService.getUsersInChannel).toHaveBeenCalledWith('general');
        });
    });

    describe('findOne', () => {
        it('should return a user by nickname', async () => {
            const user = { nickname: 'Alice' };
            mockUserService.getUserByNickname.mockResolvedValue(user);

            const result = await controller.findOne('Alice');

            expect(result).toEqual(user);
            expect(mockUserService.getUserByNickname).toHaveBeenCalledWith('Alice');
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockUserService.getUserByNickname.mockResolvedValue(null);

            await expect(controller.findOne('UnknownUser')).rejects.toThrow(NotFoundException);
        });
    });

    describe('leaveChannel', () => {
        it('should remove a user from a channel', async () => {
            const updatedUser = { nickname: 'Alice', channels: [] };
            mockUserService.removeUserFromChannel.mockResolvedValue(updatedUser);

            const result = await controller.leaveChannel('Alice', { channel: 'general' });

            expect(result).toEqual(updatedUser);
            expect(mockUserService.removeUserFromChannel).toHaveBeenCalledWith(
                'Alice',
                'general',
            );
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockUserService.removeUserFromChannel.mockResolvedValue(null);

            await expect(
                controller.leaveChannel('UnknownUser', { channel: 'general' }),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
