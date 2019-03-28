import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import {Video} from './Video'   

@Entity()
export class Statistics {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column("double")
    pressRating:number = -1;

    @Column("double")
    userRating:number = -1;
}