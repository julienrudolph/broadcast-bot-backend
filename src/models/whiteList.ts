import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";

@Entity()
export class Whitelist {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  mail!: string;
}