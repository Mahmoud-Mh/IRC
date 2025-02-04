import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from './channel.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channel } from './channel.schema';

describe('ChannelService', () => {
    let service: ChannelService;
    let model: Model<Channel>;

    const mockChannelModel = {
        create: jest.fn().mockImplementation((dto) => Promise.resolve({ _id: '1', ...dto })),
        find: jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue([
                { _id: '1', name: 'general', users: [] },
                { _id: '2', name: 'random', users: [] },
            ]),
        })),
        deleteOne: jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        })),
        findOneAndUpdate: jest.fn().mockImplementation((query, update) => ({
            exec: jest.fn().mockResolvedValue({ _id: '1', ...update }),
        })),
        findById: jest.fn().mockImplementation((id) => ({
            exec: jest.fn().mockResolvedValue({ _id: id, name: 'general', users: [] }),
        })),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChannelService,
                { provide: getModelToken(Channel.name), useValue: mockChannelModel },
            ],
        }).compile();

        service = module.get<ChannelService>(ChannelService);
        model = module.get<Model<Channel>>(getModelToken(Channel.name));
    });

    it('devrait être défini', () => {
        expect(service).toBeDefined();
    });

    it('devrait créer un channel', async () => {
        const result = await service.createChannel('testChannel');
        expect(result).toEqual({ _id: '1', name: 'testChannel' });
        expect(model.create).toHaveBeenCalledWith({ name: 'testChannel' });
    });

    it('devrait récupérer les channels', async () => {
        const result = await service.getChannels();
        expect(result.length).toBe(2);
        expect(model.find).toHaveBeenCalled();
    });

    it('devrait supprimer un channel', async () => {
        await service.deleteChannel('general');
        expect(model.deleteOne).toHaveBeenCalledWith({ name: 'general' });
    });

    it('devrait renommer un channel', async () => {
        const result = await service.renameChannel('oldName', 'newName');
        expect(result).toEqual({ _id: '1', name: 'newName' });
    });

    it('devrait récupérer un channel par ID', async () => {
        const result = await service.getChannelById('1');
        expect(result).toEqual({ _id: '1', name: 'general', users: [] });
    });
});
