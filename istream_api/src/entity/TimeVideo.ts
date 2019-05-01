import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, ManyToOne, JoinTable} from "typeorm";
import {Video} from './Video'
import { User } from "./User";

@Entity()
export class TimeVideo {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ended:boolean;
    
    @Column()
    duration: number

    @Column()
    currentTime: number

    @ManyToOne(type => User, user => user.viewing)
    owner: User;

    @ManyToOne(type => Video, video => video.playlists)
    videos: Video;
}