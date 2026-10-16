
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { WebSocketServer as WsServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

@WebSocketGateway({ path: '/sync' })
export class SyncGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: WsServer;

  private prisma = new PrismaClient();

  sendBookCreate(book: any) {
    const message = {
      type: 'BOOK_SYNC_EVENT',
      sync_version: 1,
      sync_id: `sync-${randomUUID()}`,
      operation: 'CREATE',
      book_id: book.book_id,
    };

    this.broadcast(message);
  }

    sendBookUpdate(book: any) {
    const message = {
      type: 'BOOK_SYNC_EVENT',
      sync_version: 1,
      sync_id: `sync-${randomUUID()}`,
      operation: 'UPDATE',
      book_id: book.book_id,
    };

    this.broadcast(message);
  }

  sendBookDelete(book_id: number) {
    const message = {
      type: 'BOOK_SYNC_EVENT',
      sync_version: 1,
      sync_id: `sync-${randomUUID()}`,
      operation: 'DELETE',
      book_id: book_id,
    };

    this.broadcast(message);
  }

  private broadcast(message: object) {
    if (!this.server) {
      console.log('WebSocket 서버가 준비되지 않았습니다.');
      return;
    }

    const data = JSON.stringify(message);

    for (const client of this.server.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  handleConnection(client: WebSocket) {

    client.on('message', async (raw) => {
      let message: any;

      try {
        message = JSON.parse(raw.toString());
      } catch {
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

  private handleSyncAck(message: any) {
    const {
      type,
      sync_id,
      sync_version,
      device_id,
      status,
      timestamp,
    } = message;

    if (status === 'SUCCESS') {
      console.log({
        type,
        sync_id,
        sync_version,
        device_id,
        status,
      });
    } else if (status === 'FAILED') {
      console.log({
        type,
        sync_id,
        sync_version,
        device_id,
        status,
        error_code: message.error_code,
        message: message.message,
      });
    } else {
      console.log('알 수 없는 동기화 상태:', message);
    }
  }

}