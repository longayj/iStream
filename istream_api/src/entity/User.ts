import "reflect-metadata";
import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { Like } from "./Like";
import { Comment } from "./Comment";
import { Video } from "./Video";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string = '';

    @Column()
    lastName: string = '';

    @Column()
    age: number = 0;

    @Column()
	password: string = '';

    @Column()
    pictureUrl:string = '';

    @Column()
    email: string = '';

    @Column()
    username:string = '';

    @Column()
    language:string = 'en';

    @Column()
    allDebridUsername: string = '';

    @Column()
    allDebridPassword:string = '';
    
    @OneToMany(type => Like, like => like.user)
	likes: Like[];
	
	@OneToMany(type => Comment, comment => comment.user)
    comments: Comment[];

    @OneToMany(type => Video, video => video.user)
    videos: Video[];

    @Column()
	isDisable: boolean = false;
}
