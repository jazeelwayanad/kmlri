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
import { SettingsModule } from './settings/settings.module';
import { VendorsModule } from './vendors/vendors.module';
import { DepartmentsModule } from './departments/departments.module';
import { MembershipTypesModule } from './membership-types/membership-types.module';
import { AssetsModule } from './assets/assets.module';
import { CollectionsModule } from './collections/collections.module';
import { SerialsModule } from './serials/serials.module';
import { ReproductionRequestsModule } from './reproduction-requests/reproduction-requests.module';
import { RepositoryModule } from './repository/repository.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { UploadsModule } from './uploads/uploads.module';
import { NotificationsModule } from './notifications/notifications.module';

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
    SettingsModule,
    VendorsModule,
    DepartmentsModule,
    MembershipTypesModule,
    AssetsModule,
    CollectionsModule,
    SerialsModule,
    ReproductionRequestsModule,
    RepositoryModule,
    RegistrationsModule,
    UploadsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
