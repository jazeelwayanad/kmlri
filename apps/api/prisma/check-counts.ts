import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('BibliographicRecord:', await prisma.bibliographicRecord.count());
  console.log('  with kohaBiblionumber:', await prisma.bibliographicRecord.count({ where: { kohaBiblionumber: { not: null } } }));
  console.log('ItemCopy:', await prisma.itemCopy.count());
  console.log('Serial:', await prisma.serial.count());
  console.log('SerialIssue:', await prisma.serialIssue.count());
  console.log('AuthorityRecord:', await prisma.authorityRecord.count());
  console.log('BibliographicHeading:', await prisma.bibliographicHeading.count());
  console.log('Library:', await prisma.library.count());
  console.log('ItemType:', await prisma.itemType.count());
  console.log('AuthorisedValueCategory:', await prisma.authorisedValueCategory.count());
  console.log('AuthorisedValue:', await prisma.authorisedValue.count());
  console.log('MarcFramework:', await prisma.marcFramework.count());
  console.log('MarcFrameworkField:', await prisma.marcFrameworkField.count());
}
main().finally(() => prisma.$disconnect());
