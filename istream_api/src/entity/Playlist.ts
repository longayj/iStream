import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, ManyToOne, JoinTable} from "typeorm";
import {Video} from './Video'
import { User } from "./User";

@Entity()
export class Playlist {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name:string;

    @Column()
    shared:number = 0;

    @Column()
    ownerId:number;

    @ManyToOne(type => User, user => user.playlists)
    owner: User;

    @ManyToMany(type => Video, video => video.playlists)
    @JoinTable()
    videos: Video[];
}