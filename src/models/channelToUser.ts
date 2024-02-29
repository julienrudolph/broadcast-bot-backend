import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./user"
import { Channel } from "./channel"

@Entity()
export class ChannelToUser {
    @PrimaryGeneratedColumn('increment')
    public id?: number;

    @Column()
    public userId: number

    @Column()
    public channelId: number  

    @Column()
    public isAdmin!: boolean;

    @Column()
    public isMuted?: boolean;

    @Column()
    public isApproved?: boolean;

    @Column()
    public conversationId!: string;

    @Column({nullable: true})
    public userToken?: string;

    @ManyToOne(() => User, (user) => user.channelToUser)
    public user!: User

    @ManyToOne(() => Channel, (channel) => channel.channelToUser)
    public channel!: Channel
}