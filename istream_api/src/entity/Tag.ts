import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import {Video} from './Video'

@Entity()
export class Tag {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    value:string;

    @ManyToOne(type => Video, video => video.tags)
    video: Video;
}