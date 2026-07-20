import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('transactions')
@Index(['userId', 'date'])
@Index(['userId', 'type', 'date'])
@Index(['userId', 'categoryId'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'enum', enum: ['income', 'expense'], enumName: 'transaction_type' })
  type: 'income' | 'expense';

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: string; // DECIMAL/NUMERIC returns as string to avoid float issues

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentPlace: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  invoiceNumber: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  invoiceFilePath: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  invoiceOriginalName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  invoiceMimeType: string | null;

  @Column({ type: 'timestamp', nullable: true })
  invoiceUploadedAt: Date | null;

  @Column({ type: 'date' })
  date: string; // DATE without time

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
