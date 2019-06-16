import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, ManyToOne, JoinTable, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {Video} from './Video'
import { User } from "./User";

@Entity()
export class TimeVideo {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    ended:number = 0;
    
    @Column({nullable: true})
    duration: number

    @Column({nullable: true})
    currentTime: number

    @ManyToOne(type => User, user => user.viewing)
    owner: User;

    @Column({nullable: true})
    ownerId: number

    @ManyToOne(type => Video, video => video.viewing)
    video: Video;

    @Column({nullable: true})
    videoId: number

    @CreateDateColumn({nullable: true})
    createdAt: Date;

    @UpdateDateColumn({nullable: true})
    updatedAt: Date;
}