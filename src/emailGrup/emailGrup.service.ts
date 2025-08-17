import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class EmailGrupService {
    constructor(
        private prisma: PrismaService,
    ) {}


    async addGrup(dto: {userEmail: string, emailGrup: string[], sendDate: Date, template: string}){
        const user = await this.prisma.user.findUnique({ where: { email: dto.userEmail } });
        if(!user) throw new NotFoundException('Brak urzytkownika o id');
        const emails = await this.prisma.emailGrup.create({data: {userId:user.id, emails: dto.emailGrup, sendTime: dto.sendDate, template: dto.template}})
        return emails;
    }

    async returnUserEmailGrups(email: string){
        console.log(email);
        const user = await this.prisma.user.findUnique({ where: { email: email } });
        if(!user) throw new NotFoundException('Brak urzytkownika o id');
        return this.prisma.emailGrup.findMany({
            where: {userId: user.id},
            orderBy: {createdAt: 'desc'}
        })
    }
}