import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity()
export class BroadCast {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column()
  broadCastId!: string;

  @Column()
  message!: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;   

  @Column()
  userId: string;
}