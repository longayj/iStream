import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";
import { User } from "./User";
import { Video } from "./Video";

@Entity()
export class Comment {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    title:string = '';

    @Column({nullable: true})
    value:string = '';

    @ManyToOne(type => User, user => user.comments)
    user: User;

    @Column({nullable: true})
    userId: number

    @Column({nullable: true})
    username: string

    @Column({nullable: true})
    videoId: number

    @ManyToOne(type => Video, video => video.comments)
    video: Video;
    
    @CreateDateColumn({nullable: true})
    createdAt: Date;

    @UpdateDateColumn({nullable: true})
    updatedAt: Date;
}