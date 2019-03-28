import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Streaming {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    fr360p:string = '';

    @Column({nullable: true})
    fr480p:string = '';

    @Column({nullable: true})
    fr720p:string = '';

    @Column({nullable: true})
    fr1080p:string = '';

    @Column({nullable: true})
    en360p:string = '';

    @Column({nullable: true})
    en480p:string = '';

    @Column({nullable: true})
    en720p:string = '';

    @Column({nullable: true})
    en1080p:string = '';
}