import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Document } from "./Document";
import { Notification } from "./Notification";
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  created_at!: Date;
  
  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ default: "user" })
  role!: string;

  @OneToMany(() => Document, doc => doc.user)
  documents: Document[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
}
