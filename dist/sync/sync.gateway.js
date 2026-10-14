"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const ws_1 = require("ws");
const client_1 = require("@prisma/client");
const node_crypto_1 = require("node:crypto");
let SyncGateway = class SyncGateway {
    server;
    prisma = new client_1.PrismaClient();
    sendBookSync(book) {
        const message = {
            type: 'DB_SYNC',
            sync_version: 1,
            sync_id: `sync-${(0, node_crypto_1.randomUUID)()}`,
            operation: 'UPSERT',
            data: book,
            timestamp: new Date().toISOString(),
        };
        this.broadcast(message);
    }
    sendBookDelete(book_id) {
        const message = {
            type: 'DB_SYNC',
            sync_version: 1,
            sync_id: `sync-${(0, node_crypto_1.randomUUID)()}`,
            operation: 'DELETE',
            data: { book_id },
            timestamp: new Date().toISOString(),
        };
        this.broadcast(message);
    }
    broadcast(message) {
        if (!this.server) {
            console.log('WebSocket 서버가 준비되지 않았습니다.');
            return;
        }
        const data = JSON.stringify(message);
        for (const client of this.server.clients) {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(data);
            }
        }
    }
    handleConnection(client) {
        console.log('WebSocket 클라이언트 연결');
        client.on('message', async (raw) => {
            let message;
            try {
                message = JSON.parse(raw.toString());
            }
            catch {
                console.log('잘못된 JSON 메시지');
                return;
            }
            if (message.type === 'DB_SYNC_ACK') {
                this.handleSyncAck(message);
                return;
            }
            if (message.type === 'SYNC_REQUEST') {
                await this.handleSyncRequest(client, message);
                return;
            }
            console.log('알 수 없는 메시지 타입:', message.type);
        });
    }
    handleSyncAck(message) {
        const { type, sync_id, sync_version, device_id, status, timestamp, } = message;
        if (status === 'SUCCESS') {
            console.log('DB 동기화 성공:', {
                type,
                sync_id,
                sync_version,
                device_id,
                status,
                timestamp,
            });
        }
        else if (status === 'FAILED') {
            console.log('DB 동기화 실패:', {
                type,
                sync_id,
                sync_version,
                device_id,
                status,
                error_code: message.error_code,
                message: message.message,
                timestamp,
            });
        }
        else {
            console.log('알 수 없는 동기화 상태:', message);
        }
    }
    async handleSyncRequest(client, message) {
        try {
            if (typeof message.device_id !== 'string' ||
                !message.device_id ||
                !Number.isSafeInteger(message.last_sync_version) ||
                message.last_sync_version < 0) {
                throw new Error('Invalid SYNC_REQUEST');
            }
            console.log('재접속 동기화 요청:', message);
            const books = await this.prisma.book.findMany();
            for (const book of books) {
                if (client.readyState !== ws_1.WebSocket.OPEN) {
                    throw new Error('WebSocket connection closed');
                }
                client.send(JSON.stringify({
                    type: 'DB_SYNC',
                    sync_version: 1,
                    sync_id: `sync-${(0, node_crypto_1.randomUUID)()}`,
                    operation: 'UPSERT',
                    data: book,
                    timestamp: new Date().toISOString(),
                }));
            }
            if (client.readyState !== ws_1.WebSocket.OPEN) {
                throw new Error('WebSocket connection closed');
            }
            client.send(JSON.stringify({
                type: 'SYNC_COMPLETE',
                device_id: message.device_id,
                status: 'SUCCESS',
                sync_version: 1,
                timestamp: new Date().toISOString(),
            }));
            console.log('전체 도서 동기화 메시지 전송 완료');
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Unknown error';
            console.error('재접속 동기화 실패:', errorMessage);
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'SYNC_COMPLETE',
                    device_id: message?.device_id ?? null,
                    status: 'FAILED',
                    error_code: 'SYNC_FAILED',
                    message: errorMessage,
                    timestamp: new Date().toISOString(),
                }));
            }
        }
    }
};
exports.SyncGateway = SyncGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", ws_1.WebSocketServer)
], SyncGateway.prototype, "server", void 0);
exports.SyncGateway = SyncGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ path: '/sync' })
], SyncGateway);
