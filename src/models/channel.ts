import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
  } from "typeorm";
  import { ChannelToUser } from "./channelToUser";
  @Entity()
  export class Channel {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column()
    botId!: string;

    @Column()
    name!: string;

    @CreateDateColumn()
    createdAt?: Date;
  
    @UpdateDateColumn()
    updatedAt?: Date;   

    @OneToMany(() => ChannelToUser, channelToUser => channelToUser.channel)
    public channelToUser?: ChannelToUser[];
  }