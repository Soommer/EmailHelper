import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiProperty, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { EmailGrupService } from "./emailGrup.service";
import { IsEmail, IsNotEmpty } from "class-validator";

class AddEmilGrupDto {
  @ApiProperty() @IsEmail() userEmail: string;
  @ApiProperty() @IsNotEmpty() emailGrup: string[];
  @ApiProperty() @IsNotEmpty() sendDate: Date;
  @ApiProperty() @IsNotEmpty() template: string;

}

@ApiTags('emailGrups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'USER')
@Controller('emailGrups')
export class EmailGrupsControler{
    constructor (private readonly emailGrups: EmailGrupService){}

    @Post() create(@Req() req,@Body() dto: AddEmilGrupDto) { return this.emailGrups.addGrup(dto)}

    @Get() findEmailGrups(@Req() req) {return this.emailGrups.returnUserEmailGrups(req.user.email)}
}