import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { User } from "./User";
import { Video } from "./Video";

@Entity()
export class Comment {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title:string;

    @Column()
    value:string;

    @ManyToOne(type => User, user => user.comments)
    user: User;

    @ManyToOne(type => Video, video => video.likes)
    video: Video;
}