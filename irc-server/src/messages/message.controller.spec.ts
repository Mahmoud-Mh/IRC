import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

describe('MessageController', () => {
    let controller: MessageController;
    let messageService: MessageService;

    beforeEach(async () => {
        const mockMessageService = {
            createMessage: jest.fn().mockResolvedValue({ id: '1', sender: 'Alice', channel: 'general', content: 'Hello' }),
            createPrivateMessage: jest.fn().mockResolvedValue({ id: '2', sender: 'Alice', recipient: 'Bob', content: 'Hi Bob' }),
            getMessagesByChannel: jest.fn().mockResolvedValue([{ id: '1', sender: 'Alice', channel: 'general', content: 'Hello' }]),
            getPrivateMessages: jest.fn().mockResolvedValue([{ id: '2', sender: 'Alice', recipient: 'Bob', content: 'Hi Bob' }]),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessageController],
            providers: [{ provide: MessageService, useValue: mockMessageService }],
        }).compile();

        controller = module.get<MessageController>(MessageController);
        messageService = module.get<MessageService>(MessageService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new message', async () => {
            const result = await controller.create('Alice', 'general', 'Hello');
            expect(result).toEqual({ id: '1', sender: 'Alice', channel: 'general', content: 'Hello' });
            expect(messageService.createMessage).toHaveBeenCalledWith('Alice', 'general', 'Hello');
        });
    });

    describe('createPrivateMessage', () => {
        it('should create a private message', async () => {
            const result = await controller.createPrivateMessage('Alice', 'Bob', 'Hi Bob');
            expect(result).toEqual({ id: '2', sender: 'Alice', recipient: 'Bob', content: 'Hi Bob' });
            expect(messageService.createPrivateMessage).toHaveBeenCalledWith('Alice', 'Bob', 'Hi Bob');
        });
    });

    describe('findAll', () => {
        it('should return messages from a channel', async () => {
            const result = await controller.findAll('general');
            expect(result).toEqual([{ id: '1', sender: 'Alice', channel: 'general', content: 'Hello' }]);
            expect(messageService.getMessagesByChannel).toHaveBeenCalledWith('general');
        });
    });

    describe('getPrivateMessages', () => {
        it('should return private messages between two users', async () => {
            const result = await controller.getPrivateMessages('Alice', 'Bob');
            expect(result).toEqual([{ id: '2', sender: 'Alice', recipient: 'Bob', content: 'Hi Bob' }]);
            expect(messageService.getPrivateMessages).toHaveBeenCalledWith('Alice', 'Bob');
        });
    });
});
