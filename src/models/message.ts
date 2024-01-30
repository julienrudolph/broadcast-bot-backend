import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn
  } from "typeorm";
import { User } from "./user"; 
import { Channel } from "./channel";

  @Entity()
  export class Message {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content!: string;
  
    @Column()
    mimeType!: string;

    @Column()
    isAdmin!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;   

    @OneToOne(() => User)
    @JoinColumn()
    createdBy!: User
  
    @OneToOne(() => Channel)
    @JoinColumn()
    postedIn!: Channel

  }