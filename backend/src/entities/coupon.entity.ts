import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('coupon')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['amount', 'percentage'],
  })
  type: 'amount' | 'percentage';

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column('decimal', {
    name: 'min_amount',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minAmount: number;

  @Column('decimal', {
    name: 'probability',
    precision: 5,
    scale: 2,
    default: 100,
  })
  probability: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
