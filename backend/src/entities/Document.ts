import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Category } from './Category';
import { User } from './User';

@Entity("documents")
export class Document {
  @PrimaryGeneratedColumn("uuid")
  id!: number;

  @ManyToOne(() => User, user => user.documents)
  user: User;
  

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToOne(() => Category, { nullable: true })
  category: Category;

  @Column()
  s3_key!: string;

  @Column()
  s3_url!: string;

  @Column()
  file_size!: number;

  @Column()
  file_type!: string;

  @CreateDateColumn()
  created_at!: Date;
}
