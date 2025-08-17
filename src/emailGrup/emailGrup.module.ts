import { Module } from '@nestjs/common';
import { EmailGrupsControler } from './emailGrup.controller';
import { EmailGrupService } from './emailGrup.service';

@Module({ controllers: [EmailGrupsControler], providers: [EmailGrupService], exports: [EmailGrupService] })
export class EmailGrupsModule {}
