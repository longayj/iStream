import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import {Video} from './Video'
import { User } from '.';

@Entity()
export class Like {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    value:string;

    @ManyToOne(type => Video, video => video.likes)
    video: Video;

    @ManyToOne(type => Video, video => video.user)
    user: User;

    @Column()
    userId: number
}