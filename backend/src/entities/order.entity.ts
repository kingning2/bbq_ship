import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Coupon } from './coupon.entity';
import { User } from './user.entity';

export enum OrderStatus {
  PENDING = 'pending', // 待处理
  PROCESSING = 'processing', // 制作中
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
}

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_no' })
  orderNo: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column('decimal', { name: 'original_amount', precision: 10, scale: 2 })
  originalAmount: number;

  @Column('decimal', { name: 'discount_amount', precision: 10, scale: 2 })
  discountAmount: number;

  @Column('decimal', { name: 'final_amount', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({ name: 'coupon_id', nullable: true })
  couponId: number;

  @Column({ nullable: true })
  remark: string;

  @Column({ name: 'delivery_type' })
  deliveryType: string;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Coupon)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
