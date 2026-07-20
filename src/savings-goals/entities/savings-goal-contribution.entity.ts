import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SavingsGoal } from './savings-goal.entity';

/**
 * Immutable record of a contribution (deposit) or withdrawal to a savings goal.
 * Positive amount = deposit, negative amount = withdrawal.
 * Cannot be edited or deleted (event sourcing lite).
 */
@Entity('savings_goal_contributions')
export class SavingsGoalContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  savingsGoalId: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => SavingsGoal, (g) => g.contributions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'savingsGoalId' })
  savingsGoal: SavingsGoal;
}
