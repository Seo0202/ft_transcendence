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
    sendBookCreate(book) {
        const message = {
            type: 'BOOK_SYNC_EVENT',
            sync_version: 1,
            sync_id: `sync-${(0, node_crypto_1.randomUUID)()}`,
            operation: 'CREATE',
            book_id: book.book_id,
        };
        this.broadcast(message);
    }
    sendBookUpdate(book) {
        const message = {
            type: 'BOOK_SYNC_EVENT',
            sync_version: 1,
            sync_id: `sync-${(0, node_crypto_1.randomUUID)()}`,
            operation: 'UPDATE',
            book_id: book.book_id,
        };
        this.broadcast(message);
    }
    sendBookDelete(book_id) {
        const message = {
            type: 'BOOK_SYNC_EVENT',
            sync_version: 1,
            sync_id: `sync-${(0, node_crypto_1.randomUUID)()}`,
            operation: 'DELETE',
            book_id: book_id,
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
        client.on('message', async (raw) => {
            let message;
            try {
                message = JSON.parse(raw.toString());
            }
            catch {
                console.log('잘못된 JSON 메시지');
                return;
            }
            if (message.type === 'BOOK_SYNC_ACK') {
                this.handleSyncAck(message);
                return;
            }
            console.log('알 수 없는 메시지 타입:', message.type);
        });
    }
    handleSyncAck(message) {
        const { type, sync_id, sync_version, device_id, status, timestamp, } = message;
        if (status === 'SUCCESS') {
            console.log({
                type,
                sync_id,
                sync_version,
                device_id,
                status,
            });
        }
        else if (status === 'FAILED') {
            console.log({
                type,
                sync_id,
                sync_version,
                device_id,
                status,
                error_code: message.error_code,
                message: message.message,
            });
        }
        else {
            console.log('알 수 없는 동기화 상태:', message);
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
