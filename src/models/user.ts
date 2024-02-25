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
    @PrimaryGeneratedColumn('increment')
    id?: number;
  
    @Column()
    displayName!: string;

    @Column()
    email!: string;

    @Column()
    userId!: string;

    @Column({nullable: true})
    userToken?: string;

    @Column({nullable: true})
    preKey?: string;

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;   
  
    @OneToMany(() => ChannelToUser, channelToUser => channelToUser.user)
    public channelToUser?: ChannelToUser[];
  }