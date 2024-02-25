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
    displayName!: string;

    @Column()
    email!: string;

    @Column()
    userId!: string;

    @Column()
    userToken!: string;

    @Column()
    preKey!: string;

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;   
  
    @OneToMany(() => ChannelToUser, channelToUser => channelToUser.user)
    public channelToUser!: ChannelToUser[];
  }