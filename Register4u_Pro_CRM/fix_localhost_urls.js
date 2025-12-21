// Script to fix all localhost URLs in the project
// This is a temporary file to help with the migration

const filesToFix = [
  // Hotel files
  'src/pages/Hotel/Hotel.jsx',
  'src/pages/Hotel/EditHotel.jsx', 
  'src/pages/Hotel/AddHotel.jsx',
  
  // Travel files
  'src/pages/Travel/Travel.jsx',
  'src/pages/Travel/ViewTravel.jsx',
  'src/pages/Travel/EditTravel.jsx',
  'src/pages/Travel/AddTravel.jsx',
  'src/pages/Travel/TravelAllotmentModal.jsx',
  
  // Driver files
  'src/pages/Driver/Driver.jsx',
  'src/pages/Driver/ViewDriver.jsx',
  'src/pages/Driver/EditDriver.jsx',
  'src/pages/Driver/AddDriver.jsx',
  'src/pages/Driver/DriverReports.jsx',
  
  // Other files
  'src/pages/FileManager/FileManager.jsx',
  'src/components/visitors/VisitorForm.jsx',
  'src/components/ui/PhotoSelector.jsx'
];

const replacements = [
  {
    from: 'http://localhost:4002/api/v1',
    to: '${SERVER_BASE_URL}/api/v1'
  },
  {
    from: 'http://localhost:4002/',
    to: '${SERVER_BASE_URL}/'
  },
  {
    from: 'http://localhost:4002',
    to: '${SERVER_BASE_URL}'
  }
];

console.log('Files that need SERVER_BASE_URL import and URL replacement:');
filesToFix.forEach(file => {
  console.log(`- ${file}`);
});

console.log('\nReplacements needed:');
replacements.forEach(r => {
  console.log(`- Replace: ${r.from}`);
  console.log(`  With: ${r.to}`);
});