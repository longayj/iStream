import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class CastingShort {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    directors:string;

    @Column()
    actors:string;
}