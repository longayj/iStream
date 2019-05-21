import "reflect-metadata";
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique, ManyToOne} from "typeorm";
import { Like } from "./Like";
import { Comment } from "./Comment";
import { Video } from "./Video";
import * as bcrypt from "bcryptjs";
import { Playlist } from "./Playlist";
import { TimeVideo } from "./TimeVideo";

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
    role: string = 'USER';

    @Column()
    username:string = '';

    @Column()
    language:string = 'fr';

    @Column({nullable: true})
    darkMode: boolean = false;

    @Column({nullable: true})
    primaryColor: string = "#338ABD";

    @Column({nullable: true})
    secondaryColor: string = "#F1580A";

    @Column({nullable: true})
    preferredStreamLanguage: string = "fr";

    @Column({nullable: true})
    preferredStreamQuality: string = "360p"

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

    @OneToMany(type => Playlist, playlist => playlist.owner)
    playlists: Playlist[]

    @OneToMany(type => Video, video => video.user)
    viewing: TimeVideo[];
    
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
