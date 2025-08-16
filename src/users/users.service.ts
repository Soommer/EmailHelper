import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
    constructor (private prisma: PrismaService) {}

    async create(dto :{email: string; password: string; name?: string}){
        const exist = await this.prisma.user.findUnique({where: {email: dto.email}})
        if(exist) throw new ConflictException('Email Zajęty');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.create({data: {email: dto.email, passwordHash, name:dto.name}});     
    }

    findAll(skip = 0, take= 200){
        return this.prisma.user.findMany({skip, take, orderBy: {createdAt: 'desc'}});
    }

    async findOne(id: string){
        const user = await this.prisma.user.findUnique({where: { id }, select: {id:true,email:true,name:true,role:true,createdAt:true } });
        if(!user) throw new NotFoundException('Brak urzytkownika o id');
        return user;
    }

    async update(id: string, data: {name?: string}){
        try {
            return await this.prisma.user.update({ where: { id }, data, select: { id:true,email:true,name:true,role:true } });
        } catch {
            throw new NotFoundException('Brak urzytkownika o id');
        }
    }

    async remove(id: string) {
        try {
            await this.prisma.user.delete({ where: { id } });
            return { deleted: true };
        } catch {
            throw new NotFoundException('Brak urzytkownika o id');
        }
    }
    
    // używane przez Auth
    findByEmail(email: string) { return this.prisma.user.findUnique({ where: { email } });}
}