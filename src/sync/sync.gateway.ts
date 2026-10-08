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

  sendBookSync(book: any) {
    const message = {
      type: 'DB_SYNC',
      sync_version: 1,
      sync_id: `sync-${randomUUID()}`,
      operation: 'UPSERT',
      data: book,
      timestamp: new Date().toISOString(),
    };

    this.broadcast(message);
  }

  sendBookDelete(book_id: number) {
    const message = {
      type: 'DB_SYNC',
      sync_version: 1,
      sync_id: `sync-${randomUUID()}`,
      operation: 'DELETE',
      data: { book_id },
      timestamp: new Date().toISOString(),
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
    console.log('WebSocket 클라이언트 연결');

    client.on('message', async (raw) => {
      let message: any;

      try {
        message = JSON.parse(raw.toString());
      } catch {
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
      console.log('DB 동기화 성공:', {
        type,
        sync_id,
        sync_version,
        device_id,
        status,
        timestamp,
      });
    } else if (status === 'FAILED') {
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
    } else {
      console.log('알 수 없는 동기화 상태:', message);
    }
  }

  private async handleSyncRequest(
    client: WebSocket,
    message: any,
  ) {
    try {
      if (
        typeof message.device_id !== 'string' ||
        !message.device_id ||
        !Number.isSafeInteger(message.last_sync_version) ||
        message.last_sync_version < 0
      ) {
        throw new Error('Invalid SYNC_REQUEST');
      }

      console.log('재접속 동기화 요청:', message);

      const books = await this.prisma.book.findMany();

      for (const book of books) {
        if (client.readyState !== WebSocket.OPEN) {
          throw new Error('WebSocket connection closed');
        }

        client.send(
          JSON.stringify({
            type: 'DB_SYNC',
            sync_version: 1,
            sync_id: `sync-${randomUUID()}`,
            operation: 'UPSERT',
            data: book,
            timestamp: new Date().toISOString(),
          }),
        );
      }

      if (client.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket connection closed');
      }

      client.send(
        JSON.stringify({
          type: 'SYNC_COMPLETE',
          device_id: message.device_id,
          status: 'SUCCESS',
          sync_version: 1,
          timestamp: new Date().toISOString(),
        }),
      );

      console.log('전체 도서 동기화 메시지 전송 완료');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      console.error('재접속 동기화 실패:', errorMessage);

      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: 'SYNC_COMPLETE',
            device_id: message?.device_id ?? null,
            status: 'FAILED',
            error_code: 'SYNC_FAILED',
            message: errorMessage,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    }
  }
}
