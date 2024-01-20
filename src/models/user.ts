import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
  } from "typeorm";
import { Channel } from "./channel";
import { ChannelToUser } from "./channelToUser";

  @Entity()
  export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;
  
    @Column()
    lastName!: string;
  
    @Column()
    email!: string;

    @Column()
    approved!: boolean;

    @Column()
    userId!: string;
  
    @Column()
    isAdmin!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;   
  
    @OneToMany(() => ChannelToUser, channelToUser => channelToUser.user)
    public channelToUser!: ChannelToUser[];
  }