import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { SocketService } from '../socket/socket.service';

describe('ChannelController', () => {
    let controller: ChannelController;
    let channelService: ChannelService;

    const mockChannelService = {
        createChannel: jest.fn().mockImplementation((name) => ({
            id: '1',
            name,
            users: [],
        })),
        getChannels: jest.fn().mockReturnValue([
            { id: '1', name: 'general', users: [] },
            { id: '2', name: 'random', users: [] },
        ]),
        deleteChannel: jest.fn().mockResolvedValue(undefined),
        getChannelById: jest.fn().mockImplementation((id) => ({
            id,
            name: 'general',
            users: [],
        })),
        renameChannel: jest.fn().mockImplementation((oldName, newName) => ({
            id: '1',
            name: newName,
            users: [],
        })),
    };

    const mockSocketService = {
        server: {
            emit: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChannelController],
            providers: [
                { provide: ChannelService, useValue: mockChannelService },
                { provide: SocketService, useValue: mockSocketService },
            ],
        }).compile();

        controller = module.get<ChannelController>(ChannelController);
        channelService = module.get<ChannelService>(ChannelService);
    });

    it('devrait être défini', () => {
        expect(controller).toBeDefined();
    });

    it('devrait créer un channel', async () => {
        const result = await controller.create('testChannel');
        expect(result).toEqual({ id: '1', name: 'testChannel', users: [] });
        expect(channelService.createChannel).toHaveBeenCalledWith('testChannel');
        expect(mockSocketService.server.emit).toHaveBeenCalledWith('notification', expect.any(Object));
    });

    it('devrait récupérer tous les channels', async () => {
        const result = await controller.findAll();
        expect(result.length).toBe(2);
        expect(channelService.getChannels).toHaveBeenCalled();
    });

    it('devrait supprimer un channel', async () => {
        await controller.delete('general');
        expect(channelService.deleteChannel).toHaveBeenCalledWith('general');
        expect(mockSocketService.server.emit).toHaveBeenCalledWith('notification', expect.any(Object));
    });

    it('devrait récupérer un channel par ID', async () => {
        const result = await controller.getChannelById('1');
        expect(result).toEqual({ id: '1', name: 'general', users: [] });
    });

    it('devrait renommer un channel', async () => {
        const result = await controller.rename('oldName', 'newName');
        expect(result).toEqual({ id: '1', name: 'newName', users: [] });
    });
});
