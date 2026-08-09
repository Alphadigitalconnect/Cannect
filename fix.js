const fs = require('fs');
const files = [
  'src/app/api/messages/route.ts',
  'src/app/api/contact-requests/route.ts',
  'src/app/api/chat-groups/route.ts',
  'src/app/api/connections/route.ts',
  'src/app/api/admin/users/route.ts'
];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (!content.includes('force-dynamic')) {
    fs.writeFileSync(f, 'export const dynamic = "force-dynamic";\n' + content);
  }
});
console.log('Fixed API routes');
