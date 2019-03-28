import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import {Video} from './Video'
import { User } from "./User";

@Entity()
export class CurrentVideo {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    currentTime:string = "";

    @ManyToOne(type => Video, video => video.id)
    video: Video;

    @ManyToOne(type => User, user => user.id)
    user: User;
}