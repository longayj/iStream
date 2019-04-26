import "reflect-metadata";
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique} from "typeorm";
import { Like } from "./Like";
import { Comment } from "./Comment";
import { Video } from "./Video";
import * as bcrypt from "bcryptjs";

@Entity()
@Unique(["username"])
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
    role: string = '';

    @Column()
    username:string = '';

    @Column()
    language:string = 'en';

    @Column()
    darkMode: boolean = false;

    @Column()
    primaryColor: string = "#338ABD";

    @Column()
    secondaryColor: string = "#F1580A";

    @Column()
    preferredStreamLanguage: string = "French";

    @Column()
    preferredStreamQuality: string = "p360"

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
    
    @Column({nullable: true})
    isVerify: boolean = false;
    
    @Column()
    isDisable: boolean = false;
    
    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 8);
    }
    
    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
        if (unencryptedPassword == undefined)
            return false
        return bcrypt.compareSync(unencryptedPassword, this.password);
    }
}
