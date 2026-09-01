import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogModule } from './catalog/catalog.module';
import { CirculationModule } from './circulation/circulation.module';
import { ReportsModule } from './reports/reports.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { RolesModule } from './roles/roles.module';
import { ContentModule } from './content/content.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CatalogModule,
    CirculationModule,
    ReportsModule,
    NewsletterModule,
    ContentModule,
  ],
})
export class AppModule {}
