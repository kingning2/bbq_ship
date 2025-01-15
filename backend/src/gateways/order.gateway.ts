import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'orders',
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, Socket[]> = new Map();

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromToken(client);
    if (userId) {
      const userSockets = this.userSockets.get(userId) || [];
      userSockets.push(client);
      this.userSockets.set(userId, userSockets);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromToken(client);
    if (userId) {
      const userSockets = this.userSockets.get(userId) || [];
      const index = userSockets.indexOf(client);
      if (index > -1) {
        userSockets.splice(index, 1);
      }
      if (userSockets.length === 0) {
        this.userSockets.delete(userId);
      } else {
        this.userSockets.set(userId, userSockets);
      }
    }
  }

  private getUserIdFromToken(client: Socket): number | null {
    const token = client.handshake.auth.token;
    try {
      // 这里需要实现从token中获取userId的逻辑
      return parseInt(token);
    } catch (e) {
      return null;
    }
  }

  // 向指定用户发送订单更新
  notifyOrderUpdate(userId: number, order: any) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach((socket) => {
        socket.emit('orderUpdate', order);
      });
    }
  }

  // 向商家发送新订单通知
  notifyNewOrder(order: any) {
    this.server.emit('newOrder', order);
  }
}
