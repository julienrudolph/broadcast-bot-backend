import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./user"
import { Channel } from "./channel"

@Entity()
export class ChannelToUser {
    @PrimaryGeneratedColumn()
    public channelToUserID!: number;

    @Column()
    public channelId!: number;

    @Column()
    public userId!: number;
    
    @Column()
    public isAdmin!: boolean;

    @Column()
    public isMuted!: boolean;

    @Column()
    public isApproved!: boolean;

    @ManyToOne(() => User, (user) => user.channelToUser)
    public user!: User

    @ManyToOne(() => Channel, (channel) => channel.channelToUser)
    public channel!: Channel
}