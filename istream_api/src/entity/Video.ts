import {Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn} from "typeorm";
import {Tag} from './Tag'
import {Comment} from './Comment'
import {Like} from './Like'
import { Statistics } from './Statistics';
import { User } from "./User";
import { CastingShort } from "./CastingShort";
import { Streaming } from "./Streaming";

@Entity()
export class Video {
    
    @PrimaryGeneratedColumn()
    id: number;

	@Column()
    url: string = '';

	@Column()
    description: string = '';

    @Column()
    title: string = '';

    @Column()
    originalTitle: string = '';

    @Column()
    productionYear:number = -1;

    @Column()
    posterUrl:string = "";

    @Column()
    downloadLink: string = "";

    @Column()
    filename: string = "";

    @Column()
    releaseDate: Date = new Date;

    @Column()
    synopsis: string = "";

    @OneToOne(type => Streaming, { onDelete: 'CASCADE' })
    @JoinColumn()
    streaming: Streaming;

    @OneToOne(type => CastingShort, { onDelete: 'CASCADE' })
    @JoinColumn()
    castingShort: CastingShort;

    @OneToMany(type => User, user => user.videos)
    user: User;

    @OneToOne(type => Statistics, { onDelete: 'CASCADE' })
    @JoinColumn()
    statistics: Statistics;

    @OneToMany(type => Like, like => like.video)
    likes: Like[];

    @OneToMany(type => Tag, tag => tag.video)
    tags: Tag[];

    @OneToMany(type => Comment, comment => comment.video)
    comments: Comment[];
}