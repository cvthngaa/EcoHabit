import {
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
} from 'typeorm';
import * as crypto from 'crypto';

export abstract class BaseEntity {
    @PrimaryColumn('uuid')
    id: string = crypto.randomUUID();

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = crypto.randomUUID();
        }
    }

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
    })
    updatedAt: Date;
}