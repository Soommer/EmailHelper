import { Injectable, InternalServerErrorException, BadGatewayException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

type MailContext = Record<string, any>;
const toBool = (v?: string) => String(v).toLowerCase() === 'true';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private templateCache = new Map<string, Handlebars.TemplateDelegate>();

  constructor() {
    // Ustal secure/port poprawnie:
    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = port === 465;
    const isDev = process.env.NODE_ENV !== 'production';
    const allowSelfSigned = toBool(process.env.SMTP_ALLOW_SELF_SIGNED) && isDev;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure, // 587 => false (STARTTLS), 465 => true
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
      // TLS opcje – DEV ONLY!
      tls: { rejectUnauthorized: false }  // tylko lokalnie, nie w produkcji

    } as nodemailer.TransportOptions);

    // Zarejestruj partiale
    const partialsDir = path.join(process.cwd(), 'src', 'email', 'templates', 'partials');
    if (fs.existsSync(partialsDir)) {
      for (const file of fs.readdirSync(partialsDir)) {
        if (file.endsWith('.hbs')) {
          const partialName = path.basename(file, '.hbs');
          const partialContent = fs.readFileSync(path.join(partialsDir, file), 'utf8');
          Handlebars.registerPartial(partialName, partialContent);
        }
      }
    }
  }

  private compileTemplate(name: string): Handlebars.TemplateDelegate {
    if (this.templateCache.has(name)) return this.templateCache.get(name)!;
    const templatePath = path.join(process.cwd(), 'src', 'email', 'templates', `${name}.hbs`);
    if (!fs.existsSync(templatePath)) throw new InternalServerErrorException(`Brak szablonu: ${name}`);
    const source = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(source, { noEscape: true });
    this.templateCache.set(name, compiled);
    return compiled;
  }

  private wrapWithLayout(html: string, layout = 'base', title = 'Powiadomienie'): string {
    const layoutPath = path.join(process.cwd(), 'src', 'email', 'templates', 'layouts', `${layout}.hbs`);
    if (!fs.existsSync(layoutPath)) return html;
    const layoutTpl = Handlebars.compile(fs.readFileSync(layoutPath, 'utf8'));
    return layoutTpl({ title, body: html });
  }

  async sendTemplateMail(opts: {
    to: string | string[];
    subject: string;
    template: string;
    context: MailContext;
    layout?: string;
    attachments?: nodemailer.SendMailOptions['attachments'];
  }) {
    // Zweryfikuj połączenie 
    try {
      await this.transporter.verify();
    } catch (err: any) {
      const msg = err?.message || 'SMTP verify failed';
      const code = err?.code || 'SMTP_VERIFY_ERROR';
      // 502 dla błędów sieciowych/zewnętrznych
      throw new BadGatewayException(`[SMTP] ${code}: ${msg}`);
    }

    const html = this.compileTemplate(opts.template)(opts.context);
    const wrapped = this.wrapWithLayout(html, opts.layout ?? 'base', opts.subject);

    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
        subject: opts.subject,
        html: wrapped,
        attachments: opts.attachments,
      });
      return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
    } catch (err: any) {
      const msg = err?.message || 'SMTP send failed';
      const code = err?.code || 'SMTP_SEND_ERROR';
      throw new BadGatewayException(`[SMTP] ${code}: ${msg}`);
    }
  }
}
