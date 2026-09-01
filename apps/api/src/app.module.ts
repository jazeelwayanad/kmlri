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
import { BookingsModule } from './bookings/bookings.module';
import { AcquisitionsModule } from './acquisitions/acquisitions.module';
import { ReadingListsModule } from './reading-lists/reading-lists.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';
import { ReferenceQuestionsModule } from './reference-questions/reference-questions.module';

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
    BookingsModule,
    AcquisitionsModule,
    ReadingListsModule,
    SavedSearchesModule,
    ReferenceQuestionsModule,
  ],
})
export class AppModule {}
